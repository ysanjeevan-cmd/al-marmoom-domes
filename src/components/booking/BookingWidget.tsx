"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Calendar as CalendarIcon, Users, ChevronRight, Loader2, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/Calendar";
import { Popover } from "@/components/ui/Popover";
import { Checkbox } from "@/components/ui/Checkbox";
import { format, isSameDay, startOfDay, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { BubblePricing, BubbleProduct, BubbleAddon } from "@/lib/bubble";
import { calculateStayPrice } from "@/lib/booking-logic";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
    pricingRules?: BubblePricing[];
    products?: BubbleProduct[];
    addons?: BubbleAddon[];
    className?: string; // Allow overriding styles
}

export function BookingWidget({
    pricingRules = [],
    products = [],
    addons = [],
    className
}: BookingWidgetProps) {
    // Guest State
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    // Domes Calculation
    // Rule: 1 Dome = Max 2 Adults + 2 Children + 1 Infant
    const numberOfDomes = useMemo(() => {
        const domesForAdults = Math.ceil(adults / 2);
        const domesForChildren = Math.ceil(children / 2); // Assuming 2 children limit per dome
        const domesForInfants = Math.ceil(infants / 1);   // Assuming 1 infant limit per dome

        // We take the MAX requirement
        return Math.max(domesForAdults, domesForChildren, domesForInfants);
    }, [adults, children, infants]);

    // Derived state for sorting products by nights
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => a.minStayNights - b.minStayNights);
    }, [products]);

    // Determine initial duration/product
    // Default to the first product (usually 1 night)
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [nights, setNights] = useState(1);

    // Initialize state when products load
    useEffect(() => {
        if (products.length > 0 && !selectedProductId) {
            setSelectedProductId(products[0]._id);
            setNights(products[0].minStayNights);
        }
    }, [products, selectedProductId]);

    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);

    // Add-ons Selection
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // Available Add-ons for current product AND selected Date
    const availableAddons = useMemo(() => {
        if (!selectedProductId) return []; // No product, no addons

        // 1. Filter by Product
        let valid = addons.filter(a => a.product === selectedProductId);

        // 2. Filter by Date (if selected)
        if (dateRange.from) {
            const checkInTime = startOfDay(dateRange.from).getTime();
            valid = valid.filter(a => {
                // If no dates specified on addon, assume valid? Or invalid? 
                // Usually they have dates. If not, maybe it's "Always Valid"?
                if (!a.checkin || !a.checkout) return true;

                const start = startOfDay(parseISO(a.checkin)).getTime();
                const end = startOfDay(parseISO(a.checkout)).getTime();

                // Standard specific matching: Valid if CheckIn is inside [Start, End]
                // Using Inclusive matching
                return checkInTime >= start && checkInTime <= end;
            });
        } else {
            // Return empty if no date selected
            return [];
        }

        return valid;
    }, [addons, selectedProductId, dateRange.from]);

    // Fetch blocked dates whenever Product changes
    useEffect(() => {
        if (!selectedProductId) return;

        async function fetchAvailability() {
            setIsLoadingDates(true);
            try {
                const response = await fetch("/api/availability", {
                    method: "POST",
                    body: JSON.stringify({
                        domeId: selectedProductId,
                        nights: nights
                    })
                });
                const data = await response.json();

                const dates = (data.blocked_dates || []).map((d: string) => new Date(d));
                setBlockedDates(dates);
            } catch (err) {
                console.error("Failed to load availability", err);
            } finally {
                setIsLoadingDates(false);
            }
        }

        fetchAvailability();
    }, [selectedProductId, nights]);


    const isDayDisabled = (day: Date) => {
        // 1. Block past dates
        if (day < startOfDay(new Date())) return true;

        // 2. Block manually blocked dates from API
        return blockedDates.some(blocked => isSameDay(blocked, day));
    };

    // Calculate Price
    // PriceBase is usually "Per Dome Per Stay" (based on Product ID).
    // So distinct Domes means distinct Price.
    const basePricePerDome = (dateRange.from && dateRange.to && selectedProductId)
        ? calculateStayPrice(dateRange.from, dateRange.to, pricingRules.filter(p => p.product === selectedProductId)).total
        : 0;

    // Addons are "Per Stay" logic currently. Are they per Dome?
    // Usually "Breakfast" is per person? Or "Full Board"? 
    // The previous code was "Addon Price * 1".
    // If I select "Breakfast", is it for everyone?
    // Let's assume Addons are per DOME for now (User's screenshot "Dome with Breakfast").
    // If it's Per Person, I'd need metadata on the Addon.
    // For now: (Base + Addons) * Domes.

    const addonsPricePerDome = selectedAddons.reduce((sum, addonName) => {
        const addon = availableAddons.find(a => a.name === addonName);
        return sum + (addon?.price || 0);
    }, 0);

    const totalPrice = (basePricePerDome + addonsPricePerDome) * numberOfDomes;

    // Booking Logic
    const [isBooking, setIsBooking] = useState(false);
    const router = useRouter();

    const handleBookNow = async () => {
        if (!dateRange.from || !selectedProductId) return;
        setIsBooking(true);

        try {
            // Map selected addon names back to IDs
            const addonIds = selectedAddons.map(name => {
                const addon = availableAddons.find(a => a.name === name);
                return addon?._id;
            }).filter(Boolean);

            const payload = {
                product: selectedProductId,
                nights: nights,
                checkIn: dateRange.from ? dateRange.from.toISOString() : null, // Revert to ISO (safer for APIs)
                checkOut: dateRange.to ? dateRange.to.toISOString() : null,
                numberOfGuests: adults + children + infants,
                guestsAdult: adults,
                guestsChildren: children,
                guestsInfants: infants,
                numberOfDomes: numberOfDomes,
                addons: addonIds,
                priceTotal: totalPrice,
                status: "Cart"
            };

            const res = await fetch("/api/booking", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                // Throw with message from server if available
                throw new Error(data.error || "Booking creation failed");
            }

            if (data.id) {
                router.push(`/checkout?bookingId=${data.id}`);
            } else {
                throw new Error("No Booking ID returned");
            }
        } catch (error: any) {
            console.error("Booking Error:", error);
            alert(`Booking Failed: ${error.message || "Unknown Error"}`);
        } finally {
            setIsBooking(false);
        }
    };


    return (
        <FadeIn delay={0.6} className={cn("w-full max-w-5xl mx-auto -mt-12 relative z-20 px-6", className)}>
            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/5 border border-black/5 flex flex-col gap-6">

                {/* Top Row: Dropdowns */}
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* 1. Duration (Dynamic) */}
                    <div className="flex-1 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1">
                            <CalendarIcon className="w-4 h-4 text-primary" /> Duration
                        </label>
                        <select
                            className="w-full bg-transparent font-medium text-lg outline-none text-foreground appearance-none cursor-pointer"
                            value={selectedProductId}
                            onChange={(e) => {
                                const pid = e.target.value;
                                const product = products.find(p => p._id === pid);
                                if (product) {
                                    setSelectedProductId(pid);
                                    setNights(product.minStayNights);

                                    // Reset dates if duration changes to avoid invalid ranges
                                    setDateRange({ from: undefined, to: undefined });
                                }
                            }}
                        >
                            {products.length === 0 && <option>Loading...</option>}
                            {sortedProducts.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-px h-12 bg-gray-200 hidden lg:block" />

                    {/* 2. Check In */}
                    <Popover
                        trigger={
                            <div className="flex-1 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group min-w-[150px] border border-transparent hover:border-gray-100">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1">
                                    <CalendarIcon className="w-4 h-4 text-primary" /> Check In
                                </label>
                                <div className="text-lg font-medium text-foreground relative">
                                    {isLoadingDates ? (
                                        <span className="flex items-center text-muted gap-2 text-sm"><Loader2 className="animate-spin w-4 h-4" /> Loading...</span>
                                    ) : (
                                        dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "Select Date"
                                    )}
                                </div>
                            </div>
                        }
                        content={
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={range => {
                                    if (range?.from) {
                                        const toDate = new Date(range.from);
                                        toDate.setDate(toDate.getDate() + nights);
                                        setDateRange({ from: range.from, to: toDate });
                                    } else {
                                        setDateRange({ from: undefined, to: undefined });
                                    }
                                }}
                                disabled={isDayDisabled}
                                numberOfMonths={1}
                                defaultMonth={dateRange.from || new Date()}
                            />
                        }
                    />

                    <div className="w-px h-12 bg-gray-200 hidden lg:block" />

                    {/* 3. Guests & Domes */}
                    <Popover
                        trigger={
                            <div className="flex-1 w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group min-w-[150px] border border-transparent hover:border-gray-100">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1">
                                    <Users className="w-4 h-4 text-primary" /> Guests
                                </label>
                                <div className="text-lg font-medium text-foreground relative truncate">
                                    {numberOfDomes} Dome{numberOfDomes > 1 ? 's' : ''}, {adults + children + infants} Guest{adults + children + infants > 1 ? 's' : ''}
                                </div>
                            </div>
                        }
                        content={
                            <div className="p-4 w-80 bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-semibold border-b border-gray-100 pb-2">
                                    <span>No. of Domes</span>
                                    <span className="text-primary text-lg">{numberOfDomes}</span>
                                </div>

                                {/* Adults */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Adults</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setAdults(Math.max(1, adults - 1))}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            disabled={adults <= 1}
                                        >-</button>
                                        <span className="w-4 text-center">{adults}</span>
                                        <button
                                            onClick={() => setAdults(adults + 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 bg-primary/5 border-primary/20 text-primary"
                                        >+</button>
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Children</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setChildren(Math.max(0, children - 1))}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            disabled={children <= 0}
                                        >-</button>
                                        <span className="w-4 text-center">{children}</span>
                                        <button
                                            onClick={() => setChildren(children + 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 bg-primary/5 border-primary/20 text-primary"
                                        >+</button>
                                    </div>
                                </div>

                                {/* Infants */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Infants</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setInfants(Math.max(0, infants - 1))}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                            disabled={infants <= 0}
                                        >-</button>
                                        <span className="w-4 text-center">{infants}</span>
                                        <button
                                            onClick={() => setInfants(infants + 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 bg-primary/5 border-primary/20 text-primary"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>

                {/* Middle Row: Guests & Add-ons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-100">

                    {/* Add-ons List */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-1">
                            <Plus className="w-4 h-4 text-primary" /> Enhance Your Stay (Add-ons)
                        </label>
                        {!dateRange.from ? (
                            <p className="text-sm text-muted italic">Select a Check-In Date to view available experiences.</p>
                        ) : availableAddons.length === 0 ? (
                            <p className="text-sm text-muted italic">No add-ons available for these dates.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableAddons.map(addon => (
                                    <div key={addon._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={addon._id}
                                            checked={selectedAddons.includes(addon.name)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedAddons([...selectedAddons, addon.name]);
                                                } else {
                                                    setSelectedAddons(selectedAddons.filter(n => n !== addon.name));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={addon._id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                                        >
                                            {addon.name} <span className="text-xs text-muted">({addon.price > 0 ? `${addon.price} AED` : 'Included'})</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end gap-2 justify-end">
                        <div className="text-right">
                            <p className="text-xs text-muted">Total (AED)</p>
                            <p className="text-3xl font-bold text-primary">
                                {totalPrice > 0 ? `${totalPrice}` : "-"} <span className="text-sm font-normal text-muted">AED</span>
                            </p>
                        </div>
                        <Button
                            size="lg"
                            disabled={!dateRange.from || isLoadingDates || isBooking}
                            onClick={handleBookNow}
                            className="w-full md:w-auto h-14 rounded-xl px-8 text-lg shadow-primary/25 shadow-xl disabled:opacity-70 transition-all font-bold"
                        >
                            {isBooking || isLoadingDates ? <Loader2 className="animate-spin" /> : "Book Now"}
                        </Button>
                    </div>

                </div>

            </div>
        </FadeIn>
    );
}
