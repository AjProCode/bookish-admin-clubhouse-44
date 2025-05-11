
import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserTable, { User } from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

// Sample users data
const initialUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: 'Jan 15, 2023',
    role: 'admin',
    status: 'active',
    booksRead: 12
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    joinDate: 'Feb 3, 2023',
    role: 'member',
    status: 'active',
    booksRead: 8
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    joinDate: 'Mar 18, 2023',
    role: 'member',
    status: 'active',
    booksRead: 15
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    joinDate: 'Apr 22, 2023',
    role: 'member',
    status: 'inactive',
    booksRead: 3
  },
  {
    id: '5',
    name: 'Alex Brown',
    email: 'alex@example.com',
    joinDate: 'May 10, 2023',
    role: 'member',
    status: 'active',
    booksRead: 6
  }
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddUser = (userData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        joinDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        booksRead: 0
      };
      
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
  
  const handleUpdateUser = (userData: any) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedUsers = users.map(user => 
        user.id === currentUser?.id ? { ...user, ...userData } : user
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
    
    const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
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
  
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="User Management" />
      
      <div className="p-6 space-y-6">
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
          onToggleStatus={handleToggleUserStatus} 
        />
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
    </div>
  );
};

export default AdminUsers;
