
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';

interface UserApprovalGuardProps {
  children: React.ReactNode;
}

const UserApprovalGuard: React.FC<UserApprovalGuardProps> = ({ children }) => {
  const { user, isApproved, isAdmin, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bookclub-primary"></div>
      </div>
    );
  }

  if (user && !isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your account has been created successfully but is pending admin approval. 
              Please wait for an administrator to activate your account before you can access the content.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Email: {user.email}
              </p>
              <p className="text-sm text-gray-500">
                Status: Pending Approval
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserApprovalGuard;
