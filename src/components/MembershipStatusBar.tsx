
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
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
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile", profileError);
          setLoading(false);
          return;
        }

        // Get subscription info
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (subscriptionError) {
          console.error("Error fetching subscription", subscriptionError);
        }
        
        if (profileData) {
          setProfile({
            id: profileData.id.toString(),
            email: profileData.email || user.email,
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            subscription: subscriptionData ? {
              status: subscriptionData.status || "",
              plan: subscriptionData.plan || "",
              end_date: subscriptionData.end_date || "",
              next_delivery_date: subscriptionData.next_delivery_date || undefined
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
      authListener.subscription.unsubscribe();
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
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
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
      <Card className="mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 border-dashed border-purple-300">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-purple-900">Join Skillbag to access exclusive features</p>
            <p className="text-sm text-purple-700">Sign in or create an account to get started</p>
          </div>
          <Button onClick={handleLogin} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile.subscription || profile.subscription.status !== 'active') {
    return (
      <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-100">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium text-orange-900">You don't have an active subscription</p>
            <p className="text-sm text-orange-700">Upgrade to receive our monthly book deliveries</p>
          </div>
          <Button onClick={handleUpgrade} className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">View Plans</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-100 border-green-200">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-emerald-800">
            Active {profile.subscription.plan.charAt(0).toUpperCase() + profile.subscription.plan.slice(1)} Subscription
          </p>
          <p className="text-sm text-emerald-700">
            Valid until {formatDate(profile.subscription.end_date)}
            {profile.subscription.next_delivery_date && 
              ` • Next delivery: ${formatDate(profile.subscription.next_delivery_date)}`}
          </p>
        </div>
        <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={handleUpgrade}>
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatusBar;
