
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserDetails } from '@/models/UserBook';
import { useNavigate } from 'react-router-dom';

const MembershipStatusBar: React.FC = () => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage (in a real app, would validate session)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleLogin = () => navigate('/login');
  const handleUpgrade = () => navigate('/membership');
  
  if (!user) {
    return (
      <Card className="mb-6 bg-gray-50 border-dashed">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Join Skillbag to access exclusive features</p>
            <p className="text-sm text-gray-500">Sign in or create an account to get started</p>
          </div>
          <Button onClick={handleLogin}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (!user.subscription) {
    return (
      <Card className="mb-6 bg-gray-50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">You don't have an active subscription</p>
            <p className="text-sm text-gray-500">Upgrade to receive our monthly book deliveries</p>
          </div>
          <Button onClick={handleUpgrade}>View Plans</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-green-50 border-green-200">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-green-800">
            Active {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Subscription
          </p>
          <p className="text-sm text-green-700">
            Valid until {formatDate(user.subscription.endDate)}
            {user.subscription.nextDeliveryDate && 
              ` • Next delivery: ${formatDate(user.subscription.nextDeliveryDate)}`}
          </p>
        </div>
        <Button variant="outline" className="border-green-500 text-green-500" onClick={handleUpgrade}>
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatusBar;
