import { useLocation } from "wouter";

const base = import.meta.env.BASE_URL || "/";
const tymfloLogo = `${base}tymflo-logo.png`.replace(/\/\//g, "/");
const year = new Date().getFullYear();

export function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-links">
          <a
            href="https://avalonhealing.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-back-to-avalon"
          >
            ← Back to Avalon
          </a>
          <button
            onClick={() => navigate("/staff")}
            className="footer-staff-link"
          >
            Staff Access
          </button>
          <a
            href={`${base}staff-guide.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-staff-link"
          >
            Staff Guide
          </a>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-left">
            <span className="site-footer-license">Licensed for use by Avalon Healing Center</span>
            <span className="site-footer-copyright">
              &copy; {year} Avalon Healing Center. All rights reserved.
            </span>
          </div>
          <div className="site-footer-powered">
            <span>Empowered by</span>
            <a href="https://tymflo.com" target="_blank" rel="noopener noreferrer">
              <img src={tymfloLogo} alt="TymFlo" className="tymflo-logo" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
