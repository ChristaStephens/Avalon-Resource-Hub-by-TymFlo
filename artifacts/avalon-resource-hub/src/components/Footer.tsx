const base = import.meta.env.BASE_URL || "/";
const tymfloLogo = `${base}tymflo-logo.png`.replace(/\/\//g, "/");

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-license">Licensed for use by Avalon Healing Center</span>
        <div className="site-footer-powered">
          <span>Empowered by</span>
          <a href="https://tymflo.com" target="_blank" rel="noopener noreferrer">
            <img src={tymfloLogo} alt="TymFlo" className="tymflo-logo" />
          </a>
        </div>
      </div>
    </footer>
  );
}
