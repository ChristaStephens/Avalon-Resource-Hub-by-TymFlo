import { QuickExit } from "./QuickExit";

interface HeaderProps {
  showStaffLink?: boolean;
}

export function Header({ showStaffLink = true }: HeaderProps) {
  const base = import.meta.env.BASE_URL || "/";
  const logoPath = `${base}avalon-logo.jpg`.replace(/\/\//g, "/");

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <a href="https://avalonusa.org" target="_blank" rel="noopener noreferrer" className="header-logo-link">
            <img src={logoPath} alt="Avalon Healing Center" className="header-logo" />
          </a>
          <div className="header-title-group">
            <h1 className="header-title">Resource Hub</h1>
            <p className="header-subtitle">Community resources for survivors</p>
          </div>
        </div>
        <div className="header-right">
          {showStaffLink && (
            <a href="#/staff" className="staff-link">
              Staff Access
            </a>
          )}
          <a
            href="https://avalonusa.org"
            target="_blank"
            rel="noopener noreferrer"
            className="back-to-avalon"
          >
            ← Back to Avalon
          </a>
          <QuickExit />
        </div>
      </div>
    </header>
  );
}
