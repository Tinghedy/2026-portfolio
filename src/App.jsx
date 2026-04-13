import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Cursor from "./components/Cursor/Cursor";
import AuthGuard from "./components/AuthGuard/AuthGuard";

// Public pages
import Home from "./pages/Home/Home";
import Works from "./pages/Works/Works";
import WorkDetail from "./pages/Works/WorkDetail";
import Blog from "./pages/Blog/Blog";
import BlogPost from "./pages/Blog/BlogPost";
import Portfolio from "./pages/Portfolio/Portfolio";

// Admin pages — no Navbar on these
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProjectForm from "./pages/admin/ProjectForm";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Admin routes (no public Navbar) ── */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/new"
          element={
            <AuthGuard>
              <ProjectForm />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <AuthGuard>
              <ProjectForm />
            </AuthGuard>
          }
        />

        {/* ── Public routes ── */}
        <Route
          path="/*"
          element={
            <>
              <Cursor />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/works" element={<Works />} />
                <Route path="/works/:id" element={<WorkDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/portfolio" element={<Portfolio />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
