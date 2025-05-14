
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MembershipRequiredProps {
  children: React.ReactNode;
}

const MembershipRequired: React.FC<MembershipRequiredProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user has a subscription
    const checkSubscription = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has active subscription
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) {
          console.error("Error checking subscription:", error);
          setIsLoading(false);
          return;
        }
        
        // Check if user has an active subscription
        setHasSubscription(!!data);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-150px)]">Checking membership status...</div>;
  }
  
  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access this feature"
    });
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!hasSubscription) {
    toast({
      title: "Membership Required",
      description: "This feature requires an active subscription"
    });
    
    return <Navigate to="/membership" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default MembershipRequired;
