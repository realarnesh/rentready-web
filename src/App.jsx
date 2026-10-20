import { NavLink, Route, Routes } from "react-router-dom";
import ListingsPage from "./pages/ListingsPage.jsx";
import UnitDetailPage from "./pages/UnitDetailPage.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";

export default function App() {
  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="brand">RentReady</NavLink>
        <nav>
          <NavLink to="/" end>Find a home</NavLink>
          <NavLink to="/agent">Leasing agent</NavLink>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/units/:id" element={<UnitDetailPage />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="*" element={<p className="muted">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
