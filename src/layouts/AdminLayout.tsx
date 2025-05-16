
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserData {
  id: string;
  email?: string;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  
  // Admin credentials with fixed password
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = 'admin@skillbag123';

  useEffect(() => {
    // Check if user is logged in
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
        
        // For demo purposes, check if email matches admin email
        if (session.user.email === adminEmail) {
          console.log("Admin email detected");
          setShowPasswordPrompt(true);
          setIsLoading(false);
          return;
        } else {
          // Redirect non-admin users
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin area",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
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
  }, [navigate, adminEmail]);
  
  const handlePasswordVerification = () => {
    if (password === adminPassword) {
      setIsAdmin(true);
      setShowPasswordPrompt(false);
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin area",
      });
    } else {
      toast({
        title: "Incorrect password",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (showPasswordPrompt) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Please enter the admin password to continue.</p>
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordVerification();
                }
              }}
            />
            <div className="flex justify-end">
              <Button onClick={handlePasswordVerification}>Verify</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
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
