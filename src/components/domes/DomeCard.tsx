"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Users, Wifi, Wind } from "lucide-react";

export type DomeProps = {
    id: string;
    name: string;
    price: number;
    guests: number;
    image: string;
    description: string;
};

export function DomeCard({ dome }: { dome: DomeProps }) {
    return (
        <div className="group relative bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2">
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden">
                <Image
                    src={dome.image}
                    alt={dome.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-lg">
                    ${dome.price} / night
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-sans tracking-tight group-hover:text-primary transition-colors">
                        {dome.name}
                    </h3>
                </div>

                <p className="text-sm text-muted mb-6 line-clamp-2">
                    {dome.description}
                </p>

                {/* Amenities Icons (Static for prototype) */}
                <div className="flex gap-4 mb-6 text-muted">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Users className="w-4 h-4" />
                        <span>Up to {dome.guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Wifi className="w-4 h-4" />
                        <span>Fast Wifi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Wind className="w-4 h-4" />
                        <span>AC</span>
                    </div>
                </div>

                <Button asChild variant="outline" className="w-full rounded-2xl group-hover:bg-primary group-hover:text-white border-black/10">
                    <Link href="/book-now">
                        View Details
                    </Link>
                </Button>
            </div>
        </div>
    );
}
