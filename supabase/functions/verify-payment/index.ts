
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { orderId, provider } = await req.json();
    
    if (!orderId || !provider) {
      throw new Error("Missing orderId or provider");
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
    
    // Check order status with PayPal
    const orderResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    const orderData = await orderResponse.json();
    
    // If the order status is COMPLETED, update the subscription status
    if (orderData.status === 'COMPLETED') {
      // Find the pending subscription for this user
      const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("payment_provider", "paypal")
        .eq("status", "pending")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subscriptionError) {
        console.error("Error finding subscription:", subscriptionError);
        throw new Error("Failed to find subscription");
      }
      
      if (!subscriptionData) {
        throw new Error("No pending subscription found");
      }
      
      // Update the subscription status to active
      const { error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", subscriptionData.id);
      
      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw new Error("Failed to update subscription status");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Payment verified and subscription activated"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Payment not completed, current status: ${orderData.status}`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
