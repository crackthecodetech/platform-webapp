"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Course, Topic, Video } from "@/generated/prisma";
import { PlayCircle } from "lucide-react";

type CourseWithTopicsAndVideos = Course & {
    topics: (Topic & {
        videos: Video[];
    })[];
};

interface CourseDetailsModalProps {
    course: CourseWithTopicsAndVideos;
    isOpen: boolean;
    onClose: () => void;
}

const CourseDetailsModal = ({
    course,
    isOpen,
    onClose,
}: CourseDetailsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{course.title}</DialogTitle>
                    <DialogDescription>{course.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <h3 className="mb-2 text-lg font-semibold">
                        Course Outline
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                        {course.topics.map((topic, index) => (
                            <AccordionItem
                                value={`item-${index}`}
                                key={topic.id}
                            >
                                <AccordionTrigger>
                                    {`Section ${index + 1}: ${topic.title}`}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 pl-4">
                                        {topic.videos.map((video) => (
                                            <li
                                                key={video.id}
                                                className="flex items-center text-sm"
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4 text-gray-500" />
                                                <span>{video.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CourseDetailsModal;
