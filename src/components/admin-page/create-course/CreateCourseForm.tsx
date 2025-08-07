"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    useForm,
    useFieldArray,
    Resolver,
    useFormContext,
} from "react-hook-form";
import { z } from "zod";
import React, { useState, useMemo, Suspense } from "react";
import { Loader2, PlusCircle, XCircle } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { createCourse } from "@/app/actions/course.actions";
import { getPresignedUrl } from "@/app/actions/cloudflare.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const FileUploader = dynamic(
    () => import("./FileUploader").then((r) => r.FileUploader),
    {
        ssr: false,
        loading: () => <p>Loading uploader…</p>,
    }
);

const subTopicSchema = z.object({
    title: z.string().min(3, "Video title must be at least 3 characters."),
    image: z.array(z.instanceof(File)).optional(),
    video: z.array(z.instanceof(File)).optional(),
});

const topicSchema = z.object({
    title: z.string().min(3, "Topic title must be at least 3 characters."),
    subTopics: z
        .array(subTopicSchema)
        .min(1, "Each topic must have at least one video."),
});

const formSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters." }),
    description: z.string().optional(),
    image: z.array(z.instanceof(File)).min(1, "Please upload a course image."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
    offline: z.boolean().default(false).optional(),
    topics: z.array(topicSchema).min(1, "Please add at least one topic."),
});

type CourseFormValues = z.infer<typeof formSchema>;

export function CreateCourseForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [totalSize, setTotalSize] = useState(0);
    const resolver = zodResolver(formSchema) as Resolver<
        CourseFormValues,
        unknown
    >;

    const form = useForm<CourseFormValues>({
        resolver,
        defaultValues: {
            title: "",
            description: "",
            image: [],
            price: 0,
            offline: false,
            topics: [],
        },
    });

    const {
        fields: topicFields,
        append: appendTopic,
        remove: removeTopic,
    } = useFieldArray({
        control: form.control,
        name: "topics",
    });

    const { totalLoaded, totalProgressPercentage } = useMemo(() => {
        const loaded = Object.values(progress).reduce(
            (acc, val) => acc + val,
            0
        );
        const percentage = totalSize > 0 ? (loaded / totalSize) * 100 : 0;
        return { totalLoaded: loaded, totalProgressPercentage: percentage };
    }, [progress, totalSize]);

    const uploadFile = async (file: File, folder: string) => {
        const uniqueFileName = `${folder}/${Date.now()}-${file.name.replace(
            /[^a-zA-Z0-9.-]/g,
            ""
        )}`;

        const { success, presignedUrl, error } = await getPresignedUrl(
            uniqueFileName,
            file.type
        );
        if (!success)
            throw new Error(
                `Failed to get presigned URL: ${error?.toString()}`
            );

        await axios.put(presignedUrl, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    setProgress((prev) => ({
                        ...prev,
                        [uniqueFileName]: progressEvent.loaded,
                    }));
                }
            },
        });

        return `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${uniqueFileName}`;
    };

    async function onSubmit(values: CourseFormValues) {
        setIsLoading(true);
        setProgress({});

        try {
            let totalBytes = values.image[0].size;
            values.topics.forEach((topic) => {
                topic.subTopics.forEach((subTopic) => {
                    totalBytes += subTopic.image?.[0]?.size || 0;
                    totalBytes += subTopic.video?.[0]?.size || 0;
                });
            });
            setTotalSize(totalBytes);

            const folderName = `courses/${values.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")}`;

            const imageUrl = await uploadFile(values.image[0], folderName);

            const topicsData = await Promise.all(
                values.topics.map(async (topic) => {
                    const subTopicsData = await Promise.all(
                        topic.subTopics.map(async (subTopic) => {
                            let videoImageUrl = null;
                            if (subTopic.image && subTopic.image[0]) {
                                videoImageUrl = await uploadFile(
                                    subTopic.image[0],
                                    `${folderName}/images`
                                );
                            }
                            const videoUrl =
                                subTopic.video && subTopic.video[0]
                                    ? await uploadFile(
                                          subTopic.video[0],
                                          `${folderName}/videos`
                                      )
                                    : null;
                            return {
                                title: subTopic.title,
                                imageUrl: videoImageUrl,
                                videoUrl: videoUrl,
                            };
                        })
                    );
                    return {
                        title: topic.title,
                        subTopics: subTopicsData,
                    };
                })
            );

            const courseData = {
                title: values.title,
                description: values.description,
                price: values.price,
                offline: values.offline,
                imageUrl: imageUrl,
                topics: topicsData,
            };

            await createCourse(courseData);

            alert("Course created successfully!");
            form.reset();
        } catch (error) {
            console.error("Error creating course:", error);
            alert("An error occurred. Please check the console.");
        } finally {
            setIsLoading(false);
            setProgress({});
            setTotalSize(0);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
            <Suspense>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (INR)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Image</FormLabel>
                                            <FormControl>
                                                <FileUploader
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    accept={{ "image/*": [] }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="offline"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    Available Offline
                                                </FormLabel>
                                                <FormDescription>
                                                    Allow users to download
                                                    course content for offline
                                                    access.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Topics</h2>
                            {topicFields.map((topic, topicIndex) => (
                                <Card key={topic.id} className="border-dashed">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>
                                            Topic {topicIndex + 1}
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                removeTopic(topicIndex)
                                            }
                                        >
                                            <XCircle className="h-5 w-5 text-destructive" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name={`topics.${topicIndex}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Topic Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Separator />
                                        <VideosFieldArray
                                            topicIndex={topicIndex}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    appendTopic({ title: "", subTopics: [] })
                                }
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Topic
                            </Button>
                            <FormMessage>
                                {form.formState.errors.topics?.message}
                            </FormMessage>
                        </div>

                        {isLoading && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-center">
                                    Uploading files...
                                </p>
                                <Progress value={totalProgressPercentage} />
                                <p className="text-xs text-muted-foreground text-center">
                                    {`${(totalLoaded / 1024 / 1024).toFixed(
                                        2
                                    )} MB / ${(totalSize / 1024 / 1024).toFixed(
                                        2
                                    )} MB`}
                                </p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isLoading ? "Creating..." : "Create Course"}
                        </Button>
                    </form>
                </Form>
            </Suspense>
        </div>
    );
}

const VideosFieldArray = ({ topicIndex }: { topicIndex: number }) => {
    const { control } = useFormContext<CourseFormValues>();
    const {
        fields: subTopicFields,
        append: appendSubTopic,
        remove: removeSubTopic,
    } = useFieldArray({
        control,
        name: `topics.${topicIndex}.subTopics`,
    });

    return (
        <div className="space-y-4">
            <h3 className="font-medium">SubTopics</h3>
            {subTopicFields.map((subTopic, subTopicIndex) => (
                <div
                    key={subTopic.id}
                    className="p-4 border rounded-md space-y-4 relative"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubTopic(subTopicIndex)}
                        className="absolute top-2 right-2"
                    >
                        <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sub Topic Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.image`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video Thumbnail</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        accept={{ "image/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.video`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Video File</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        accept={{ "video/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                    appendSubTopic({ title: "", image: [], video: [] })
                }
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Sub Topic
            </Button>
            <FormMessage>
                {
                    control.getFieldState(`topics.${topicIndex}.subTopics`)
                        ?.error?.root?.message
                }
            </FormMessage>
        </div>
    );
};

export default CreateCourseForm;
