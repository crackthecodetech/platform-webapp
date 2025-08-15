"use client";

import React from "react";
import Link from "next/link";

type NavLink = {
    href: string;
    label: string;
    show: boolean;
};

export default function NavLinks({ links }: { links: NavLink[] }) {
    return (
        <>
            {links.map(
                (link) =>
                    link.show && (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                        >
                            {link.label}
                        </Link>
                    )
            )}
        </>
    );
}
