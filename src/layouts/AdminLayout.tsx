
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path === '/admin/books') return 'Books Management';
    if (path === '/admin/users') return 'Users Management';
    if (path === '/admin/settings') return 'Settings';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={getPageTitle()} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
