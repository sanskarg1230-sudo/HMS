import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ActivateAccount from './pages/ActivateAccount';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Super Admin — standalone, no Navbar/Footer */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />

        {/* Admin Dashboard — standalone, has its own head */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Student Dashboard — standalone, has its own header */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Public pages — wrapped with Navbar + Footer */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-surface flex flex-col font-body text-on-surface">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/invite/:token" element={<ActivateAccount />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Routes>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
