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

// Extend the Window interface to include the PayPal property
declare global {
  interface Window {
    paypal: any;
  }
}
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

// Update membership plans data with fixed types
const membershipPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Perfect for those who want to try out our service',
    price: "1199",
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
    price: "3000",
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
    price: "5500",
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
    price: "10000",
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
  id: number;
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
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">₹{parseInt(plan.price, 10)}</span>
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
                    <path d="M4 10.5H7.5C8.32843 10.5 9 9.82843 9 9V7.5C9 6.67157 8.32843 6 7.5 6H5.5C4.67157 6 4 6.67157 4 7.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
    } else if (canceled === 'true') {
      toast({
        title: "Subscription Canceled",
        description: `Your ${provider} subscription process was canceled.`,
        variant: "destructive"
      });
    }
  }, [searchParams]);
  
  useEffect(() => {
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
          .eq('id', Number(user.id))
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
            id: data.id,
            subscription: subData ? {
              plan: subData.plan
            } : undefined
          });
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

  const paypalClientId = process.env.PAYPAL_CLIENT_ID;

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (paypalClientId) {
      const addPaypalScript = async () => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => setPaypalScriptLoaded(true);
        script.onerror = () => {
          console.error('Failed to load PayPal SDK script.');
          toast({
            title: 'Error',
            description: 'Failed to load PayPal, please try again later.',
            variant: 'destructive',
          });
        };
        document.body.appendChild(script);
      };

      if (!paypalScriptLoaded) {
        addPaypalScript();
      }
    } else {
      console.error('PayPal Client ID is not set in environment variables.');
      toast({
        title: 'Error',
        description: 'PayPal Client ID is not set. Please configure it in your .env file.',
        variant: 'destructive',
      });
    }
  }, [paypalClientId, paypalScriptLoaded, toast]);

  const handlePayment = async () => {
    if (!paypalScriptLoaded) {
      toast({
        title: 'Error',
        description: 'PayPal SDK is still loading. Please wait and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically create an order on your server and get the order ID
      const order = await createPaypalOrder(selectedPlan.price);

      if (order?.id) {
        // Render PayPal buttons and handle payment capture
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: selectedPlan.price,
            },
          },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const capture = await actions.order.capture();
            if (capture.status === 'COMPLETED') {
              // Payment successful, update subscription status in your database
              await updateSubscriptionStatus(selectedPlan.id);
              toast({
          title: 'Payment Successful',
          description: `You have successfully subscribed to the ${selectedPlan.name} plan.`,
              });
              navigate('/bookshelf'); // Redirect to bookshelf or confirmation page
            } else {
              toast({
          title: 'Payment Failed',
          description: 'Payment could not be completed. Please try again.',
          variant: 'destructive',
              });
            }
            setIsLoading(false);
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            toast({
              title: 'PayPal Error',
              description: 'There was an error processing your payment. Please try again.',
              variant: 'destructive',
            });
            setIsLoading(false);
          },
        }).render('#paypal-button-container'); // Make sure you have a div with this ID in your render
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create PayPal order. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const createPaypalOrder = async (amount: number) => {
    // Implement your server-side logic to create a PayPal order
    // This is a placeholder, replace with your actual implementation
    // Make sure to handle errors and return the order ID
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      return data; // Assuming your server returns the order object
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create PayPal order. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSubscriptionStatus = async (planId: string) => {
    // Implement your logic to update the user's subscription status in your database
    // This is a placeholder, replace with your actual implementation
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          created_at: new Date().toISOString(),
          id: parseInt((await supabase.auth.getUser()).data.user?.id),
          plan: planId,
          status: 'active',
        }, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error updating subscription status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update subscription status. Please contact support.',
          variant: 'destructive',
        });
      } else {
        console.log('Subscription status updated successfully:', data);
        toast({
          title: 'Subscription Updated',
          description: 'Your subscription has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating subscription status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-12">
        <MembershipStatusBar />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {membershipPlans.map((plan) => (
            <Card key={plan.id} className={cn(selectedPlan.id === plan.id ? "border-2 border-primary" : "border-muted")}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <ul className="list-none pl-0 space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button onClick={() => setSelectedPlan(plan)} variant={selectedPlan.id === plan.id ? "default" : "outline"}>
                  {selectedPlan.id === plan.id ? "Selected" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Payment Options</h2>
          <div id="paypal-button-container" className="mt-4"></div>
          <Button onClick={handlePayment} disabled={isLoading} className="w-full mt-4">
            {isLoading ? "Processing Payment..." : "Subscribe with PayPal"}
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPage;
