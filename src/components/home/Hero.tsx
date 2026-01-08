import { FadeIn } from "@/components/ui/FadeIn";
import Image from "next/image";

export function Hero({ children }: { children?: React.ReactNode }) {
    return (
        <section className="relative min-h-screen w-full flex flex-col justify-center px-6 pt-24 md:px-12 md:pt-0 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-br from-blue-50 to-purple-50 blur-3xl opacity-50 -z-10 rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
                {/* Left: Text Content */}
                <div className="flex flex-col gap-6 z-10">
                    <FadeIn delay={0.1}>
                        <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-xs font-semibold tracking-wider uppercase mb-4">
                            Premium Eco-Resort
                        </span>
                    </FadeIn>

                    <FadeIn delay={0.2} className="max-w-2xl">
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                            Sleep Under the <br />
                            <span className="text-primary">Stars.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <p className="text-lg md:text-xl text-muted max-w-md leading-relaxed">
                            Experience nature without compromising on luxury. Our geodetic domes offer panoramic views, premium amenities, and complete privacy.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.4} className="flex gap-4 pt-4">
                        {children || (
                            <>
                                <button className="px-8 py-4 rounded-full bg-foreground text-white font-semibold hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95">
                                    Check Availability
                                </button>
                                <button className="px-8 py-4 rounded-full border border-black/10 hover:bg-black/5 font-semibold transition-all">
                                    View Gallery
                                </button>
                            </>
                        )}
                    </FadeIn>
                </div>

                {/* Right: Immersive Visual */}
                <div className="relative h-[60vh] w-full hidden md:block">
                    <FadeIn delay={0.5} direction="left" className="h-full w-full">
                        <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
                            {/* Using a placeholder from Unsplash until we have real assets. 
                  In production, this would be a local image. 
              */}
                            <Image
                                src="https://images.unsplash.com/photo-1523497676644-8d91b48b1115?q=80&w=2070&auto=format&fit=crop"
                                alt="Luxury Dome Interior"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                priority
                            />

                            {/* Floating Badge */}
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg max-w-xs">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-yellow-500">★★★★★</span>
                                    <span className="text-xs font-bold text-muted">4.9 (120 Reviews)</span>
                                </div>
                                <p className="text-sm font-medium">"An unforgettable experience. The morning light is magic."</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
