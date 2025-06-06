import { Outlet, Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      <nav className="bg-white w-full flex justify-evenly py-4">
        <Link to="/">Home</Link>
        <Link to="/routes">Routes</Link>
        <Link to="/upstreams">Upstreams</Link>
      </nav>
      <Outlet />
    </div>
  );
}

export default App;
