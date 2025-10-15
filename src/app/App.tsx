import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import About from "@/page/About";
import Home from "@/page/Home";
import PageDetail from "@/page/PageDetails";

function App() {
  return (
    <Router>
      <div>
        {/* Header con logo y navegación */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
          {/* Logo de la tienda */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Store Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">Mi Tienda</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              About
            </Link>
          </nav>
        </header>

        {/* Rutas principales */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:id" element={<PageDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
