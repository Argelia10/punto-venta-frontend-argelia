import { Routes, Route, Link } from "react-router-dom";
import Categorias from "./pages/Categorias";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Reportes from "./pages/Reportes"; // <-- NUEVO

function App() {
  return (
    <div>
      <nav style={{ padding: "10px", gap: "15px", display: "flex" }}>
        <Link to="/categorias">Categorías</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/productos">Productos</Link>
        <Link to="/reportes">Reportes</Link> {/* <-- NUEVO */}
      </nav>

      <Routes>
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/reportes" element={<Reportes />} /> {/* <-- NUEVO */}
      </Routes>
    </div>
  );
}

export default App;