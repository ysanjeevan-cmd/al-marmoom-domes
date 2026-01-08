"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { DomeCard, DomeProps } from "@/components/domes/DomeCard";
import { TransformedDome } from "@/lib/bubble";

export function DomesGrid({ domes }: { domes: TransformedDome[] }) {
    return (
        <section className="py-24 px-6 md:px-12 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 md:text-center max-w-2xl mx-auto">
                    <FadeIn delay={0.1}>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Choose Your <span className="text-primary">Sanctuary</span>
                        </h2>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <p className="text-lg text-muted">
                            Each dome is uniquely positioned to offer maximum privacy and varying perspectives of the landscape.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {domes.map((dome, index) => (
                        <FadeIn key={dome.id} delay={0.2 + (index * 0.1)}>
                            <DomeCard dome={dome} />
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
