
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
    const { planId, paymentMethod = 'stripe' } = await req.json();
    
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
    
    // Process based on payment method
    if (paymentMethod === 'paypal') {
      const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
        auth: { persistSession: false }
      });
      
      // Get PayPal related env variables
      const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
      const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
      
      if (!paypalClientId || !paypalClientSecret) {
        throw new Error("Missing PayPal credentials");
      }
      
      // Get access token from PayPal
      const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error("Failed to obtain PayPal access token");
      }
      
      // Map plan IDs to PayPal price values
      const planPriceMap: Record<string, { value: string, currency: string, description: string }> = {
        monthly: { value: '11.99', currency: 'USD', description: 'Monthly Book Subscription' },
        quarterly: { value: '30.00', currency: 'USD', description: '3 Months Book Subscription' },
        biannual: { value: '55.00', currency: 'USD', description: '6 Months Book Subscription' },
        annual: { value: '100.00', currency: 'USD', description: 'Annual Book Subscription' }
      };
      
      const planDetails = planPriceMap[planId] || planPriceMap.monthly;
      
      // Create PayPal order
      const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: planDetails.currency,
              value: planDetails.value
            },
            description: planDetails.description
          }],
          application_context: {
            return_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?success=true&provider=paypal`,
            cancel_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?canceled=true&provider=paypal`,
            brand_name: "Skillbag",
            user_action: "PAY_NOW"
          }
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderData.id) {
        throw new Error("Failed to create PayPal order");
      }
      
      // Record the pending PayPal subscription
      await supabaseAdmin
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan: planId,
          status: 'pending',
          payment_provider: 'paypal'
        });
      
      // Find the approval URL
      const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;
      
      if (!approvalUrl) {
        throw new Error("No approval URL found in PayPal response");
      }
      
      return new Response(
        JSON.stringify({ 
          url: approvalUrl,
          provider: 'paypal',
          orderId: orderData.id
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
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
      const planPriceMap: Record<string, string> = {
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
        success_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?success=true&provider=stripe`,
        cancel_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?canceled=true&provider=stripe`,
      });
      
      return new Response(JSON.stringify({ url: session.url, provider: 'stripe' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
