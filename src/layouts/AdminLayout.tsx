
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setShowPasswordDialog(false);
    } else {
      toast({
        title: "Invalid password",
        description: "Please enter the correct admin password",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (showPasswordDialog) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={() => navigate('/')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Authentication</DialogTitle>
            <DialogDescription>
              Please enter the admin password to continue
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
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
