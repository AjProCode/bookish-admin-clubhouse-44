
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from './UserTable';

interface UserFormProps {
  user?: Partial<User>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  includeSubscription?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  includeSubscription = false,
}) => {
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'member',
    status: user?.status || 'active',
    subscription: user?.subscription?.plan || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{user ? 'Edit User' : 'Add New User'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {includeSubscription && (
            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription Plan</Label>
              <Select
                value={formData.subscription}
                onValueChange={(value) => handleSelectChange('subscription', value)}
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
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (user ? 'Update' : 'Save')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserForm;
