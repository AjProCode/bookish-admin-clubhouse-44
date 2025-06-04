
import React, { useState } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import UserDetailsView from '@/components/admin/UserDetailsView';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { 
  UserDetails, 
  UserSubscription, 
  UserReadingLog, 
  UserStatus, 
  UserBook, 
  ReadingStatus,
  SubscriptionPlan
} from '@/models/UserBook';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    plan: '',
    status: 'active'
  });
  
  const handleAddUser = (userData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newUser: UserDetails = {
        ...userData,
        id: Date.now().toString(),
        joinDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: userData.status as UserStatus,
        booksRead: 0,
        userBooks: []
      };
      
      // Add subscription if selected
      if (userData.subscription) {
        newUser.subscription = {
          id: `subscription-${Date.now()}`,
          userId: newUser.id,
          plan: userData.subscription as SubscriptionPlan,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          nextDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          booksDelivered: 0
        };
      }
      
      setUsers([newUser, ...users]);
      setIsAddDialogOpen(false);
      setIsLoading(false);
      
      toast({
        title: "User Added",
        description: `${userData.name} has been added as a ${userData.role}.`,
      });
    }, 1000);
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
  
  const handleManageSubscription = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setSubscriptionData({
        plan: user.subscription?.plan || '',
        status: user.subscription?.isActive ? 'active' : 'inactive'
      });
      setIsSubscriptionDialogOpen(true);
    }
  };
  
  const handleUpdateUser = (userData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === currentUser?.id ? { 
          ...user, 
          ...userData,
          status: userData.status as UserStatus 
        } : user
      );
      
      setUsers(updatedUsers);
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      setIsLoading(false);
      
      toast({
        title: "User Updated",
        description: `${userData.name}'s information has been updated.`,
      });
    }, 1000);
  };
  
  const handleToggleUserStatus = (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    const newStatus = userToUpdate.status === 'active' ? 'inactive' as UserStatus : 'active' as UserStatus;
    const actionText = newStatus === 'active' ? 'activated' : 'deactivated';
    
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    );
    
    setUsers(updatedUsers);
    
    toast({
      title: `User ${actionText}`,
      description: `${userToUpdate.name}'s account has been ${actionText}.`,
    });
  };

  const handleUpdateSubscription = (userId: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          // If user had no subscription before, create one
          if (!user.subscription && subscriptionData.plan) {
            return {
              ...user,
              subscription: {
                id: `subscription-${Date.now()}`,
                userId: user.id,
                plan: subscriptionData.plan as SubscriptionPlan,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                isActive: subscriptionData.status === 'active',
                nextDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                booksDelivered: 0
              }
            };
          }
          // If user has an existing subscription
          else if (user.subscription) {
            // If removing subscription
            if (!subscriptionData.plan) {
              const { subscription, ...userWithoutSubscription } = user;
              return userWithoutSubscription;
            }
            // If updating subscription
            return {
              ...user,
              subscription: {
                ...user.subscription,
                plan: subscriptionData.plan as SubscriptionPlan,
                isActive: subscriptionData.status === 'active'
              }
            };
          }
        }
        return user;
      });
      
      setUsers(updatedUsers as UserDetails[]);
      setIsLoading(false);
      setIsSubscriptionDialogOpen(false);
      setCurrentUser(null);
      
      toast({
        title: "Subscription Updated",
        description: `User's subscription has been updated.`,
      });
    }, 1000);
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
            <p className="text-gray-500">Add users to get started managing your community.</p>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onEdit={handleEditUser}
            onViewDetails={handleViewUserDetails}
            onToggleStatus={handleToggleUserStatus}
            onManageSubscription={handleManageSubscription}
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
            includeSubscription={true}
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
                subscription: currentUser.subscription ? {
                  plan: currentUser.subscription.plan,
                  status: currentUser.subscription.isActive ? 'active' : 'inactive'
                } : undefined
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
              onUpdateSubscription={(data) => {
                if (currentUser?.subscription) {
                  const updatedSubscription = {
                    ...currentUser.subscription,
                    ...data
                  };
                  const updatedUser = {
                    ...currentUser,
                    subscription: updatedSubscription
                  };
                  const updatedUsers = users.map(user => 
                    user.id === currentUser.id ? updatedUser : user
                  );
                  setUsers(updatedUsers);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            {currentUser?.name}'s subscription details
          </DialogDescription>
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select
                  value={subscriptionData.plan}
                  onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Subscription</SelectItem>
                    <SelectItem value="monthly">Monthly Plan</SelectItem>
                    <SelectItem value="quarterly">Quarterly Plan</SelectItem>
                    <SelectItem value="annual">Annual Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subscriptionData.plan && (
                <div className="space-y-2">
                  <Label htmlFor="status">Subscription Status</Label>
                  <Select
                    value={subscriptionData.status}
                    onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardContent className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setIsSubscriptionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                disabled={isLoading} 
                onClick={() => currentUser && handleUpdateSubscription(currentUser.id)}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
