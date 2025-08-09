import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getExpiryDate = (daysToAdd: number): Date => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysToAdd);

    return futureDate;
};
