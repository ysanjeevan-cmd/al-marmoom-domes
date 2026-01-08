import Link from "next/link";
import { Button } from "@/components/ui/Button"; // We will create this next

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-background/80 border-b border-black/5">
            <div className="flex items-center gap-2">
                <Link href="/" className="text-xl font-bold tracking-tight z-50">
                    DOME<span className="text-primary">.</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
                <Link href="/domes" className="hover:text-foreground transition-colors">
                    The Domes
                </Link>
                <Link href="/experience" className="hover:text-foreground transition-colors">
                    Experience
                </Link>
                <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-sm font-medium hover:underline hidden md:block">
                    Sign In
                </button>
                <Link
                    href="/book"
                    className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    Book Your Stay
                </Link>
            </div>
        </nav>
    );
}
