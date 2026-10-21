export default function Footer() {
  return (
    <footer className="app-footer mt-auto">
      <div className="container-xl footer-inner">
        <span>
          Тестовое задание · React · Redux Toolkit · Bootstrap 5
        </span>
        <span>
          Данные - веб-сервис{" "}
          <a
            href="http://api.favorit-parts.ru/hs/hsprice/"
            target="_blank"
            rel="noreferrer noopener"
          >
            «Проценка»
          </a>
        </span>
      </div>
    </footer>
  );
}
