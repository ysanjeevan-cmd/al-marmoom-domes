import { startOfDay, addDays, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { BubbleBlockedDate, BubblePricing } from "./bubble";

/**
 * Checks if a specific date is blocked.
 * Blocked if it exists in the ProductBlockedDate table.
 */
export function isDateBlocked(
    date: Date,
    blockedDates: BubbleBlockedDate[]
): boolean {
    const dayStart = startOfDay(date);

    // Use string comparison or date-fns comparison
    return blockedDates.some(blocked => {
        if (!blocked.date) return false;
        // Bubble API returns Date strings usually, we need to handle that.
        const blockedDate = typeof blocked.date === 'string' ? parseISO(blocked.date) : blocked.date;
        return isSameDay(blockedDate, dayStart);
    });
}

/**
 * Calculates total price for a stay.
 * Returns breakdown of daily rates.
 */
export function calculateStayPrice(
    checkIn: Date,
    checkOut: Date,
    pricingRules: BubblePricing[],
    productId?: string
): { total: number; breakdown: any[] } {

    // Logic for "Product" pricing (Per Stay / Per Package)
    // The User stated: "priceBase which is the actual price of that product in the date range (datestart/dateEnd)".
    if (productId) {
        // Filter rules for this product
        const productRules = pricingRules.filter(r => r.product === productId);

        // Find the rule active on Check-In date
        // We compare using "startOfDay" logic to be safe against timezones.
        const checkInTime = startOfDay(checkIn).getTime();

        const activeRule = productRules.find(r => {
            if (!r.datestart || !r.dateEnd) return false;

            // Parse ISO strings from Bubble API
            const ruleStart = startOfDay(parseISO(r.datestart)).getTime();
            const ruleEnd = startOfDay(parseISO(r.dateEnd)).getTime();

            // Logic: Is CheckIn within [Start, End)?
            // Usually Rule 1: Aug 1 - Aug 31. Rule 2: Aug 31 - Sept 30.
            // If I check in Aug 31, I usually fall into Rule 2? Or Rule 1?
            // User data:
            // Rule A: End Aug 30. 
            // Rule B: Start Aug 31.
            // There is a gap between 30th and 31st? Or just specific dates?
            // Actually Rule A end: "2025-08-30T20:00:00.000Z" (Which is Aug 30th evening / Aug 31st morning local?)
            // If the user says "datestart/dateEnd", likely Inclusive Start, Exclusive End for continuity.
            // Let's rely on standard: checkIn >= start && checkIn < end.
            // If strict gap (30th vs 31st), this works.

            return checkInTime >= ruleStart && checkInTime < ruleEnd;
        });

        if (activeRule) {
            return {
                total: activeRule.priceBase,
                breakdown: [{ date: checkIn, price: activeRule.priceBase, note: "Package Price" }]
            };
        }

        console.warn("No pricing rule found for product", productId, "on date", checkIn);
        // Fallback: Return 0 or maybe try to match any rule? No, stricter is better.
        return { total: 0, breakdown: [] };
    }

    // Fallback: Nightly Logic (Legacy, if no productId provided)
    let total = 0;
    const breakdown = [];
    let current = startOfDay(checkIn);
    const end = startOfDay(checkOut);

    while (current < end) {
        const checkTime = current.getTime();
        const rule = pricingRules.find(r => {
            if (!r.datestart || !r.dateEnd) return false;
            const s = startOfDay(parseISO(r.datestart)).getTime();
            const e = startOfDay(parseISO(r.dateEnd)).getTime();
            return checkTime >= s && checkTime < e;
        });

        const nightlyRate = rule ? rule.priceBase : 0;
        total += nightlyRate;
        breakdown.push({
            date: new Date(current),
            price: nightlyRate
        });
        current = addDays(current, 1);
    }

    return { total, breakdown };
}
