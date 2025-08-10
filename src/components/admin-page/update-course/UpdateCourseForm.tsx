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
import { getPresignedUrl } from "@/actions/cloudflare.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Course, SubTopic, SubTopicType, Topic } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { updateCourse } from "@/actions/course.actions";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const FileUploader = dynamic(
    () => import("./FileUploader").then((r) => r.FileUploader),
    {
        ssr: false,
        loading: () => <p>Loading uploader…</p>,
    }
);

const testCaseSchema = z.object({
    input: z.string().min(1, "Input is required."),
    output: z.string().min(1, "Output is required."),
});

const subTopicSchema = z
    .object({
        id: z.string().optional(),
        type: z.nativeEnum(SubTopicType),
        title: z
            .string()
            .min(3, "Subtopic title must be at least 3 characters."),
        image: z.any().optional(),
        video: z.any().optional(),
        question: z.string().optional(),
        testCases: z.array(testCaseSchema).optional(),
        projectMarkdown: z.string().optional(),
        offlineContentMarkdown: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.type === SubTopicType.VIDEO &&
            (!data.video || data.video.length === 0)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Video file is required for video subtopics.",
                path: ["video"],
            });
        }
        if (data.type === SubTopicType.CODING_QUESTION && !data.question) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Question markdown is required for coding questions.",
                path: ["question"],
            });
        }
        if (data.type === SubTopicType.PROJECT && !data.projectMarkdown) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Project description is required for project subtopics.",
                path: ["projectMarkdown"],
            });
        }
        if (
            data.type === SubTopicType.OFFLINE_CONTENT &&
            !data.offlineContentMarkdown
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Content description is required for offline subtopics.",
                path: ["offlineContentMarkdown"],
            });
        }
    });

const topicSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Topic title must be at least 3 characters."),
    subTopics: z
        .array(subTopicSchema)
        .min(1, "Each topic must have at least one subtopic."),
});

const formSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters." }),
    description: z.string().optional(),
    image: z
        .any()
        .refine((files) => files?.length >= 1, "Please upload a course image."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
    offline: z.boolean().default(false).optional(),
    topics: z.array(topicSchema).min(1, "Please add at least one topic."),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface UpdateCourseFormProps {
    course: CourseWithTopicsAndSubTopics;
}

export function UpdateCourseForm({ course }: UpdateCourseFormProps) {
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
            title: course.title,
            description: course.description || "",
            image: course.imageUrl ? [{ name: course.imageUrl }] : [],
            price: course.price || 0,
            offline: course.offline,
            topics: course.topics.map((topic) => ({
                id: topic.id,
                title: topic.title,
                subTopics: topic.subTopics.map((subTopic) => ({
                    id: subTopic.id,
                    type: subTopic.type,
                    title: subTopic.title,
                    image: subTopic.imageUrl
                        ? [{ name: subTopic.imageUrl }]
                        : [],
                    video: subTopic.videoUrl
                        ? [{ name: subTopic.videoUrl }]
                        : [],
                    question: subTopic.question || "",
                    testCases: subTopic.testCases
                        ? (subTopic.testCases as any[])
                        : [],
                    projectMarkdown: subTopic.projectMarkdown || "",
                    offlineContentMarkdown:
                        subTopic.offlineContentMarkdown || "",
                })),
            })),
        },
    });

    const {
        fields: topicFields,
        append: appendTopic,
        remove: removeTopic,
        insert: insertTopic,
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
            const allFilesToUpload = [
                values.image[0],
                ...values.topics.flatMap((t) =>
                    t.subTopics.flatMap((st) => [st.image?.[0], st.video?.[0]])
                ),
            ].filter((file) => file instanceof File);
            const totalBytes = allFilesToUpload.reduce(
                (acc, file) => acc + (file?.size || 0),
                0
            );
            setTotalSize(totalBytes);

            const folderName = `courses/${values.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")}`;

            const imageUrl =
                values.image[0] instanceof File
                    ? await uploadFile(values.image[0], folderName)
                    : course.imageUrl;

            const topicsData = await Promise.all(
                values.topics.map(async (topic, topicIndex) => {
                    const subTopicsData = await Promise.all(
                        topic.subTopics.map(async (subTopic, subTopicIndex) => {
                            const originalSubTopic =
                                course.topics[topicIndex]?.subTopics[
                                    subTopicIndex
                                ];

                            const videoImageUrl =
                                subTopic.image?.[0] instanceof File
                                    ? await uploadFile(
                                          subTopic.image[0],
                                          `${folderName}/images`
                                      )
                                    : originalSubTopic?.imageUrl;

                            const videoUrl =
                                subTopic.video?.[0] instanceof File
                                    ? await uploadFile(
                                          subTopic.video[0],
                                          `${folderName}/videos`
                                      )
                                    : originalSubTopic?.videoUrl;

                            return {
                                title: subTopic.title,
                                imageUrl: videoImageUrl,
                                videoUrl: videoUrl,
                                type: subTopic.type,
                                question: subTopic.question,
                                testCases: subTopic.testCases,
                                projectMarkdown: subTopic.projectMarkdown,
                                offlineContentMarkdown:
                                    subTopic.offlineContentMarkdown,
                            };
                        })
                    );
                    return { title: topic.title, subTopics: subTopicsData };
                })
            );

            const courseData = {
                title: values.title,
                description: values.description,
                price: values.price,
                offline: values.offline,
                imageUrl,
                topics: topicsData,
            };

            const result = await updateCourse(course.id, courseData);

            if (result.success) {
                alert("Course updated successfully!");
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error updating course:", error);
            alert("An error occurred. Please check the console.");
        } finally {
            setIsLoading(false);
            setProgress({});
            setTotalSize(0);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Update Course</h1>
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
                                <React.Fragment key={topic.id}>
                                    <Card className="border-dashed">
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
                                            <SubTopicsFieldArray
                                                topicIndex={topicIndex}
                                            />
                                        </CardContent>
                                    </Card>
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                insertTopic(topicIndex + 1, {
                                                    title: "",
                                                    subTopics: [],
                                                })
                                            }
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />{" "}
                                            Insert Topic Below
                                        </Button>
                                    </div>
                                </React.Fragment>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    appendTopic({
                                        title: "",
                                        subTopics: [],
                                    })
                                }
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                                Topic to End
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
                            {isLoading ? "Updating..." : "Update Course"}
                        </Button>
                    </form>
                </Form>
            </Suspense>
        </div>
    );
}

