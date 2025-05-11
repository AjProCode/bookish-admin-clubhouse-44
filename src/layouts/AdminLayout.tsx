
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the user is authenticated and is an admin
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      // If not logged in, redirect to login
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the admin panel",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin panel",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className={cn("flex-1 flex flex-col")}>
        <AdminHeader title="Admin Dashboard" />
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
        <div className="bg-white border-t p-4 text-center text-xs text-gray-500">
          Skillbag Admin Panel - For authorized personnel only
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
