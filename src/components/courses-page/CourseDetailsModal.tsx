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
import { Course, Topic, SubTopic, SubTopicType } from "@/generated/prisma";
import { PlayCircle, Code, ClipboardList, FileText } from "lucide-react";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

interface CourseDetailsModalProps {
    course: CourseWithTopicsAndSubTopics;
    isOpen: boolean;
    onClose: () => void;
}

const CourseDetailsModal = ({
    course,
    isOpen,
    onClose,
}: CourseDetailsModalProps) => {
    const renderSubTopicIcon = (type: SubTopicType) => {
        switch (type) {
            case SubTopicType.VIDEO:
                return (
                    <PlayCircle className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                );
            case SubTopicType.CODING_QUESTION:
                return (
                    <Code className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                );
            case SubTopicType.PROJECT:
                return (
                    <ClipboardList className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                );
            case SubTopicType.OFFLINE_CONTENT:
                return (
                    <FileText className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{course.title}</DialogTitle>
                    <DialogDescription>{course.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto">
                    <h3 className="mb-2 text-lg font-semibold">
                        Course Outline
                    </h3>
                    <Accordion
                        type="multiple"
                        defaultValue={course.topics.map((topic) => topic.id)}
                        className="w-full"
                    >
                        {course.topics.map((topic, index) => (
                            <AccordionItem value={topic.id} key={topic.id}>
                                <AccordionTrigger>
                                    {`Section ${index + 1}: ${topic.title}`}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 pl-4">
                                        {topic.subTopics.map((subTopic) => (
                                            <li
                                                key={subTopic.id}
                                                className="flex items-center text-sm"
                                            >
                                                {/* 3. Call the helper function to display the correct icon */}
                                                {renderSubTopicIcon(
                                                    subTopic.type
                                                )}
                                                <span>{subTopic.title}</span>
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
