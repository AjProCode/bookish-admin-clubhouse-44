
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PayPalOrderResponse {
  url?: string;
  orderId?: string;
  provider?: string;
  error?: string;
}

export const createPayPalCheckout = async (planId: string): Promise<PayPalOrderResponse> => {
  try {
    // Get the current user's session token
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      throw new Error("You must be logged in to subscribe");
    }

    // Call the Supabase Edge Function to create the checkout session
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { planId },
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    if (error) {
      console.error("Error invoking create-checkout function:", error);
      throw new Error(error.message || "Failed to create checkout session");
    }

    if (!data || !data.url) {
      throw new Error("Failed to create checkout session");
    }

    return {
      url: data.url,
      orderId: data.orderId,
      provider: data.provider,
    };
  } catch (error: any) {
    console.error("PayPal checkout error:", error);
    return {
      error: error.message || "An unexpected error occurred",
    };
  }
};

export const verifyPayPalPayment = async (orderId: string): Promise<boolean> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      throw new Error("You must be logged in to verify payment");
    }

    // Call a hypothetical verify-payment function (you would need to create this)
    const { data, error } = await supabase.functions.invoke("verify-payment", {
      body: { orderId, provider: "paypal" },
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    if (error) {
      console.error("Error verifying payment:", error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
};
