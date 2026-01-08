"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type FadeInProps = {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right";
};

export function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up",
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const directionOffset = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    };

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                ...directionOffset[direction],
            }}
            animate={
                isInView
                    ? { opacity: 1, x: 0, y: 0 }
                    : { opacity: 0, ...directionOffset[direction] }
            }
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom "spring-like" ease
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
