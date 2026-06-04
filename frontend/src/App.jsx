import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages imports
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CropHealth from './pages/CropHealth';
import WeatherForecast from './pages/WeatherForecast';
import PestControl from './pages/PestControl';
import CropRecommendation from './pages/CropRecommendation';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import MarketPrices from './pages/MarketPrices';
import FarmMap from './pages/FarmMap';
import Community from './pages/Community';
import Chatbot from './pages/Chatbot';
import Marketplace from './pages/Marketplace';
import GovernmentNotices from './pages/GovernmentNotices';

// Layout shell for members/authenticated routes
const MemberLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 pt-16 overflow-hidden relative" style={{ height: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 md:pl-64 overflow-y-auto flex flex-col w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <TranslationProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Member Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <MemberLayout>
                <Dashboard />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/weather" element={
            <PrivateRoute>
              <MemberLayout>
                <WeatherForecast />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/crop-health" element={
            <PrivateRoute>
              <MemberLayout>
                <CropHealth />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/pest-control" element={
            <PrivateRoute>
              <MemberLayout>
                <PestControl />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/crop-rec" element={
            <PrivateRoute>
              <MemberLayout>
                <CropRecommendation />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/fertilizer-rec" element={
            <PrivateRoute>
              <MemberLayout>
                <FertilizerRecommendation />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/market-prices" element={
            <PrivateRoute>
              <MemberLayout>
                <MarketPrices />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/gps-mapping" element={
            <PrivateRoute>
              <MemberLayout>
                <FarmMap />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/marketplace" element={
            <PrivateRoute>
              <MemberLayout>
                <Marketplace />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/community" element={
            <PrivateRoute>
              <MemberLayout>
                <Community />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/chatbot" element={
            <PrivateRoute>
              <MemberLayout>
                <Chatbot />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <MemberLayout>
                <Profile />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <MemberLayout>
                <AdminDashboard />
              </MemberLayout>
            </PrivateRoute>
          } />
          <Route path="/gov-notices" element={
            <PrivateRoute>
              <MemberLayout>
                <GovernmentNotices />
              </MemberLayout>
            </PrivateRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
        </AuthProvider>
      </TranslationProvider>
    </Router>
  );
};

export default App;
