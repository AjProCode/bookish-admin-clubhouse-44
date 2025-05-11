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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipStatusBar from '@/components/MembershipStatusBar';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  onSubscribe: (planId: string) => void;
  isCurrentPlan?: boolean;
  loading?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({ plan, onSubscribe, isCurrentPlan, loading }) => {
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-200 hover:shadow-lg",
      plan.isPopular && "border-bookclub-primary border-2",
      isCurrentPlan && "border-green-500 border-2"
    )}>
      <CardHeader className="pb-4">
        {plan.isPopular && (
          <Badge className="self-start mb-2 bg-bookclub-primary text-white">
            Recommended
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge className="self-start mb-2 bg-green-500 text-white">
            Your Plan
          </Badge>
        )}
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <span className="text-3xl font-bold text-bookclub-primary">₹{plan.price}</span>
          <span className="text-gray-500 ml-2">
            for {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
          </span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? "outline" : (plan.isPopular ? "default" : "outline")}
          onClick={() => onSubscribe(plan.id)}
          disabled={isCurrentPlan || loading}
        >
          {loading ? 'Processing...' : (isCurrentPlan ? 'Current Plan' : 'Subscribe Now')}
        </Button>
      </CardFooter>
    </Card>
  );
};

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [planIdLoading, setPlanIdLoading] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
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
          .single();
        
        if (error) {
          console.error("Error fetching profile", error);
          return;
        }
        
        if (data) {
          setProfile({
            id: data.id,
            subscription: data.subscriptions && data.subscriptions.length > 0 ? {
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
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  
  const handleSubscribe = async (planId: string) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
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
      
      // Call Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
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
        <section className="pt-16 pb-10 bg-gradient-to-b from-bookclub-accent to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Develop a Love for Reading in Your Child
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Join our Book Club for ages 7 and above, where we make reading fun, engaging, and rewarding!
            </p>
          </div>
        </section>
        
        <section className="py-6 container mx-auto px-4">
          <MembershipStatusBar />
          
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Personalized Experience</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                    <p>Our experts carefully select books tailored to your child's interests and reading level</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                    <p>Every month, 3 exciting books will be delivered right to your doorstep</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                    <p>Your child will have ample time to enjoy and complete the books</p>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Ongoing Support</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                    <p>Regular interactions with a dedicated book buddy to keep your child motivated</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">5</div>
                    <p>We help set achievable reading targets to encourage steady progress</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="bg-bookclub-primary text-white h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">6</div>
                    <p>Engaging book discussions after finishing each book</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Choose Your Membership Plan</h2>
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
              >
                {loading ? 'Loading...' : 'Manage Your Subscription'}
              </Button>
            </div>
          )}
          
          <div className="mt-12 bg-bookclub-accent p-6 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">Did You Know?</h3>
            <p className="text-gray-700 text-center">
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
