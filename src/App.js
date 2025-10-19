import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UmatManagement from './components/UmatManagement';
import KegiatanManagement from './components/KegiatanManagement';
import PengumumanManagement from './components/PengumumanManagement';
import GaleriManagement from './components/GaleriManagement';
import PendaftaranManagement from './components/PendaftaranManagement';
import SumbanganManagement from './components/SumbanganManagement';
import SaranManagement from './components/SaranManagement';
import MerchandiseManagement from './components/MerchandiseManagement';
import StrukturManagement from './components/StrukturManagement';
import InfoUmumManagement from './components/InfoUmumManagement';
import AbsensiManagement from './components/AbsensiManagement';
import AdminManagement from './components/AdminManagement';
import QRScan from './components/QRScan';
import ActivityLog from './components/ActivityLog';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RefreshProvider } from './contexts/RefreshContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <RefreshProvider>
        <Router>
          <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/umat" element={
              <ProtectedRoute>
                <AdminLayout>
                  <UmatManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/kegiatan" element={
              <ProtectedRoute>
                <AdminLayout>
                  <KegiatanManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/pengumuman" element={
              <ProtectedRoute>
                <AdminLayout>
                  <PengumumanManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/galeri" element={
              <ProtectedRoute>
                <AdminLayout>
                  <GaleriManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran" element={
              <ProtectedRoute>
                <AdminLayout>
                  <PendaftaranManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/sumbangan" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SumbanganManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/saran" element={
              <ProtectedRoute>
                <AdminLayout>
                  <SaranManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/merchandise" element={
              <ProtectedRoute>
                <AdminLayout>
                  <MerchandiseManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/struktur" element={
              <ProtectedRoute>
                <AdminLayout>
                  <StrukturManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/info-umum" element={
              <ProtectedRoute>
                <AdminLayout>
                  <InfoUmumManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/absensi" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AbsensiManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute>
                <AdminLayout>
                  <QRScan />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/activitylog" element={
              <ProtectedRoute>
                <AdminLayout>
                  <ActivityLog />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
      </RefreshProvider>
    </AuthProvider>
  );
}

export default App;
