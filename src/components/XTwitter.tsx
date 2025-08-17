"use client";
import dynamic from "next/dynamic";

const FaXTwitter = dynamic(() =>
    import("react-icons/fa6").then((m) => m.FaXTwitter)
);

export default function XTwitter(props: any) {
    return <FaXTwitter {...props} />;
}
