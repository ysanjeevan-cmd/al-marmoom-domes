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
    pricingRules?: any[];
    products?: any[];
    addons?: any[];
    className?: string;
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
    const numberOfDomes = useMemo(() => {
        const domesForAdults = Math.ceil(adults / 2);
        const domesForChildren = Math.ceil(children / 2);
        const domesForInfants = Math.ceil(infants / 1);
        return Math.max(domesForAdults, domesForChildren, domesForInfants);
    }, [adults, children, infants]);

    // Derived state for sorting products by nights
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => a.min_stay_nights - b.min_stay_nights);
    }, [products]);

    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [nights, setNights] = useState(1);

    // Initialize state when products load
    useEffect(() => {
        if (products.length > 0 && !selectedProductId) {
            setSelectedProductId(products[0].id);
            setNights(products[0].min_stay_nights);
        }
    }, [products, selectedProductId]);

    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [apiPricing, setApiPricing] = useState<{ total: number; breakdown: any[] } | null>(null);

    // Available Add-ons for current product
    const availableAddons = useMemo(() => {
        if (!selectedProductId) return [];
        return addons.filter(a => a.product_ids?.includes(selectedProductId));
    }, [addons, selectedProductId]);

    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    // Fetch availability and pricing whenever selection changes
    useEffect(() => {
        if (!selectedProductId || !dateRange.from) {
            setApiPricing(null);
            return;
        }

        async function fetchInfo() {
            setIsLoadingDates(true);
            try {
                const checkIn = format(dateRange.from!, "yyyy-MM-dd");
                const checkOut = format(dateRange.to!, "yyyy-MM-dd");

                const response = await fetch(`/api/availability?productId=${selectedProductId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&infants=${infants}`);
                const data = await response.json();

                if (data.available) {
                    setApiPricing(data.pricing);
                } else {
                    setApiPricing(null);
                }
            } catch (err) {
                console.error("Failed to load availability/pricing", err);
            } finally {
                setIsLoadingDates(false);
            }
        }

        fetchInfo();
    }, [selectedProductId, dateRange.from, dateRange.to, adults, children, infants]);

    const isDayDisabled = (day: Date) => {
        if (day < startOfDay(new Date())) return true;
        return blockedDates.some(blocked => isSameDay(blocked, day));
    };

    // Addons price calculation (keeping it local for reactivity)
    const addonsPricePerStay = selectedAddons.reduce((sum, addonName) => {
        const addon = availableAddons.find(a => a.name === addonName);
        return sum + (Number(addon?.price) || 0);
    }, 0);

    const totalPrice = ((apiPricing?.total || 0) + addonsPricePerStay) * numberOfDomes;

    // Booking Logic
    const [isBooking, setIsBooking] = useState(false);
    const router = useRouter();

    const handleBookNow = async () => {
        if (!dateRange.from || !selectedProductId) return;
        setIsBooking(true);

        try {
            const addonIds = selectedAddons.map(name => {
                const addon = availableAddons.find(a => a.name === name);
                return addon?.id;
            }).filter(Boolean);

            const payload = {
                productId: selectedProductId,
                nights: nights,
                checkIn: format(dateRange.from, "yyyy-MM-dd"),
                checkOut: format(dateRange.to!, "yyyy-MM-dd"),
                adults: adults,
                children: children,
                infants: infants,
                numberOfDomes: numberOfDomes,
                addons: addonIds,
                pricing: {
                    subtotal: apiPricing?.total || 0,
                    addons: addonsPricePerStay,
                    total: totalPrice,
                    vat: (totalPrice * 0.05) // Example VAT
                },
                customer: {
                    email: "guest@example.com", // Temporary until checkout
                    firstName: "Guest",
                    lastName: "User"
                }
            };

            const res = await fetch("/api/booking", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Booking failed");

            if (data.bookingId) {
                router.push(`/checkout?bookingId=${data.bookingId}`);
            }
        } catch (error: any) {
            console.error("Booking Error:", error);
            alert(`Booking Failed: ${error.message}`);
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
                                <option key={p.id} value={p.id}>
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
                    {/* ... rest of component ... */}
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
                                    <div key={addon.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={addon.id}
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
                                            htmlFor={addon.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                                        >
                                            {addon.name} <span className="text-xs text-muted">({Number(addon.price) > 0 ? `${addon.price} AED` : 'Included'})</span>
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
