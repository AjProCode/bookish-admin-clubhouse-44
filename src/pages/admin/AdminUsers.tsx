
import React, { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import UserDetailsView from '@/components/admin/UserDetailsView';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { 
  UserDetails, 
  UserStatus
} from '@/models/UserBook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('join_date', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const formattedUsers: UserDetails[] = data.map(profile => ({
        id: profile.id,
        name: profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
        email: profile.email || '',
        role: (profile.role === 'admin' ? 'admin' : 'member') as 'admin' | 'member',
        status: profile.status as UserStatus || 'inactive',
        joinDate: profile.join_date || new Date().toLocaleDateString(),
        booksRead: profile.books_read || 0,
        userBooks: []
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const handleAddUser = async (userData: any) => {
    setIsLoading(true);
    
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      });

      if (authError) {
        toast({
          title: "Error creating user",
          description: authError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Profile will be created automatically by the trigger
      await fetchUsers();
      setIsAddDialogOpen(false);
      
      toast({
        title: "User Added",
        description: `${userData.firstName} ${userData.lastName} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
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

  const handleChangePassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setNewPassword('');
      setIsPasswordDialogOpen(true);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser || !newPassword) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        currentUser.id,
        { password: newPassword }
      );

      if (error) {
        toast({
          title: "Error updating password",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password updated",
          description: `Password updated successfully for ${currentUser.name}`,
        });
        setIsPasswordDialogOpen(false);
        setNewPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };
  
  const handleUpdateUser = async (userData: any) => {
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          first_name: userData.firstName,
          last_name: userData.lastName
        })
        .eq('id', currentUser.id);

      if (error) {
        toast({
          title: "Error updating user",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await fetchUsers();
        setIsEditDialogOpen(false);
        setCurrentUser(null);
        
        toast({
          title: "User Updated",
          description: `${userData.firstName} ${userData.lastName}'s information has been updated.`,
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
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
        toast({
          title: "Error updating status",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await fetchUsers();
        const actionText = newStatus === 'active' ? 'activated' : 'deactivated';
        
        toast({
          title: `User ${actionText}`,
          description: `${userToUpdate.name}'s account has been ${actionText}.`,
        });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleManageSubscription = (userId: string) => {
    // Implementation for subscription management
    toast({
      title: "Feature Coming Soon",
      description: "Subscription management will be available soon.",
    });
  };
  
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
            <p className="text-gray-500">Users will appear here when they register or are added by admins.</p>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onEdit={handleEditUser}
            onViewDetails={handleViewUserDetails}
            onToggleStatus={handleToggleUserStatus}
            onManageSubscription={handleManageSubscription}
            onChangePassword={handleChangePassword}
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
            isLoading={isLoading}
            includePassword={true}
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
                status: currentUser.status,
                firstName: currentUser.name.split(' ')[0] || '',
                lastName: currentUser.name.split(' ').slice(1).join(' ') || ''
              }}
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
              onUpdateSubscription={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update password for {currentUser?.name}
          </DialogDescription>
          <Card>
            <CardHeader>
              <CardTitle>New Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </CardContent>
            <CardContent className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                disabled={isLoading || !newPassword} 
                onClick={handleUpdatePassword}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
