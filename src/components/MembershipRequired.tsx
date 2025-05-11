
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface MembershipRequiredProps {
  children: React.ReactNode;
}

const MembershipRequired: React.FC<MembershipRequiredProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if Supabase is configured properly
    if (!isSupabaseConfigured()) {
      toast({
        title: "Configuration Error",
        description: "Authentication service is not properly configured",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check if user has active subscription
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            subscriptions (
              status,
              plan
            )
          `)
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error checking subscription:", error);
          setIsLoading(false);
          return;
        }
        
        // Check if user has an active subscription
        const hasActiveSub = data.subscriptions &&
                          data.subscriptions.length > 0 &&
                          data.subscriptions[0].status === 'active';
        
        setHasSubscription(hasActiveSub);
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
      authListener?.subscription?.unsubscribe();
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
