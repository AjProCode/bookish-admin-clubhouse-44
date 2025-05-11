
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className={cn("flex-1 flex flex-col")}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
