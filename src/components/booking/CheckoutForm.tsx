"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Lock, Loader2 } from "lucide-react";
import CheckoutButton from "./CheckoutButton";

interface CheckoutFormProps {
    bookingId: string;
    amount: number;
}

export default function CheckoutForm({ bookingId, amount }: CheckoutFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "+971 ",
        country: "",
    });

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        // Simple validation: All fields must be non-empty and phone > 5 chars
        const valid =
            formData.firstName.trim().length > 0 &&
            formData.lastName.trim().length > 0 &&
            formData.email.includes("@") &&
            formData.phone.length > 5 &&
            formData.country.trim().length > 0;

        setIsValid(valid);
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            {/* Left Column: Form */}
            <div className="lg:col-span-2 bg-white text-foreground rounded-3xl p-8 shadow-xl">
                <h2 className="text-xl font-bold mb-6">Your Details</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            className="w-full p-3 bg-gray-50 rounded-xl border border-red-500/50 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Country of residency</label>
                        <input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            type="text"
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="United Arab Emirates"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Any Request (Optional)</label>
                        <textarea className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 h-32" />
                    </div>
                </div>
            </div>

            {/* Right Column: Summary Card (Injected here via wrapper or logic? 
                 Actually, CheckoutPage structure has 2 cols. 
                 I should probably just make the Form Component handle the Left col, 
                 and the Button Component take a `disabled` prop? 
                 State sharing is needed.
                 
                 Plan: Make `CheckoutPage` wrap everything in a Client `CheckoutContext` or 
                 Make a BIG component `CheckoutLayout` that holds state?
                 
                 Simpler: Use `CheckoutForm` for the LEFT side, and lift state up?
                 Or just put the Button INSIDE the form (visually outside?).
                 
                 To minimize refactoring: I'll make a `CheckoutPageClient` that replaces the entire grid.
                 It takes the initial booking data as prop.
             */}
        </>
    );
}
