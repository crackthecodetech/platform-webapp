"use client";
import { animate } from "motion";

export const smoothScrollTo = (targetId: string, offset: number = 0) => {
    const el = document.querySelector(targetId);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - offset;

    animate(window.scrollY, y, {
        duration: 0.8,
        ease: "easeInOut",
        onUpdate: (latest) => window.scrollTo(0, latest),
    });
};
