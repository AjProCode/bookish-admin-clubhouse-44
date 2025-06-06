
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('join_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      
      if (data) {
        const formattedUsers: UserDetails[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Unknown User',
          email: profile.email || '',
          joinDate: profile.join_date || new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          role: profile.role as 'admin' | 'member' || 'member',
          status: profile.status as UserStatus || 'active',
          booksRead: profile.books_read || 0,
          userBooks: [],
          readingLogs: []
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleAddUser = async (userData: any) => {
    try {
      setIsSaving(true);
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: userData.name.split(' ')[0],
          last_name: userData.name.split(' ').slice(1).join(' ')
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // Create profile
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: userData.email,
            first_name: userData.name.split(' ')[0],
            last_name: userData.name.split(' ').slice(1).join(' '),
            name: userData.name,
            role: userData.role || 'member',
            status: userData.status || 'active',
            books_read: 0,
            join_date: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          })
          .select()
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        await fetchUsers(); // Refresh the list
        setIsAddDialogOpen(false);
        
        toast({
          title: "User Added",
          description: `${userData.name} has been added successfully.`,
        });
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: `Failed to add user: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
  
  const handleUpdateUser = async (userData: any) => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status
        })
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      await fetchUsers(); // Refresh the list
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
        description: `Failed to update user: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
      
      if (error) {
        throw error;
      }
      
      await fetchUsers(); // Refresh the list
      
      const actionText = newStatus === 'active' ? 'activated' : 'deactivated';
      toast({
        title: `User ${actionText}`,
        description: `${userToUpdate.name}'s account has been ${actionText}.`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: `Failed to update user status: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading users...</div>;
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-500">Users will appear here when they register or when you add them.</p>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onEdit={handleEditUser}
            onViewDetails={handleViewUserDetails}
            onToggleStatus={handleToggleUserStatus}
          />
        )}
      </div>
      
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
            isLoading={isSaving}
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
              user={{
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role,
                status: currentUser.status
              }}
              onSubmit={handleUpdateUser}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isSaving}
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
              onUpdateSubscription={(data) => {
                // Handle subscription updates if needed
                console.log('Subscription update:', data);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
