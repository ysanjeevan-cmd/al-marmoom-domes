
export interface BubbleProduct {
    _id: string;
    name: string;
    descriptionShort?: string;
    coverImage?: string;
    minStayNights: number;
    maxStayNights: number;
    "maxGuests "?: number;
}

export interface BubbleAddon {
    _id: string;
    name: string;
    price: number;
    product: string;
    checkinout?: string[];
    checkin?: string; // API field
    checkout?: string; // API field
}

export interface BubbleBlockedDate {
    date: Date;
    product: string;
}

export interface BubblePricing {
    _id: string;
    datestart: string; // Note: API returns lowercase 's'
    dateEnd: string;
    priceBase: number;
    product: string;
}

export interface TransformedDome {
    id: string;
    name: string;
    description: string;
    image: string;
    guests: number;
    price: number;
}

const BUBBLE_API_ROOT = "https://almarmoomdomes.com/version-test/api/1.1/obj";
const BUBBLE_WORKFLOW_URL = "https://almarmoomdomes-12349.bubbleapps.io/version-test/api/1.1/wf";
const API_TOKEN = "d6c802d139b9bba52224094fc19a239f";

/**
 * Fetches all Products (Mapped to Durations)
 */
export async function getProducts(): Promise<BubbleProduct[]> {
    try {
        const res = await fetch(`${BUBBLE_API_ROOT}/product`, {
            headers: { "Authorization": `Bearer ${API_TOKEN}` },
            next: { revalidate: 3600 }
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        return data.response.results;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getDomes(): Promise<TransformedDome[]> {
    try {
        const [products, pricing] = await Promise.all([
            getProducts(),
            getPricing() // Use getPricing which is defined later, hoisting should work or I can move it
        ]);

        return products.map((product) => {
            const price = pricing.find((p) => p.product === product._id)?.priceBase || 0;
            return {
                id: product._id,
                name: product.name,
                description: product.descriptionShort || "",
                image: product.coverImage ? (product.coverImage.startsWith("//") ? `https:${product.coverImage}` : product.coverImage) : "",
                guests: product["maxGuests "] || 2,
                price: price,
            };
        });
    } catch (error) {
        console.error("Error getting domes:", error);
        return [];
    }
}

/**
 * Fetches all Add-ons
 */
export async function getAddons(): Promise<BubbleAddon[]> {
    try {
        const res = await fetch(`${BUBBLE_API_ROOT}/productAddon`, {
            headers: { "Authorization": `Bearer ${API_TOKEN}` },
            next: { revalidate: 3600 }
        });
        if (!res.ok) throw new Error("Failed to fetch addons");
        const data = await res.json();
        return data.response.results;
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Fetches blocked dates via the Bubble Backend Workflow.
 */
export async function getBlockedDatesViaWorkflow(domeId: string, nights: number = 1): Promise<Date[]> {
    try {
        const checkIn = new Date();
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + nights);

        const response = await fetch(`${BUBBLE_WORKFLOW_URL}/check_availability`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                domeId: domeId,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                guests: 2
            }),
            cache: "no-store"
        });

        if (!response.ok) {
            console.error(`Workflow error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const timestamps = data.response?.blocked_dates || [];

        return timestamps.map((ts: number) => new Date(ts));
    } catch (error) {
        console.error("Error fetching blocked dates from workflow:", error);
        return [];
    }
}

export async function getPricing(): Promise<BubblePricing[]> {
    try {
        const url = `${BUBBLE_API_ROOT}/productPricing`;
        const res = await fetch(url, {
            headers: { "Authorization": `Bearer ${API_TOKEN}` },
            next: { revalidate: 3600 }
        });

        if (!res.ok) throw new Error("Failed to fetch pricing");

        const data = await res.json();
        return data.response.results;
    } catch {
        return [];
    }
}

// Deprecated / Backwards Compat
export async function getBlockedDates(): Promise<BubbleBlockedDate[]> {
    return [];
}

// --- Cart Operations ---

export async function createCart(): Promise<string | null> {
    try {
        const response = await fetch(`${BUBBLE_API_ROOT}/cart`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // status: "Pending" // Removed to avoid Option Set string mismatch issues. 
                // We'll set status via workflow or default value in Bubble.
            }),
        });

        if (!response.ok) throw new Error("Failed to create Cart record");

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error("Error creating cart:", error);
        throw error;
    }
}

export async function updateCart(cartId: string, payload: any): Promise<void> {
    try {
        const response = await fetch(`${BUBBLE_API_ROOT}/cart/${cartId}`, {
            method: "PATCH", // or PUT depending on Bubble defaults, usually PATCH/PUT works
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Bubble Cart Update Error:", response.status, errText);
            throw new Error(`Failed to update Cart: ${errText}`);
        }
    } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
    }
}

export async function createBooking(bookingData: any): Promise<string | null> {
    try {
        const response = await fetch(`${BUBBLE_API_ROOT}/booking`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Bubble API Error:", response.status, errText);

            // Try to parse JSON error from Bubble if possible
            try {
                const errJson = JSON.parse(errText);
                throw new Error(errJson.message || `Bubble Error ${response.status}: ${errText}`);
            } catch (e) {
                throw new Error(`Bubble Error ${response.status}: ${errText}`);
            }
        }

        const data = await response.json();
        return data.id; // Bubble returns { id: "...", status: "success" }
    } catch (error) {
        console.error("Error creating booking:", error);
        return null;
    }
}

export async function getBooking(bookingId: string): Promise<any> {
    try {
        const response = await fetch(`${BUBBLE_API_ROOT}/booking/${bookingId}`, {
            headers: {
                "Authorization": `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 0 } // No cache for fresh booking data
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.response; // Unwrap the Bubble response wrapper
    } catch (error) {
        console.error("Error fetching booking:", error);
        return null;
    }
}
