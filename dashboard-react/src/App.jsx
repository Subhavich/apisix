import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import "./App.css";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <nav className="bg-white border-b shadow-sm px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-semibold">My Dashboard</div>

          {/* Hamburger button on small screens */}
          <button
            className="md:hidden text-2xl text-black"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>

          {/* Horizontal nav for medium+ screens */}
          <div className="hidden md:flex gap-6">
            <Link to="/" className="hover:text-blue-500">
              Home
            </Link>
            <Link to="/routes" className="hover:text-blue-500">
              Routes
            </Link>
            <Link to="/upstreams" className="hover:text-blue-500">
              Upstreams
            </Link>
          </div>
        </div>

        {/* Dropdown menu for mobile */}
        {isOpen && (
          <div className="flex flex-col gap-4 mt-4 md:hidden">
            <Link to="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/routes" onClick={() => setIsOpen(false)}>
              Routes
            </Link>
            <Link to="/upstreams" onClick={() => setIsOpen(false)}>
              Upstreams
            </Link>
          </div>
        )}
      </nav>

      <main className="px-4 mt-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
