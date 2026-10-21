import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Базовые значения можно переопределить через .env (HSPRICE_BASE, HSPRICE_KEY)
const DEFAULT_BASE = "http://api.favorit-parts.ru/hs/hsprice/";
const DEFAULT_KEY = "00000000-0000-0000-0000-000000000001";

/**
 * Прокси к внешнему API «Проценка».
 *
 * Зачем он нужен:
 *  1) Внешний сервис отвечает только по http - со https-страницы браузер
 *     блокирует такие запросы (mixed content);
 *  2) Внешний сервис не отдаёт CORS-заголовки для прямых браузерных запросов.
 *
 * Прокси отдаёт клиенту ответ «как есть» (JSON внешнего сервиса) либо
 * единообразную ошибку { error: [ ... ] } с HTTP 200 - так клиентский
 * код всегда парсит предсказуемую структуру.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const base = process.env.HSPRICE_BASE || DEFAULT_BASE;
  const key = process.env.HSPRICE_KEY || DEFAULT_KEY;

  const upstream = new URL(base);
  // Ключ покупателя храним на сервере, клиент его не видит
  upstream.searchParams.set("key", key);

  // Пробрасываем только разрешённые параметры; URLSearchParams корректно
  // кодирует спецсимволы в артикуле и производителе (требование документации)
  const ALLOWED = ["number", "brand", "analogues", "info"];
  for (const param of ALLOWED) {
    const value = searchParams.get(param);
    if (value) upstream.searchParams.set(param, value);
  }

  try {
    const response = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(18000),
      headers: { Accept: "application/json" },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({
        error: ["Внешний сервис вернул некорректный ответ (не JSON)"],
      });
    }
    return NextResponse.json(data);
  } catch (err) {
    const reason =
      err?.name === "TimeoutError"
        ? "превышено время ожидания ответа"
        : err?.message || "сбой сети";
    return NextResponse.json({ error: [`Внешний сервис недоступен: ${reason}`] });
  }
}
