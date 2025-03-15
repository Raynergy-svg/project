import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Custom 'stripe-buy-button' element is type-defined in src/types/stripe-elements.d.ts
export default function StripeBuyButton() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the Stripe Buy Button script is already added
    if (!document.getElementById("stripe-buy-button-script")) {
      const script = document.createElement("script");
      script.id = "stripe-buy-button-script";
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;

      // Handle loading states
      script.onload = () => setIsLoading(false);
      script.onerror = () => {
        console.error("Failed to load Stripe Buy Button script");
        setIsLoading(false);
      };

      document.body.appendChild(script);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className="w-full max-w-md mx-auto mt-8"
      data-testid="stripe-container"
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2
            className="w-6 h-6 text-[#88B04B] animate-spin"
            role="status"
            aria-label="Loading payment button"
          />
        </div>
      ) : (
        <stripe-buy-button
          buy-button-id="buy_btn_1QvD6LHIL3HWxjaBRT0tTREh"
          publishable-key="pk_test_51QsepMHIL3HWxjaBWWqTKCYxlHFwe74XXP9DxxNARoEAPdjwjRfPNxzgAKNaPpcEcfY2c7nQc5LUWJsCUiTl9yJX0086z99MwV"
        ></stripe-buy-button>
      )}
    </div>
  );
}
