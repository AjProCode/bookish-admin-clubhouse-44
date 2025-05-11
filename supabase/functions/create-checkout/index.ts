
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
    
    // Map plan IDs to prices (in a real app, these would be actual Stripe price IDs)
    // For demo purposes, we're creating test prices on the fly
    const getPriceIdForPlan = async (planId: string) => {
      // Check if price already exists
      const prices = await stripe.prices.list({
        lookup_keys: [planId],
        limit: 1
      });
      
      if (prices.data.length > 0) {
        return prices.data[0].id;
      }
      
      // Create product if needed
      const products = await stripe.products.list({
        active: true,
        limit: 1
      });
      
      let product;
      if (products.data.length > 0) {
        product = products.data[0];
      } else {
        product = await stripe.products.create({
          name: 'Skillbag Book Subscription',
          description: 'Monthly book delivery for children',
          active: true,
        });
      }
      
      // Define pricing based on plan
      let amount = 0;
      let interval = 'month';
      let intervalCount = 1;
      
      switch(planId) {
        case 'monthly':
          amount = 1199;
          break;
        case 'quarterly':
          amount = 3000;
          intervalCount = 3;
          break;
        case 'biannual':
          amount = 5500;
          intervalCount = 6;
          break;
        case 'annual':
          amount = 10000;
          intervalCount = 12;
          break;
        default:
          amount = 1199;
      }
      
      // Create new price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'inr',
        recurring: {
          interval,
          interval_count: intervalCount,
        },
        lookup_key: planId,
      });
      
      return price.id;
    };
    
    const priceId = await getPriceIdForPlan(planId);
    
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
      success_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?success=true`,
      cancel_url: `${req.headers.get("origin") || "https://your-app-url.com"}/membership?canceled=true`,
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
