"use client";

import { useState } from "react";
import { Course, SubTopic, SubTopicType, Topic } from "@/generated/prisma";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Menu, X, Code, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Prisma } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
    ssr: false,
    loading: () => <div className="aspect-video bg-black animate-pulse" />,
});

interface TestCase {
    input: string;
    output: string;
}

const CourseDisplayClient = ({
    course,
}: {
    course: CourseWithTopicsAndSubTopics;
}) => {
    const [activeSubtopic, setActiveSubTopic] = useState<SubTopic | null>(
        course.topics[0]?.subTopics[0] || null
    );
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const totalSubtopics = course.topics.reduce(
        (acc, topic) => acc + topic.subTopics.length,
        0
    );

    const getTestCases = (cases: Prisma.JsonValue | null): TestCase[] => {
        if (Array.isArray(cases)) {
            return cases as unknown as TestCase[];
        }
        return [];
    };

    const renderSubTopicIcon = (type: SubTopicType) => {
        switch (type) {
            case SubTopicType.VIDEO:
                return (
                    <PlayCircle className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
                );
            case SubTopicType.CODING_QUESTION:
                return (
                    <Code className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
                );
            case SubTopicType.PROJECT:
                return (
                    <ClipboardList className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            <header className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h1 className="text-xl font-bold">{course.title}</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </header>
            <ResizablePanelGroup direction="horizontal" className="flex-grow">
                <ResizablePanel defaultSize={75} className="min-w-[300px]">
                    <main className="p-4 md:p-8 flex flex-col h-full">
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-background mb-6">
                            {!activeSubtopic && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Select a lesson to begin.
                                </div>
                            )}
                            {activeSubtopic?.type === SubTopicType.VIDEO && (
                                <VideoPlayer
                                    subTopicId={activeSubtopic.id}
                                    url={activeSubtopic.videoUrl!}
                                />
                            )}
                            {(activeSubtopic?.type ===
                                SubTopicType.CODING_QUESTION ||
                                activeSubtopic?.type ===
                                    SubTopicType.PROJECT) && (
                                <div className="bg-gray-50 dark:bg-gray-900 text-foreground h-full overflow-y-auto p-6">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {activeSubtopic.title}
                                    </h2>
                                    <div className="prose dark:prose-invert max-w-none mb-8">
                                        <ReactMarkdown>
                                            {activeSubtopic.type ===
                                            SubTopicType.CODING_QUESTION
                                                ? activeSubtopic.question!
                                                : activeSubtopic.projectMarkdown!}
                                        </ReactMarkdown>
                                    </div>

                                    {activeSubtopic.type ===
                                        SubTopicType.CODING_QUESTION && (
                                        <>
                                            <Separator />
                                            <div className="mt-6">
                                                <h3 className="text-xl font-semibold mb-4">
                                                    Test Cases
                                                </h3>
                                                <div className="space-y-4">
                                                    {getTestCases(
                                                        activeSubtopic.testCases
                                                    ).map((tc, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 border rounded-lg bg-background"
                                                        >
                                                            <p className="font-semibold mb-2">
                                                                Test Case{" "}
                                                                {index + 1}
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-sm font-medium text-muted-foreground">
                                                                        Input
                                                                    </label>
                                                                    <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1 text-sm">
                                                                        <code>
                                                                            {
                                                                                tc.input
                                                                            }
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-muted-foreground">
                                                                        Output
                                                                    </label>
                                                                    <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1 text-sm">
                                                                        <code>
                                                                            {
                                                                                tc.output
                                                                            }
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {activeSubtopic?.type ===
                        SubTopicType.CODING_QUESTION ? (
                            <div className="flex-grow bg-white border rounded-lg">
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Coding Area - Coming Soon!</p>
                                </div>
                            </div>
                        ) : (
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="overview">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="qa">Q&A</TabsTrigger>
                                    <TabsTrigger value="reviews">
                                        Reviews
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="overview"
                                    className="mt-4 text-sm text-muted-foreground"
                                >
                                    <h2 className="text-2xl font-semibold mb-2 text-foreground">
                                        About this course
                                    </h2>
                                    <p>{course.description}</p>
                                </TabsContent>
                                <TabsContent value="qa" className="mt-4">
                                    Q&A section coming soon.
                                </TabsContent>
                                <TabsContent value="reviews" className="mt-4">
                                    Reviews section coming soon.
                                </TabsContent>
                            </Tabs>
                        )}
                    </main>
                </ResizablePanel>
                {isSidebarOpen && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel
                            defaultSize={25}
                            minSize={20}
                            maxSize={30}
                            className="min-w-[280px]"
                        >
                            <aside className="h-full p-4 border-l">
                                <h2 className="text-lg font-semibold mb-4">
                                    {totalSubtopics} Lessons
                                </h2>
                                <div className="space-y-4">
                                    {course.topics.map((topic, index) => (
                                        <div key={topic.id}>
                                            <h3 className="font-semibold mb-2 text-gray-800">
                                                {`Section ${index + 1}: ${
                                                    topic.title
                                                }`}
                                            </h3>
                                            <ul className="space-y-1">
                                                {topic.subTopics.map(
                                                    (subTopic) => (
                                                        <li
                                                            key={subTopic.id}
                                                            onClick={() =>
                                                                setActiveSubTopic(
                                                                    subTopic
                                                                )
                                                            }
                                                            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                                                activeSubtopic?.id ===
                                                                subTopic.id
                                                                    ? "bg-primary/10 text-primary font-semibold"
                                                                    : "hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {renderSubTopicIcon(
                                                                subTopic.type
                                                            )}
                                                            <span className="flex-grow text-sm">
                                                                {subTopic.title}
                                                            </span>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </div>
    );
};

export default CourseDisplayClient;
