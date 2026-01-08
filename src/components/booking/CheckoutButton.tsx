"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ bookingId, email, disabled }: { bookingId: string, email?: string, disabled?: boolean }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        if (disabled) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/create-payment-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, email }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe
            } else {
                console.error("No URL returned", data);
                alert("Payment initialization failed.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full h-14 text-lg bg-gray-500 hover:bg-gray-600 gap-2 font-bold"
        >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Secure Checkout <Lock className="w-4 h-4" /></>}
        </Button>
    );
}
