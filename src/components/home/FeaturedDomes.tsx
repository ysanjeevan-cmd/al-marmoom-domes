import { getDomes } from "@/lib/bubble";
import { DomesGrid } from "./DomesGrid";

export async function FeaturedDomes() {
    const domes = await getDomes();
    console.log("Featured Domes Count:", domes.length); // Debug
    if (domes.length === 0) {
        return <div className="p-8 text-center text-red-500 font-bold border-2 border-red-500 rounded-xl m-8">
            DEBUG: Domes List is Empty. Check API Response.
        </div>;
    }

    return <DomesGrid domes={domes} />;
}
