"use client";

import React, { useRef } from "react";
import { motion, Variants, useInView } from "framer-motion";

type Props = {
    id?: string;
    className?: string;
    variants?: Variants;
    amount?: number;
    children?: React.ReactNode;
};

export default function AnimatedSection({
    id,
    className,
    variants,
    amount = 0.18,
    children,
}: Props) {
    const ref = useRef<HTMLElement | null>(null);
    const inView = useInView(ref, { amount, once: false });

    return (
        <motion.section
            id={id}
            ref={ref}
            className={className}
            variants={variants}
            initial="hidden"
            // explicit animate toggles on every enter/exit
            animate={inView ? "visible" : "hidden"}
        >
            {children}
        </motion.section>
    );
}