const SubTopicsFieldArray = ({ topicIndex }: { topicIndex: number }) => {
    const { control, watch } = useFormContext<CourseFormValues>();
    const {
        fields: subTopicFields,
        append: appendSubTopic,
        remove: removeSubTopic,
        insert: insertSubTopic,
    } = useFieldArray({
        control,
        name: `topics.${topicIndex}.subTopics`,
    });

    const subTopicTypes = watch(`topics.${topicIndex}.subTopics`);

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Subtopics</h3>
            {subTopicFields.map((subTopic, subTopicIndex) => (
                <React.Fragment key={subTopic.id}>
                    <div className="p-4 border rounded-md space-y-4 relative">
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
                            name={`topics.${topicIndex}.subTopics.${subTopicIndex}.type`}
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Subtopic Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={
                                                            SubTopicType.VIDEO
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Video
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={
                                                            SubTopicType.CODING_QUESTION
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Coding Question
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={
                                                            SubTopicType.PROJECT
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Project
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={
                                                            SubTopicType.OFFLINE_CONTENT
                                                        }
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Offline Content
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`topics.${topicIndex}.subTopics.${subTopicIndex}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtopic Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div
                            className={cn("space-y-4", {
                                hidden:
                                    subTopicTypes?.[subTopicIndex]?.type !==
                                    SubTopicType.VIDEO,
                            })}
                        >
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
                        <div
                            className={cn("space-y-4", {
                                hidden:
                                    subTopicTypes?.[subTopicIndex]?.type !==
                                    SubTopicType.CODING_QUESTION,
                            })}
                        >
                            <FormField
                                control={control}
                                name={`topics.${topicIndex}.subTopics.${subTopicIndex}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Question (Markdown)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <TestCasesFieldArray
                                topicIndex={topicIndex}
                                subTopicIndex={subTopicIndex}
                            />
                        </div>
                        <div
                            className={cn("space-y-4", {
                                hidden:
                                    subTopicTypes?.[subTopicIndex]?.type !==
                                    SubTopicType.PROJECT,
                            })}
                        >
                            <FormField
                                control={control}
                                name={`topics.${topicIndex}.subTopics.${subTopicIndex}.projectMarkdown`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project Description (Markdown)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div
                            className={cn("space-y-4", {
                                hidden:
                                    subTopicTypes?.[subTopicIndex]?.type !==
                                    SubTopicType.OFFLINE_CONTENT,
                            })}
                        >
                            <FormField
                                control={control}
                                name={`topics.${topicIndex}.subTopics.${subTopicIndex}.offlineContentMarkdown`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Content (Markdown)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                insertSubTopic(subTopicIndex + 1, {
                                    title: "",
                                    type: SubTopicType.VIDEO,
                                    image: [],
                                    video: [],
                                    question: "",
                                    testCases: [],
                                    projectMarkdown: "",
                                    offlineContentMarkdown: "",
                                })
                            }
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Insert
                            Subtopic Below
                        </Button>
                    </div>
                </React.Fragment>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                    appendSubTopic({
                        title: "",
                        type: SubTopicType.VIDEO,
                        image: [],
                        video: [],
                        question: "",
                        testCases: [],
                        projectMarkdown: "",
                        offlineContentMarkdown: "",
                    })
                }
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Subtopic to End
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

const TestCasesFieldArray = ({
    topicIndex,
    subTopicIndex,
}: {
    topicIndex: number;
    subTopicIndex: number;
}) => {
    const { control } = useFormContext<CourseFormValues>();
    const {
        fields: testCaseFields,
        append: appendTestCase,
        remove: removeTestCase,
    } = useFieldArray({
        control,
        name: `topics.${topicIndex}.subTopics.${subTopicIndex}.testCases`,
    });

    return (
        <div className="space-y-2">
            <h4 className="font-medium">Test Cases</h4>
            {testCaseFields.map((testCase, testCaseIndex) => (
                <div
                    key={testCase.id}
                    className="flex items-start gap-2 p-2 border rounded"
                >
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.testCases.${testCaseIndex}.input`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Input</FormLabel>
                                <FormControl>
                                    <Textarea className="resize-y" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.testCases.${testCaseIndex}.output`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Output</FormLabel>
                                <FormControl>
                                    <Textarea className="resize-y" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTestCase(testCaseIndex)}
                        className="mt-8"
                    >
                        <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTestCase({ input: "", output: "" })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Test Case
            </Button>
        </div>
    );
};

export default UpdateCourseForm;
