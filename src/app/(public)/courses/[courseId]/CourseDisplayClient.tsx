"use client";

import { useState, useEffect } from "react";
import remarkGfm from "remark-gfm";
import { Course, SubTopic, SubTopicType, Topic } from "@/generated/prisma";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PlayCircle,
    Menu,
    X,
    Code,
    ClipboardList,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Prisma } from "@/generated/prisma";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import CodeEditor from "./CodingEditor";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
    ssr: false,
    loading: () => (
        <div className="aspect-video w-full bg-black animate-pulse" />
    ),
});

interface TestCase {
    stdin: string;
    expected_output: string;
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

    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [activeSubtopic]);

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
            case SubTopicType.OFFLINE_CONTENT:
                return (
                    <FileText className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" />
                );
            default:
                return null;
        }
    };

    const getHtmlContent = () => {
        if (!activeSubtopic) {
            return "";
        }

        switch (activeSubtopic.type) {
            case SubTopicType.CODING_QUESTION:
                if (activeSubtopic.questionSource === "MANUAL") {
                    return activeSubtopic.questionMarkdown || "";
                }
                return activeSubtopic.questionHTML || "";
            case SubTopicType.PROJECT:
                return activeSubtopic.projectMarkdown || "";
            case SubTopicType.OFFLINE_CONTENT:
                return activeSubtopic.offlineContentMarkdown || "";
            default:
                return "";
        }
    };

    const MainContent = (
        <main className="p-4 md:p-8 flex flex-col h-full overflow-y-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-background mb-6 flex-shrink-0">
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
                {(activeSubtopic?.type === SubTopicType.CODING_QUESTION ||
                    activeSubtopic?.type === SubTopicType.PROJECT ||
                    activeSubtopic?.type === SubTopicType.OFFLINE_CONTENT) && (
                    <div className="bg-gray-50 dark:bg-gray-900 text-foreground h-full overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {activeSubtopic.title}
                        </h2>
                        <div className="prose dark:prose-invert max-w-none mb-8">
                            {activeSubtopic?.type ===
                                SubTopicType.CODING_QUESTION &&
                            activeSubtopic.questionSource === "LEETCODE" ? (
                                <div
                                    className="prose dark:prose-invert max-w-none mb-8"
                                    dangerouslySetInnerHTML={{
                                        __html: getHtmlContent(),
                                    }}
                                />
                            ) : (
                                <div className="whitespace-pre-wrap">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            ),
                                        }}
                                    >
                                        {getHtmlContent()}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                        {activeSubtopic.type === SubTopicType.CODING_QUESTION &&
                            getTestCases(activeSubtopic.testCases).length >
                                0 && (
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
                                                        Test Case {index + 1}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Input
                                                            </label>
                                                            <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1 text-sm">
                                                                <code>
                                                                    {tc.stdin}
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
                                                                        tc.expected_output
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
            <div className="flex flex-col flex-grow">
                {activeSubtopic?.type === SubTopicType.CODING_QUESTION &&
                getTestCases(activeSubtopic.testCases).length > 0 ? (
                    <div className="bg-white border rounded-lg flex flex-col flex-grow min-h-[400px]">
                        <CodeEditor
                            testCases={getTestCases(activeSubtopic.testCases)}
                            code_title={activeSubtopic.title}
                        />
                    </div>
                ) : (
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="qa">Q&A</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
            </div>
        </main>
    );

    const SidebarContent = (
        <aside className="h-full p-4 border-l overflow-y-auto bg-white dark:bg-black">
            <h2 className="text-lg font-semibold mb-4">
                {totalSubtopics} Lessons
            </h2>
            <Accordion
                type="multiple"
                defaultValue={course.topics.map((topic) => topic.id)}
                className="w-full"
            >
                {course.topics.map((topic, index) => (
                    <AccordionItem value={topic.id} key={topic.id}>
                        <AccordionTrigger className="font-semibold text-gray-800 hover:no-underline">{`Section ${
                            index + 1
                        }: ${topic.title}`}</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-1 pl-4">
                                {topic.subTopics.map((subTopic) => (
                                    <li
                                        key={subTopic.id}
                                        onClick={() =>
                                            setActiveSubTopic(subTopic)
                                        }
                                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                            activeSubtopic?.id === subTopic.id
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {renderSubTopicIcon(subTopic.type)}
                                        <span className="flex-grow text-sm">
                                            {subTopic.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </aside>
    );

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-950 flex-shrink-0 z-20">
                <h1 className="text-xl font-bold">{course.title}</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </header>

            {/* --- Mobile Layout --- */}
            <div className="md:hidden flex-grow relative overflow-hidden">
                <div className="h-full">{MainContent}</div>
                {isSidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-30"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-black z-40 shadow-lg animate-in slide-in-from-right">
                            {SidebarContent}
                        </div>
                    </>
                )}
            </div>

            {/* --- Desktop Layout --- */}
            <div className="hidden md:flex flex-grow">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={75} className="min-w-[300px]">
                        {MainContent}
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                        defaultSize={25}
                        minSize={20}
                        maxSize={30}
                        className="min-w-[280px]"
                    >
                        {SidebarContent}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default CourseDisplayClient;
