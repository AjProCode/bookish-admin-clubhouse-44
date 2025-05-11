
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access the admin panel",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        // Check if user has admin role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error || !data || data.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the admin panel",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "An error occurred",
          description: "Could not verify admin permissions",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Verifying admin access...</div>;
  }
  
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
