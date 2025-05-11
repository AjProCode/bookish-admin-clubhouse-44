import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription?: {
    status: string;
    plan: string;
    end_date: string;
    next_delivery_date?: string;
  };
}

const MembershipStatusBar: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get user profile with subscription info
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            first_name,
            last_name,
            subscriptions (
              status,
              plan,
              end_date,
              next_delivery_date
            )
          `)
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile", error);
          setLoading(false);
          return;
        }
        
        if (data) {
          setProfile({
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            subscription: data.subscriptions && data.subscriptions.length > 0 ? {
              status: data.subscriptions[0].status,
              plan: data.subscriptions[0].plan,
              end_date: data.subscriptions[0].end_date,
              next_delivery_date: data.subscriptions[0].next_delivery_date
            } : undefined
          });
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleLogin = () => navigate('/login');
  const handleUpgrade = () => navigate('/membership');
  
  if (loading) {
    return (
      <Card className="mb-6 bg-gray-50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Loading membership status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
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

  if (!profile.subscription || profile.subscription.status !== 'active') {
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
            Active {profile.subscription.plan.charAt(0).toUpperCase() + profile.subscription.plan.slice(1)} Subscription
          </p>
          <p className="text-sm text-green-700">
            Valid until {formatDate(profile.subscription.end_date)}
            {profile.subscription.next_delivery_date && 
              ` • Next delivery: ${formatDate(profile.subscription.next_delivery_date)}`}
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
