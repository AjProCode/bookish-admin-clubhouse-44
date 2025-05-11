
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
      <CardFooter className="pt-4">
        <Button 
          className={cn(
            "w-full",
            plan.isPopular && !isCurrentPlan && "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white",
            isCurrentPlan && "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          )}
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

// Create our Edge Function for Stripe integration
const createCheckoutEdgeFunction = `
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId } = await req.json();
    
    if (!planId) {
      throw new Error("Missing plan ID");
    }

    // Create Supabase client for auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAdminKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }
    
    const user = userData.user;
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe secret key");
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    
    let customerId = profile?.stripe_customer_id;
    
    // If no customer ID found, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      
      customerId = customer.id;
      
      // Update the profile with the new customer ID
      const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
        auth: { persistSession: false }
      });
      
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }
    
    // Map plan IDs to prices
    const planPriceMap = {
      monthly: "price_monthly",
      quarterly: "price_quarterly",
      biannual: "price_biannual",
      annual: "price_annual"
    };
    
    // For demo purposes, we're using a test price
    // In a real implementation, you would fetch actual price IDs from your Stripe account
    const priceId = planPriceMap[planId] || "price_monthly";
    
    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: \`\${req.headers.get("origin") || "https://your-app-url.com"}/membership?success=true\`,
      cancel_url: \`\${req.headers.get("origin") || "https://your-app-url.com"}/membership?canceled=true\`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
`;

// Create our customer portal Edge Function
const customerPortalEdgeFunction = `
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }
    
    const user = userData.user;
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Missing Stripe secret key");
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Get customer ID
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profile?.stripe_customer_id) {
      throw new Error("No Stripe customer found");
    }
    
    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: \`\${req.headers.get("origin") || "https://your-app-url.com"}/membership\`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
`;

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [planIdLoading, setPlanIdLoading] = useState<string | null>(null);
  
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
    const { subscription } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSubscribe = async (planId: string) => {
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
