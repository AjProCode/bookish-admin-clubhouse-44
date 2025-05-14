
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

// Sample membership plans data
const membershipPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Perfect for those who want to try out our service',
    price: 1199,
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
    price: 3000,
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
    price: 5500,
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
    price: 10000,
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
    price: number;
    duration: number;
    features: string[];
    isPopular?: boolean;
  };
  onSubscribe: (planId: string, paymentMethod: string) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({ plan, onSubscribe, isCurrentPlan, loading }) => {
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  
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
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">₹{plan.price}</span>
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
  const navigate = useNavigate();
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
            id,
            subscriptions (
              plan
            )
          `)
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile", error);
          return;
        }
        
        if (data) {
          setProfile({
            id: data.id,
            subscription: data.subscriptions && Array.isArray(data.subscriptions) && data.subscriptions.length > 0 ? {
              plan: data.subscriptions[0].plan
            } : undefined
          });
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
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
  
  const handleSubscribe = async (planId: string, paymentMethod: string = 'stripe') => {
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in or create an account to subscribe.",
        });
        navigate('/login');
        return;
      }
      
      setPlanIdLoading(planId);
      setLoading(true);
      
      // Call Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, paymentMethod }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Subscription Error",
        description: "There was a problem setting up your subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setPlanIdLoading(null);
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // Call Supabase Edge Function to create a customer portal session
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Error",
        description: "There was a problem accessing your subscription settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getUserPlanId = (): string | undefined => {
    if (!profile?.subscription) return undefined;
    return profile.subscription.plan;
  };
  
  const currentPlanId = getUserPlanId();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="pt-16 pb-10 bg-gradient-to-b from-purple-100 via-indigo-100 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-800 bg-clip-text text-transparent">
              Develop a Love for Reading in Your Child
            </h1>
            <p className="text-lg md:text-xl text-purple-700 max-w-3xl mx-auto mb-8">
              Join our Book Club for ages 7 and above, where we make reading fun, engaging, and rewarding!
            </p>
          </div>
        </section>
        
        <section className="py-6 container mx-auto px-4">
          <MembershipStatusBar />
          
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-purple-800">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-purple-200 transform transition-transform hover:scale-105">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">Personalized Experience</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                    <p className="text-purple-900">Our experts carefully select books tailored to your child's interests and reading level</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                    <p className="text-purple-900">Every month, 3 exciting books will be delivered right to your doorstep</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                    <p className="text-purple-900">Your child will have ample time to enjoy and complete the books</p>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-purple-200 transform transition-transform hover:scale-105">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">Ongoing Support</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                    <p className="text-purple-900">Regular interactions with a dedicated book buddy to keep your child motivated</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">5</div>
                    <p className="text-purple-900">We help set achievable reading targets to encourage steady progress</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">6</div>
                    <p className="text-purple-900">Engaging book discussions after finishing each book</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-purple-800 relative">
            <span className="inline-block relative">
              Choose Your Membership Plan
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></span>
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipPlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onSubscribe={handleSubscribe} 
                isCurrentPlan={plan.id === currentPlanId} 
                loading={loading && planIdLoading === plan.id}
              />
            ))}
          </div>
          
          {profile?.subscription && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={loading}
                className="border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Manage Your Subscription'}
              </Button>
            </div>
          )}
          
          <div className="mt-6 mb-4 flex items-center justify-center gap-4">
            <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" className="h-8" />
            <img src="https://www.mastercard.co.in/content/dam/public/mastercardcom/in/en/consumers/cards-benefits/images/mc-logo-52.svg" alt="Mastercard" className="h-8" />
            <img src="https://www.visa.co.in/dam/VCOM/regional/ap/india/global-elements/images/in-visa-gold-card-498x280.png" alt="Visa" className="h-8" />
          </div>
          
          <div className="flex justify-center">
            <p className="text-xs text-gray-500 text-center max-w-lg">
              Payments are securely processed. We accept major credit/debit cards and PayPal. 
              All transactions are encrypted and your payment information is never stored on our servers.
            </p>
          </div>
          
          <div className="mt-12 bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg max-w-3xl mx-auto transform transition-transform hover:scale-105">
            <h3 className="text-xl font-semibold mb-4 text-center text-purple-800">Did You Know?</h3>
            <p className="text-purple-700 text-center">
              Studies show that a child begins to enjoy reading in about 3 months, and a solid reading habit forms between 6 to 9 months. 
              Start your child's reading journey today with our tailored book club experience and watch them develop a passion for books!
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MembershipPage;
