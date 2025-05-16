
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import MembershipRequired from '@/components/MembershipRequired';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  billing_cycle: string;
  popular?: boolean;
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  created_at: string;
  period_end: string;
  cancel_at_period_end: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  payment_method: string;
  created_at: string;
  status: string;
}

// Format date helper function
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

// Sample plans data
const samplePlans = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 9.99,
    description: "Perfect for casual readers",
    features: [
      "Access to book club discussions",
      "One physical book per month",
      "Digital library access",
      "Cancel anytime"
    ],
    billing_cycle: "month"
  },
  {
    id: "quarterly",
    name: "Quarterly Plan",
    price: 24.99,
    description: "Our most popular option",
    features: [
      "All Monthly benefits",
      "Three physical books per quarter",
      "Exclusive author interviews",
      "15% discount on additional books"
    ],
    billing_cycle: "quarter",
    popular: true
  },
  {
    id: "annual",
    name: "Annual Plan",
    price: 89.99,
    description: "Best value for book lovers",
    features: [
      "All Quarterly benefits",
      "Twelve physical books per year",
      "One special edition book annually",
      "25% discount on additional books",
      "Early access to new releases"
    ],
    billing_cycle: "year"
  }
];

const MembershipPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans] = useState<Plan[]>(samplePlans);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication required",
            description: "Please log in to view membership information",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        
        // Fetch subscription data - using user_subscriptions instead
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (subscriptionError) {
          console.error("Error fetching subscription:", subscriptionError);
        } else if (subscriptionData) {
          // Transform the data to match our Subscription interface
          setSubscription({
            id: subscriptionData.id,
            status: subscriptionData.status,
            plan: subscriptionData.plan,
            created_at: subscriptionData.created_at || "",
            period_end: subscriptionData.end_date || "",
            cancel_at_period_end: false // Default value
          });
          
          // For demo purposes, we'll use sample transactions
          setTransactions([
            {
              id: "1",
              amount: getSubscriptionPrice(subscriptionData.plan),
              payment_method: "PayPal",
              created_at: subscriptionData.created_at || new Date().toISOString(),
              status: "completed"
            }
          ]);
        }
      } catch (error) {
        console.error("Error in membership page:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Helper function to get subscription price based on plan
  const getSubscriptionPrice = (planId: string): number => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.price : 0;
  };
  
  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    
    setCancelLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
        
      if (error) {
        console.error("Error canceling subscription:", error);
        toast({
          title: "Error",
          description: "Unable to cancel subscription. Please try again.",
          variant: "destructive",
        });
      } else {
        // Update local state
        setSubscription({
          ...subscription,
          status: 'cancelled',
          cancel_at_period_end: true
        });
        
        toast({
          title: "Subscription updated",
          description: "Your subscription will be canceled at the end of the billing period",
        });
        
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error("Exception during cancellation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };
  
  const handleReactivateSubscription = async () => {
    if (!user || !subscription) return;
    
    setCancelLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
        
      if (error) {
        console.error("Error reactivating subscription:", error);
        toast({
          title: "Error",
          description: "Unable to reactivate subscription. Please try again.",
          variant: "destructive",
        });
      } else {
        // Update local state
        setSubscription({
          ...subscription,
          status: 'active',
          cancel_at_period_end: false
        });
        
        toast({
          title: "Subscription reactivated",
          description: "Your subscription will continue after the current billing period",
        });
      }
    } catch (error) {
      console.error("Exception during reactivation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    toast({
      title: "Subscription Processing",
      description: "Your subscription request is being processed",
    });

    setTimeout(() => {
      // Redirect to success page or show confirmation
      toast({
        title: "Subscription Successful!",
        description: "You have successfully subscribed to our plan",
      });
      
      navigate('/');
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Membership</h1>
      
      {user ? (
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            {subscription && <TabsTrigger value="history">Payment History</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="subscription">
            {subscription ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Current Membership</CardTitle>
                      <CardDescription>Your subscription details</CardDescription>
                    </div>
                    <Badge className={
                      subscription.status === 'active' 
                        ? 'bg-green-500' 
                        : subscription.status === 'trialing' 
                          ? 'bg-blue-500' 
                          : 'bg-gray-500'
                    }>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Plan</p>
                        <p className="font-medium">{subscription.plan}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Started</p>
                        <p className="font-medium">{formatDate(subscription.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Period Ends</p>
                        <p className="font-medium">{formatDate(subscription.period_end)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Renewal Status</p>
                        <p className="font-medium">
                          {subscription.cancel_at_period_end 
                            ? "Will not renew" 
                            : "Will automatically renew"}
                        </p>
                      </div>
                    </div>
                    
                    {subscription.cancel_at_period_end && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-amber-800">
                          Your membership is set to end on {formatDate(subscription.period_end)}. 
                          You'll lose access to premium features after this date.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {subscription.status === 'cancelled' || subscription.cancel_at_period_end ? (
                    <Button
                      onClick={handleReactivateSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Processing..." : "Reactivate Subscription"}
                    </Button>
                  ) : (
                    <>
                      {showCancelConfirm ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={cancelLoading}
                          >
                            Keep Subscription
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={cancelLoading}
                          >
                            {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={cancelLoading}
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold mb-4">No Active Membership</h2>
                <p className="mb-6">You don't have an active membership plan. Check out our available plans to get started.</p>
                <Button onClick={() => {
                  const plansTab = document.querySelector('[data-value="plans"]');
                  if (plansTab instanceof HTMLElement) {
                    plansTab.click();
                  }
                }}>
                  View Membership Plans
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-indigo-400 shadow-md' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <Badge className="bg-indigo-500">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-500">/{plan.billing_cycle}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {subscription?.plan === plan.id ? (
                      <Button className="w-full" disabled>Current Plan</Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        Subscribe
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {subscription && (
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Amount</th>
                            <th className="py-2 px-4 text-left">Payment Method</th>
                            <th className="py-2 px-4 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{formatDate(transaction.created_at)}</td>
                              <td className="py-3 px-4">${transaction.amount.toFixed(2)}</td>
                              <td className="py-3 px-4">{transaction.payment_method}</td>
                              <td className="py-3 px-4">
                                <Badge className={
                                  transaction.status === 'completed' 
                                    ? 'bg-green-500' 
                                    : transaction.status === 'pending' 
                                      ? 'bg-amber-500' 
                                      : 'bg-red-500'
                                }>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4">No transaction history available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <MembershipRequired>
          Please log in to view and manage your membership details.
        </MembershipRequired>
      )}
    </div>
  );
};

export default MembershipPage;
