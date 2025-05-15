
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Subscription {
  status: string;
  plan: string;
  end_date: string;
  next_delivery_date: string | null;
}

interface UserProfile {
  id: string;
  email?: string;
  subscription?: Subscription;
}

const MembershipStatusBar: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Could not load your profile information",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Get subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (subscriptionError) {
          console.error("Error fetching subscription:", subscriptionError);
        }
        
        setProfile({
          id: session.user.id,
          email: session.user.email,
          subscription: subscriptionData ? {
            status: subscriptionData.status || "",
            plan: subscriptionData.plan || "",
            end_date: subscriptionData.end_date || "",
            next_delivery_date: subscriptionData.next_delivery_date || null
          } : undefined
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Function to format date string
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  const handleManageMembership = () => {
    navigate('/membership');
  };
  
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p>Loading membership information...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 flex justify-between items-center">
          <div>
            <p>You need to be logged in to view membership details.</p>
          </div>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </CardContent>
      </Card>
    );
  }
  
  const hasActiveSubscription = profile.subscription && profile.subscription.status === 'active';
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">Membership Status:</h3>
            {hasActiveSubscription ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500">Inactive</Badge>
            )}
          </div>
          
          {hasActiveSubscription && profile.subscription ? (
            <div className="text-sm text-gray-600">
              <p>Plan: <span className="font-medium">{profile.subscription.plan}</span></p>
              <p>Renewal Date: <span className="font-medium">{formatDate(profile.subscription.end_date)}</span></p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Get access to premium books and features with a membership plan.
            </p>
          )}
        </div>
        
        <Button onClick={handleManageMembership}>
          {hasActiveSubscription ? 'Manage Membership' : 'Get Membership'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatusBar;
