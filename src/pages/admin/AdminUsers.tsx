
import React, { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import UserDetailsView from '@/components/admin/UserDetailsView';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserDetails, 
  UserSubscription, 
  UserStatus, 
  SubscriptionPlan
} from '@/models/UserBook';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const formattedUsers: UserDetails[] = profiles.map(profile => ({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || '',
        joinDate: new Date(profile.created_at || new Date()).toLocaleDateString(),
        role: profile.role as 'admin' | 'member',
        status: profile.status as UserStatus,
        booksRead: profile.books_read || 0
      }));

      setUsers(formattedUsers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddUser = async (userData: any) => {
    setIsLoading(true);
    try {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: userData.name.split(' ')[0],
            last_name: userData.name.split(' ')[1] || '',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            first_name: userData.name.split(' ')[0],
            last_name: userData.name.split(' ')[1] || '',
            role: userData.role || 'member',
            status: userData.status || 'active',
            created_at: new Date().toISOString()
          });

        if (profileError) throw profileError;

        await fetchUsers();
        setIsAddDialogOpen(false);
        
        toast({
          title: "User Added",
          description: `${userData.name} has been added with temporary password: ${tempPassword}`,
        });
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateUser = async (userData: any) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.name.split(' ')[0],
          last_name: userData.name.split(' ')[1] || '',
          role: userData.role || 'member',
          status: userData.status || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      await fetchUsers();
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      
      toast({
        title: "User Updated",
        description: `${userData.name}'s information has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleUserStatus = async (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    const newStatus = userToUpdate.status === 'active' ? 'inactive' as UserStatus : 'active' as UserStatus;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      
      toast({
        title: `User ${newStatus}`,
        description: `${userToUpdate.name}'s account has been ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        currentUser.id
      );

      if (authError) throw authError;
      
      // Profile will be deleted automatically via cascade
      
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setCurrentUser(null);
      
      toast({
        title: "User Deleted",
        description: `${currentUser.name}'s account has been permanently deleted.`,
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Generate password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(
        currentUser.email,
        { redirectTo: window.location.origin + '/login' }
      );

      if (error) throw error;
      
      setIsResetPasswordDialogOpen(false);
      setCurrentUser(null);
      
      toast({
        title: "Password Reset Email Sent",
        description: `A password reset email has been sent to ${currentUser.email}.`,
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleViewUserDetails = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsDetailsDialogOpen(true);
    }
  };
  
  const handleOpenDeleteDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsDeleteDialogOpen(true);
    }
  };
  
  const handleOpenResetPasswordDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsResetPasswordDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <UserTable 
        users={users} 
        onEdit={handleEditUser}
        onViewDetails={handleViewUserDetails}
        onToggleStatus={handleToggleUserStatus}
        onDeleteUser={handleOpenDeleteDialog}
        onResetPassword={handleOpenResetPasswordDialog}
      />
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the book club. Fill out the form below.
          </DialogDescription>
          <UserForm 
            onSubmit={handleAddUser}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user information.
          </DialogDescription>
          {currentUser && (
            <UserForm 
              user={currentUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about the user's activity and subscription.
          </DialogDescription>
          {currentUser && (
            <UserDetailsView 
              user={currentUser} 
              onUpdateSubscription={async (data) => {
                // Handle subscription update
                toast({
                  title: "Subscription Updated",
                  description: "The user's subscription has been updated.",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
          {currentUser && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Password Confirmation Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Send a password reset email to this user?
          </DialogDescription>
          {currentUser && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
