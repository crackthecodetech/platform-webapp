'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CourseFormValues } from './create-course/CreateCourseForm';

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};

export function CourseSidebar() {
    const { control } = useFormContext<CourseFormValues>();

    const courseTitle = useWatch({
        control,
        name: 'title',
    });

    const topics = useWatch({
        control,
        name: 'topics',
    });

    return (
        <aside className="w-72 flex-shrink-0 border-r bg-gray-50 p-4 overflow-y-auto h-full">
            <h2 className="text-lg font-semibold mb-4">Course Outline</h2>
            <nav className="space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('course-details')}
                >
                    {courseTitle || 'Course Details'}
                </Button>
                <div className="space-y-1">
                    {topics?.map((topic, topicIndex) => (
                        <Collapsible
                            key={topic.title || topicIndex}
                            className="w-full"
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between"
                                    onClick={() =>
                                        scrollToSection(`topic-${topicIndex}`)
                                    }
                                >
                                    <span className="truncate pr-2">
                                        {topic.title ||
                                            `Topic ${topicIndex + 1}`}
                                    </span>
                                    <ChevronsUpDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="pl-4 mt-1 space-y-1">
                                    {topic.subTopics?.map(
                                        (subTopic, subTopicIndex) => (
                                            <Button
                                                key={
                                                    subTopic.title ||
                                                    subTopicIndex
                                                }
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start font-normal"
                                                onClick={() =>
                                                    scrollToSection(
                                                        `topic-${topicIndex}-subtopic-${subTopicIndex}`,
                                                    )
                                                }
                                            >
                                                <span className="truncate">
                                                    {subTopic.title ||
                                                        `Subtopic ${subTopicIndex + 1}`}
                                                </span>
                                            </Button>
                                        ),
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
