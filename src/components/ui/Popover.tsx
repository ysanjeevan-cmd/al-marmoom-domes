"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
    trigger: React.ReactNode;
    content: React.ReactNode;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Popover({ trigger, content, className, open: controlledOpen, onOpenChange }: PopoverProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = controlledOpen ?? uncontrolledOpen;
    const setIsOpen = onOpenChange ?? setUncontrolledOpen;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className={cn("relative", className)} ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-xl border p-2 min-w-[300px]">
                    {content}
                </div>
            )}
        </div>
    );
}
