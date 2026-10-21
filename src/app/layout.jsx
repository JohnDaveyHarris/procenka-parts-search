import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Подбор автозапчастей и аналогов · Проценка",
  description:
    "Двухэтапный подбор номенклатуры: артикул -> производитель -> аналоги, цены и остатки на складах. Тестовое задание: React + Redux Toolkit + Bootstrap.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#16161a" },
  ],
};

/**
 * Применяет тему до первой отрисовки страницы (blocking inline-скрипт):
 * сохранённый выбор в localStorage -> иначе системная схема.
 * Благодаря этому тёмная тема включается без «вспышки» светлого фона.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("procenka-theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
