
import React from 'react';
import { Button } from "@/components/ui/button";
import { createPayPalCheckout } from "@/services/paypal";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface PayPalCheckoutButtonProps {
  planId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  className?: string;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ 
  planId, 
  variant = "default", 
  className = "",
  isLoading,
  setIsLoading
}) => {
  const navigate = useNavigate();

  const handlePayPalCheckout = async () => {
    setIsLoading(true);
    
    try {
      const response = await createPayPalCheckout(planId);
      
      if (response.error) {
        toast({
          title: "Payment Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      
      if (response.url) {
        // Redirect to PayPal checkout
        window.location.href = response.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create PayPal checkout session",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handlePayPalCheckout}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Pay with PayPal"}
    </Button>
  );
};

export default PayPalCheckoutButton;
