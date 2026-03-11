import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Import halaman yang sudah dibuat
import WelcomePage from "./pages/auth/WelcomePage";
import RegisterPage from "./pages/auth/RegisterPage";
// Import LoginPage nanti jika sudah dibuat
// import LoginPage from "./pages/auth/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route untuk Register */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Route untuk Login (sementara arahkan ke register dulu jika belum ada) */}
        <Route path="/login" element={<RegisterPage />} />

        {/* Redirect default ke register jika akses root (/) */}
        <Route path="/" element={<WelcomePage />} />

        {/* Page Not Found (Opsional) */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              404 - Halaman Tidak Ditemukan
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
