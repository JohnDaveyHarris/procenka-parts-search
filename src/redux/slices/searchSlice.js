import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPriceList, groupBrands, flattenOffers } from "@/services/hspriceApi";

/** Сколько предложений показывать в таблице за один раз («Показать ещё») */
export const PAGE_SIZE = 25;

/**
 * Этап 1 - поиск производителей по артикулу.
 */
export const fetchBrands = createAsyncThunk(
  "search/fetchBrands",
  async (article, { signal }) => {
    const items = await fetchPriceList({ number: article }, signal);
    return { article, brands: groupBrands(items) };
  }
);

/**
 * Этап 2 - аналоги и предложения по артикулу + производителю.
 */
export const fetchAnalogues = createAsyncThunk(
  "search/fetchAnalogues",
  async ({ article, brand }, { signal }) => {
    const items = await fetchPriceList(
      { number: article, brand, analogues: true, info: true },
      signal
    );
    return { article, brand, offers: flattenOffers(items) };
  }
);

const idleAnalogues = () => ({
  status: "idle",
  error: null,
  items: [],
});

const initialState = {
  /** Артикул, по которому выполнен (выполняется) поиск */
  query: "",
  /** Этап 1: сводка по производителям */
  brands: {
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    items: [],
    requestId: null,
  },
  /** Выбранный на шаге 2 производитель */
  selectedBrand: null,
  /** Этап 2: аналоги и предложения */
  analogues: idleAnalogues(),
  visibleCount: PAGE_SIZE,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    /** Пользователь выбрал производителя (перед запросом аналогов) */
    selectBrand(state, action) {
      state.selectedBrand = action.payload;
    },
    /** Снятие выбора производителя (крестик на чипе) - возврат к шагу 2 */
    clearBrand(state) {
      state.selectedBrand = null;
      state.analogues = idleAnalogues();
      state.visibleCount = PAGE_SIZE;
    },
    /** Полный сброс к первому шагу (очистка поля ввода) */
    resetSearch() {
      return initialState;
    },
    showMore(state) {
      state.visibleCount = Math.min(
        state.visibleCount + PAGE_SIZE,
        state.analogues.items.length
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Этап 1: производители ---
      .addCase(fetchBrands.pending, (state, action) => {
        state.query = action.meta.arg;
        state.brands.status = "loading";
        state.brands.error = null;
        // фиксируем id запроса, чтобы игнорировать ответ устаревшего запроса
        state.brands.requestId = action.meta.requestId;
        state.selectedBrand = null;
        state.analogues = idleAnalogues();
        state.visibleCount = PAGE_SIZE;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = "succeeded";
        state.brands.items = action.payload.brands;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = "failed";
        state.brands.error =
          action.error?.message || "Не удалось получить список производителей.";
      })
      // --- Этап 2: аналоги ---
      .addCase(fetchAnalogues.pending, (state, action) => {
        state.analogues.status = "loading";
        state.analogues.error = null;
        state.analogues.requestId = action.meta.requestId;
        state.visibleCount = PAGE_SIZE;
      })
      .addCase(fetchAnalogues.fulfilled, (state, action) => {
        if (state.analogues.requestId !== action.meta.requestId) return;
        state.analogues.status = "succeeded";
        state.analogues.items = action.payload.offers;
      })
      .addCase(fetchAnalogues.rejected, (state, action) => {
        if (state.analogues.requestId !== action.meta.requestId) return;
        state.analogues.status = "failed";
        state.analogues.error =
          action.error?.message || "Не удалось получить аналоги и предложения.";
      });
  },
});

export const { selectBrand, clearBrand, resetSearch, showMore } =
  searchSlice.actions;

export default searchSlice.reducer;
