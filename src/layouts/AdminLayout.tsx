import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email?: string;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is an admin
    const checkUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        
        if (!session) {
          toast({
            title: "Authentication required",
            description: "You need to be logged in to access the admin area",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        
        // Check if user has admin role
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking admin status:", error);
          toast({
            title: "Error",
            description: "Could not verify your permissions",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        if (data?.role !== 'admin') {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin area",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error("Error in admin layout:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Admin Panel" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
