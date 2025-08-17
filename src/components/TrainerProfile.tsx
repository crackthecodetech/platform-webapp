"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrainerProfileProps {
    name: string;
    title: string;
    bio: string;
    imageUrl: string;
    skills?: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
}

export function TrainerProfile({
    name,
    title,
    bio,
    imageUrl,
    skills = [],
    github,
    linkedin,
    twitter,
}: TrainerProfileProps) {
    return (
        <Card className="w-full max-w-sm mx-auto shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <CardTitle className="mt-4 text-center text-xl">
                    {name}
                </CardTitle>
                <p className="text-sm text-gray-500">{title}</p>
            </CardHeader>

            <CardContent className="text-center">
                <p className="text-gray-600">{bio}</p>
                {skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {skills.map((skill, i) => (
                            <Badge key={i} variant="secondary">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-center space-x-4">
                {github && (
                    <Link
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Github className="w-5 h-5 hover:text-primary transition-colors" />
                    </Link>
                )}
                {linkedin && (
                    <Link
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Linkedin className="w-5 h-5 hover:text-primary transition-colors" />
                    </Link>
                )}
                {twitter && (
                    <Link
                        href={twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Twitter className="w-5 h-5 hover:text-primary transition-colors" />
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
