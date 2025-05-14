
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
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
          .eq('id', Number(session.user.id))
          .maybeSingle();
        
        console.log("Admin check result:", { data, error });
        
        if (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Access Denied",
            description: "Could not verify admin permissions",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        if (!data || data.role !== 'admin') {
          console.log("Admin check failed:", data);
          toast({
            title: "Access Denied",
            description: "You do not have permission to access the admin panel",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        console.log("Admin access granted to:", session.user.email);
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
