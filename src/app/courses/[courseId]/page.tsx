"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Course, Video } from "@/generated/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Lock, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

type CourseWithVideos = Course & { videos: Video[] };

const CourseDisplayPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseWithVideos | null>(null);
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await axios.get(`/api/course/${courseId}`);
                setCourse(data);
                if (data.videos.length > 0) {
                    setActiveVideo(data.videos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch course:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)]">
                <div className="flex-1 p-8">
                    <Skeleton className="w-1/2 h-10 mb-6" />
                    <Skeleton className="w-full aspect-video" />
                </div>
                <div className="w-80 border-l p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-12">Course not found.</div>;
    }

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
                    <main className="p-4 md:p-8 flex flex-col">
                        {/* Video Player */}
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-black mb-6">
                            {activeVideo ? (
                                <video
                                    src={activeVideo.videoUrl}
                                    key={activeVideo.id} // Re-renders the video element on change
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="flex items-center justify-center h-full text-white">
                                    Select a video to begin.
                                </div>
                            )}
                        </div>
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
                            {/* Playlist Sidebar */}
                            <aside className="h-full p-4 border-l">
                                <h2 className="text-lg font-semibold mb-4">
                                    {course.videos.length} Lessons
                                </h2>
                                <ul className="space-y-2">
                                    {course.videos.map((video) => (
                                        <li
                                            key={video.id}
                                            onClick={() =>
                                                setActiveVideo(video)
                                            }
                                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                                                activeVideo?.id === video.id
                                                    ? "bg-primary/10 text-primary-foreground"
                                                    : "hover:bg-gray-100"
                                            }`}
                                        >
                                            <PlayCircle className="mr-3 h-5 w-5 text-gray-500" />
                                            <span className="flex-grow text-sm font-medium">
                                                {video.title}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </div>
    );
};

export default CourseDisplayPage;
