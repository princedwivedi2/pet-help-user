import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home/Home';
import FindVets from './pages/FindVets/FindVets';
import VetDetail from './pages/VetDetail/VetDetail';
import SOS from './pages/SOS/SOS';
import Pets from './pages/Pets/Pets';
import Appointments from './pages/Appointments/Appointments';
import Guides from './pages/Guides/Guides';
import GuideDetail from './pages/GuideDetail/GuideDetail';
import Blog from './pages/Blog/Blog';
import BlogPost from './pages/BlogPost/BlogPost';
import Community from './pages/Community/Community';
import CommunityPost from './pages/CommunityPost/CommunityPost';
import Profile from './pages/Profile/Profile';
import Notifications from './pages/Notifications/Notifications';
import Payments from './pages/Payments/Payments';
import Legal from './pages/Legal/Legal';
import VetApply from './pages/VetApply/VetApply';
import VetApplySuccess from './pages/VetApplySuccess/VetApplySuccess';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vet/apply" element={<VetApply />} />
      <Route path="/vet/apply/success" element={<VetApplySuccess />} />

      {/* Public pages with layout */}
      <Route element={<Layout />}>
        <Route path="/find-vets" element={<FindVets />} />
        <Route path="/vets/:uuid" element={<VetDetail />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:uuid" element={<BlogPost />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:uuid" element={<CommunityPost />} />
        <Route path="/legal/:type" element={<Legal />} />
      </Route>

      {/* Protected pages with layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
