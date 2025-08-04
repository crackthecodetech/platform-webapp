"use client";

import React, { useRef, useState } from "react";

interface VideoPlayerProps {
    url?: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPlayed, setHasPlayed] = useState(false);

    if (!url) return <div>No video selected.</div>;

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setHasPlayed(true);
        }
    };

    return (
        <div className="relative w-full h-full aspect-video bg-black">
            <video
                ref={videoRef}
                src={url}
                controls={hasPlayed}
                preload="metadata"
                className="w-full h-full"
            />

            {!hasPlayed && (
                <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-semibold transition hover:bg-black/70"
                >
                    Tap to Play
                </button>
            )}
        </div>
    );
}
