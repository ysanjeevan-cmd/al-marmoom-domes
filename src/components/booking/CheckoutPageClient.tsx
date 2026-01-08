"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Lock, Loader2, ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";

export default function CheckoutPageClient({ booking }: { booking: any }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "+971 ",
        country: "",
    });

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
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

    // Safely parse dates inside the client component or pass strings?
    // Passed as prop from Server Component, they are strings basically if coming from Bubble JSON.
    // But better to handle parsing safely.
    const checkIn = booking.check_in ? parseISO(booking.check_in) : null;
    const checkOut = booking.check_out ? parseISO(booking.check_out) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Any Request (Optional)</label>
                        <textarea className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 h-32" />
                    </div>
                </div>
            </div>

            {/* Right Column: Summary Card */}
            <div className="bg-white text-foreground rounded-3xl p-8 shadow-xl h-fit">
                <h2 className="text-xl font-bold mb-6">Booking Summary</h2>

                <div className="flex gap-4 mb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${booking.product?.cover_image || '/hero.jpg'})` }}></div>
                    <div>
                        <h3 className="font-bold">{booking.product?.name || 'Dome Stay'}</h3>
                        <p className="text-sm text-muted">Guests: {booking.guests_adult + booking.guests_children + booking.guests_infants}</p>
                        <p className="text-sm text-muted">Nights: {booking.nights}</p>
                        <p className="text-sm text-muted mt-2">
                            Check-in: {checkIn ? format(checkIn, "EEE, dd MMM") : "-"}
                        </p>
                        <p className="text-sm text-muted">
                            Check-out: {checkOut ? format(checkOut, "EEE, dd MMM") : "-"}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 py-6 border-t border-gray-100">
                    <p className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Price Breakdown</p>
                    <div className="flex justify-between text-sm">
                        <span>{booking.number_of_domes || 1} Dome(s) x {booking.nights} Nights</span>
                        <span>AED {booking.price_total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Taxes & Fees</span>
                        <span>Included</span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                    <span className="font-bold text-lg">Total (AED)</span>
                    <span className="font-bold text-2xl">AED {booking.price_total}</span>
                </div>

                <CheckoutButton
                    bookingId={booking.id}
                    email={formData.email}
                    disabled={!isValid}
                />
            </div>
        </div>
    );
}

