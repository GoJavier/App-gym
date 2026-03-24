export default function Navigation({ currentView, navigate }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'routines', icon: '📋', label: 'Entrenar' },
    { id: 'library', icon: '📖', label: 'Ejercicios' },
    { id: 'history', icon: '📊', label: 'Progreso' },
  ];

  return (
    <nav className="nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
