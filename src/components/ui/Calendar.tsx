"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    isBefore
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CalendarProps {
    mode?: "single" | "range";
    selected?: { from?: Date; to?: Date } | undefined;
    onSelect?: (range: { from?: Date; to?: Date } | undefined) => void;
    disabled?: (date: Date) => boolean;
    numberOfMonths?: number;
    defaultMonth?: Date;
    className?: string;
}

export function Calendar({
    mode = "single",
    selected,
    onSelect,
    disabled,
    className
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const handleDateClick = (day: Date) => {
        if (disabled && disabled(day)) return;

        if (mode === "range" && onSelect) {
            const currentRange = selected || {};
            if (currentRange.from && currentRange.to) {
                // Reset if both selected
                onSelect({ from: day, to: undefined });
            } else if (currentRange.from && !currentRange.to) {
                // Select end date
                if (isBefore(day, currentRange.from)) {
                    onSelect({ from: day, to: currentRange.from });
                } else {
                    onSelect({ ...currentRange, to: day });
                }
            } else {
                // Start selection
                onSelect({ from: day, to: undefined });
            }
        }
    };

    return (
        <div className={cn("p-3 bg-white", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-semibold text-sm">
                    {format(currentMonth, "MMMM yyyy")}
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-muted font-medium w-9">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-y-2">
                {days.map((day, i) => {
                    const isDisabled = disabled ? disabled(day) : false;
                    const isSelected = selected?.from && isSameDay(day, selected.from) || selected?.to && isSameDay(day, selected.to);
                    const isInRange = selected?.from && selected?.to && isWithinInterval(day, { start: selected.from, end: selected.to });
                    const isOutside = !isSameMonth(day, monthStart);

                    if (isOutside) return <div key={i} />;

                    return (
                        <div key={i} className="flex justify-center relative">
                            {/* Connector line for range */}
                            {isInRange && !isSameDay(day, selected.from!) && !isSameDay(day, selected.to!) && (
                                <div className="absolute inset-y-0 left-0 right-0 bg-primary/10" />
                            )}
                            {/* Connector caps */}
                            {selected?.to && isSameDay(day, selected.from!) && (
                                <div className="absolute inset-y-0 right-0 left-1/2 bg-primary/10" />
                            )}
                            {selected?.from && isSameDay(day, selected.to!) && (
                                <div className="absolute inset-y-0 left-0 right-1/2 bg-primary/10" />
                            )}

                            <button
                                onClick={() => handleDateClick(day)}
                                disabled={isDisabled}
                                className={cn(
                                    "relative h-9 w-9 text-sm font-normal rounded-full flex items-center justify-center transition-all z-10",
                                    !isDisabled && !isSelected && "hover:bg-accent hover:text-accent-foreground",
                                    isSelected && "bg-primary text-white hover:bg-primary/90",
                                    isDisabled && "text-muted-foreground opacity-30 line-through cursor-not-allowed bg-gray-50",
                                    isInRange && !isSelected && "bg-transparent text-foreground"
                                )}
                            >
                                {format(day, dateFormat)}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
