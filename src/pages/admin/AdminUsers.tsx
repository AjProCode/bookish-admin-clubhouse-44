import React, { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import UserDetailsView from '@/components/admin/UserDetailsView';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
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
        joinDate: new Date(profile.created_at).toLocaleDateString(),
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
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'tempPass123!', // Temporary password
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
            role: userData.role,
            status: userData.status
          });

        if (profileError) throw profileError;

        await fetchUsers();
        setIsAddDialogOpen(false);
        
        toast({
          title: "User Added",
          description: `${userData.name} has been added as a ${userData.role}.`,
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
          role: userData.role,
          status: userData.status,
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
    </div>
  );
};

export default AdminUsers;