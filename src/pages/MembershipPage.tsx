import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipStatusBar from '@/components/MembershipStatusBar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';

// Update membership plans data with fixed types
const membershipPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Perfect for those who want to try out our service',
    price: "11.99",
    duration: 1,
    deliveryFrequency: 'monthly',
    booksPerDelivery: 3,
    features: [
      'Personalized book selection',
      'Convenient delivery',
      'Interactive book buddy',
      'Goal setting',
      'Book discussions'
    ],
    isActive: true
  },
  {
    id: 'quarterly',
    name: '3 Months',
    description: 'Our recommended plan for developing reading habits',
    price: "30.00",
    duration: 3,
    deliveryFrequency: 'monthly',
    booksPerDelivery: 3,
    features: [
      'Personalized book selection',
      'Convenient delivery',
      'Interactive book buddy',
      'Goal setting',
      'Book discussions',
      'Progressive reading levels'
    ],
    isActive: true,
    isPopular: true
  },
  {
    id: 'biannual',
    name: '6 Months',
    description: 'Great value for building a solid reading foundation',
    price: "55.00",
    duration: 6,
    deliveryFrequency: 'monthly',
    booksPerDelivery: 3,
    features: [
      'Personalized book selection',
      'Convenient delivery',
      'Interactive book buddy',
      'Goal setting',
      'Book discussions',
      'Progressive reading levels',
      'Premium book selection'
    ],
    isActive: true
  },
  {
    id: 'annual',
    name: 'Annual',
    description: 'Best value for committed readers',
    price: "100.00",
    duration: 12,
    deliveryFrequency: 'monthly',
    booksPerDelivery: 3,
    features: [
      'Personalized book selection',
      'Convenient delivery',
      'Interactive book buddy',
      'Goal setting',
      'Book discussions',
      'Progressive reading levels',
      'Premium book selection',
      'Annual reading achievement award'
    ],
    isActive: true
  }
];

interface UserProfile {
  id: string;
  subscription?: {
    plan: string;
  };
}

interface PlanProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: string;
    duration: number;
    features: string[];
    isPopular?: boolean;
  };
  onSubscribe: (planId: string, paymentMethod: string) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({ plan, onSubscribe, isCurrentPlan, loading }) => {
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1",
      plan.isPopular && "border-purple-500 border-2 bg-gradient-to-b from-purple-50 to-white",
      isCurrentPlan && "border-emerald-500 border-2 bg-gradient-to-b from-emerald-50 to-white"
    )}>
      <CardHeader className="pb-4 relative overflow-hidden">
        {plan.isPopular && (
          <div className="absolute top-0 right-0 w-32 transform translate-x-8 -translate-y-8">
            <div className="bg-purple-500 text-white py-1 px-6 transform rotate-45 shadow-md text-center text-xs font-bold">
              POPULAR
            </div>
          </div>
        )}
        {plan.isPopular && (
          <Badge className="self-start mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none">
            Recommended
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge className="self-start mb-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none">
            Your Plan
          </Badge>
        )}
        <CardTitle className="text-2xl text-purple-800">{plan.name}</CardTitle>
        <CardDescription className="text-sm text-purple-600">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">${plan.price}</span>
          <span className="text-gray-500 ml-2">
            for {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
          </span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 flex flex-col gap-2">
        {isCurrentPlan ? (
          <Button 
            className="w-full border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            variant="outline"
            disabled
          >
            Current Plan
          </Button>
        ) : loading ? (
          <Button 
            className="w-full"
            disabled
          >
            Processing...
          </Button>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className={cn(
                    "w-full",
                    plan.isPopular && "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white",
                    !plan.isPopular && "border-purple-500 text-purple-700 bg-white hover:bg-purple-50"
                  )}
                  variant={plan.isPopular ? "default" : "outline"}
                >
                  Subscribe Now
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem 
                  onClick={() => onSubscribe(plan.id, 'stripe')}
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Pay with Card
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onSubscribe(plan.id, 'paypal')} 
                  className="cursor-pointer"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 9.5H18C16.3431 9.5 15 10.8431 15 12.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 10.5H7.5C8.32843 10.5 9 9.82843 9 9V7.5C9 6.67157 8.32843 6 8 6.67157 8 7.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 7.5V18M13 7.5C13 6.67157 12.3284 6 11.5 6H9.5C8.67157 6 8 6.67157 8 7.5V9C8 9.82843 8.67157 10.5 9.5 10.5H11.5C12.3284 10.5 13 9.82843 13 9V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 13.5V15C20 15.8284 19.3284 16.5 18.5 16.5H16.5C15.6716 16.5 15 15.8284 15 15V13.5C15 12.6716 15.6716 12 16.5 12H18.5C19.3284 12 20 12.6716 20 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pay with PayPal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-center text-xs text-gray-500">Secure payment processing</p>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

const MembershipPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [planIdLoading, setPlanIdLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');
  
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const provider = searchParams.get('provider') || 'payment service';
    
    if (success === 'true') {
      toast({
        title: "Subscription Successful",
        description: `Your subscription with ${provider} has been processed successfully.`,
        variant: "default"
      });
      
      // Update the local user subscription status
      const updateLocalSubscription = async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // Refresh the profile data to get the updated subscription status
          fetchProfile();
        }
      };
      
      updateLocalSubscription();
    } else if (canceled === 'true') {
      toast({
        title: "Subscription Canceled",
        description: `Your ${provider} subscription process was canceled.`,
        variant: "destructive"
      });
    }
  }, [searchParams]);
  
  const fetchProfile = async () => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        return;
      }
      
      // Get user profile with subscription info
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id
        `)
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile", error);
        return;
      }
      
      // Get subscription info
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
        
      if (subError) {
        console.error("Error fetching subscription", subError);
      }
      
      if (data) {
        setProfile({
          id: data.id.toString(),
          subscription: subData ? {
            plan: subData.plan
          } : undefined
        });
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };
  
  useEffect(() => {
    fetchProfile();
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubscribe = async (planId: string, paymentMethod: string) => {
    setPlanIdLoading(planId);
    setIsLoading(true);
    
    try {
      if (paymentMethod === 'paypal') {
        setSelectedPlanId(planId);
      } else if (paymentMethod === 'stripe') {
        toast({
          title: "Stripe Integration",
          description: "Stripe payment is not configured in this version. Please use PayPal instead.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setPlanIdLoading(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-12">
        <MembershipStatusBar />
        
        <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Membership Plan</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {membershipPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isCurrentPlan={profile?.subscription?.plan === plan.id}
              loading={planIdLoading === plan.id && loading}
            />
          ))}
        </div>
        
        <div className="mt-12 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Make a secure payment with PayPal to start your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-lg font-semibold">
                  Selected Plan: {membershipPlans.find(p => p.id === selectedPlanId)?.name || "Monthly Plan"}
                </p>
                <p className="text-sm text-gray-500">
                  ${membershipPlans.find(p => p.id === selectedPlanId)?.price || "11.99"} for {membershipPlans.find(p => p.id === selectedPlanId)?.duration || 1} {membershipPlans.find(p => p.id === selectedPlanId)?.duration === 1 ? 'month' : 'months'}
                </p>
              </div>
              <PayPalCheckoutButton 
                planId={selectedPlanId} 
                className="w-full py-2"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
              <p className="text-xs text-center mt-2 text-gray-500">
                You will be redirected to PayPal to complete your payment securely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPage;
