import { NextResponse } from "next/server";
import { getBlockedDatesViaWorkflow } from "@/lib/bubble";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { domeId, nights, checkIn } = body;

        // Call the Bubble Workflow
        // We assume the workflow logic uses these params to find the correct product availability
        // If your workflow relies on 'domeId' to determine product variants for nights, 
        // passing 'nights' might not be standard bubble param unless you add it.
        // For now, we forward what we have. 

        // Note: The user's workflow initialized with: checkIn, checkOut, guests, domeId.
        // We need to adhere to that contract.

        const now = new Date();
        const checkInDate = checkIn ? new Date(checkIn) : now;
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + (nights || 1));

        // Using our existing library function which wraps the fetch
        // We might need to adjust bubble.ts to accept these explicit params if not already generic
        const blockedDates = await getBlockedDatesViaWorkflow(domeId, nights);

        return NextResponse.json({ blocked_dates: blockedDates });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }
}
