"use client";

import React, { Dispatch } from "react";
import Link from "next/link";

type NavLink = {
    href: string;
    label: string;
    show: boolean;
};

export default function NavLinks({
    links,
    onClick = null,
}: {
    links: NavLink[];
    onClick?: Dispatch<React.SetStateAction<Boolean>> | null;
}) {
    return (
        <>
            {links.map(
                (link) =>
                    link.show && (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                            onClick={onClick ? () => onClick(false) : () => {}}
                        >
                            {link.label}
                        </Link>
                    )
            )}
        </>
    );
}
