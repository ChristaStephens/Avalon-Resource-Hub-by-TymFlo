export function QuickExit() {
  const handleExit = () => {
    window.location.replace("https://www.weather.com");
    window.open("https://www.weather.com", "_blank");
  };

  return (
    <button
      onClick={handleExit}
      className="quick-exit-btn"
      title="Quickly leave this page"
      aria-label="Quick exit - leave this page immediately"
    >
      ✕ QUICK EXIT
    </button>
  );
}
