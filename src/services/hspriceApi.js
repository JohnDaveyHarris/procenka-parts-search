/**
 * Клиент веб-сервиса «Проценка» (wsprice).
 *
 * Приложение - клиентское: оно ходит в API с браузера через тонкий прокси
 * /api/hsprice (см. src/app/api/hsprice/route.js). Прокси существует только
 * потому, что внешний сервис работает по http без CORS-заголовков.
 * Для чисто SPA-деплоя достаточно заменить PROXY_URL на прямой адрес сервиса.
 */

const PROXY_URL = "/api/hsprice";

/** Технический признак «пустой» записи-заглушки из ответа API */
const EMPTY_GOODS_ID = "00000000-0000-0000-0000-000000000000";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Единая точка запроса к сервису. Бросает Error с человекочитаемым
 * сообщением; ошибки прерывания (AbortError) пробрасывает как есть.
 */
async function request(params, signal) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([name, value]) => {
    // analogues/info - булевы флаги: добавляются ниже в формате «on»
    if (name === "analogues" || name === "info") return;
    if (value !== undefined && value !== null && value !== "") {
      qs.set(name, String(value));
    }
  });
  if (params.analogues) qs.set("analogues", "on");
  if (params.info) qs.set("info", "on");

  let response;
  try {
    response = await fetch(`${PROXY_URL}?${qs.toString()}`, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Не удалось связаться с сервером. Проверьте подключение к сети.");
  }

  if (!response.ok) {
    throw new Error(`Сервис ответил ошибкой ${response.status}. Попробуйте ещё раз.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Сервер вернул некорректный ответ.");
  }

  // Ошибки API: «error» может быть строкой или массивом строк
  if (data && data.error) {
    const message = Array.isArray(data.error)
      ? data.error.join(". ")
      : String(data.error);
    throw new Error(message);
  }

  const goods = Array.isArray(data?.goods) ? data.goods : [];

  // «Если товар не найден, возвращается массив с одним элементом
  //  в виде пустой структуры ответа» - отфильтровываем заглушки
  return goods.filter(
    (item) =>
      item &&
      item.goodsID !== EMPTY_GOODS_ID &&
      (item.brand || item.number || item.name)
  );
}

/** Приводит позицию из ответа API к плоской структуре приложения */
function normalizeItem(item) {
  const warehouses = (item.warehouses || []).map((w) => ({
    id: w.id || null,
    code: w.code || w.id || "Склад",
    own: Boolean(w.own),
    price: toNumber(w.price),
    stock: toNumber(w.stock) ?? 0,
    shipmentDate: w.shipmentDate || null,
    notRefund: Boolean(w.notRefund),
  }));

  // Лучшие предложения - первыми: с остатком и по возрастанию цены
  warehouses.sort((a, b) => {
    const stockDiff = (b.stock > 0) - (a.stock > 0);
    if (stockDiff) return stockDiff;
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });

  // Цена берётся из конкретного склада (поле price у goods устарело -
  // «НЕ ИСПОЛЬЗОВАТЬ», оставлено для совместимости)
  const withStock = warehouses.filter((w) => w.stock > 0 && w.price != null);
  const anyPrice = warehouses.filter((w) => w.price != null);
  const source = withStock.length ? withStock : anyPrice;
  const minPrice = source.length
    ? Math.min(...source.map((w) => w.price))
    : null;

  return {
    goodsID: item.goodsID || null,
    brand: item.brand || "-",
    number: item.number || "-",
    name: item.name || item.number || "Без названия",
    count: toNumber(item.count) ?? 0,
    rate: toNumber(item.rate) ?? 1,
    notRefund: Boolean(item.notRefund),
    isOriginal: Boolean(item.isOriginal),
    minPrice,
    warehouses,
    analogues: Array.isArray(item.analogues) ? item.analogues : [],
  };
}

/**
 * Этап 1 (без brand) и этап 2 (с brand + analogues=on).
 * Возвращает нормализованный список позиций.
 */
export async function fetchPriceList(params, signal) {
  const items = await request(params, signal);
  return items.map(normalizeItem);
}

/** Шаг 1: сводка по производителям для артикула */
export function groupBrands(items) {
  const map = new Map();
  for (const item of items) {
    const existing = map.get(item.brand) || {
      brand: item.brand,
      name: item.name,
      count: 0,
      minPrice: null,
    };
    existing.count += item.count;
    if (
      item.minPrice != null &&
      (existing.minPrice == null || item.minPrice < existing.minPrice)
    ) {
      existing.minPrice = item.minPrice;
    }
    map.set(item.brand, existing);
  }

  return [...map.values()].sort((a, b) => {
    // сначала бренды с наличием, затем по минимальной цене, затем по алфавиту
    const stockDiff = (b.count > 0) - (a.count > 0);
    if (stockDiff) return stockDiff;
    if (a.minPrice != null && b.minPrice != null) return a.minPrice - b.minPrice;
    if (a.minPrice != null) return -1;
    if (b.minPrice != null) return 1;
    return a.brand.localeCompare(b.brand, "ru");
  });
}

/** Шаг 2: искомая позиция + все аналоги одной плоским списком */
export function flattenOffers(items) {
  const offers = [];
  const seen = new Set();

  for (const item of items) {
    const original = { ...item, isOriginal: true };
    if (item.goodsID && !seen.has(item.goodsID)) {
      seen.add(item.goodsID);
      offers.push(original);
    }
    for (const raw of item.analogues || []) {
      const analogue = normalizeItem(raw);
      if (analogue.goodsID && !seen.has(analogue.goodsID)) {
        seen.add(analogue.goodsID);
        offers.push(analogue);
      }
    }
  }

  return offers.sort((a, b) => {
    // искомая деталь - первой; далее: с наличием -> по цене -> без цены в конец
    if (a.isOriginal !== b.isOriginal) return a.isOriginal ? -1 : 1;
    const stockDiff = (b.count > 0) - (a.count > 0);
    if (stockDiff) return stockDiff;
    if (a.minPrice == null && b.minPrice == null) return 0;
    if (a.minPrice == null) return 1;
    if (b.minPrice == null) return -1;
    return a.minPrice - b.minPrice;
  });
}
