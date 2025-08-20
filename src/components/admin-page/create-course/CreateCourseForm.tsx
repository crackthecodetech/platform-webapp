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
import { createCourse } from "@/actions/course.actions";
import { getPresignedUrl } from "@/actions/cloudflare.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionSource, SubTopicType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getLeetCodeProblem } from "@/actions/leetcode.actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const FileUploader = dynamic(
    () => import("./FileUploader").then((r) => r.FileUploader),
    {
        ssr: false,
        loading: () => <p>Loading uploader…</p>,
    }
);

const testCaseSchema = z.object({
    stdin: z.string().min(1, "Input is required."),
    expected_output: z.string().min(1, "Output is required."),
});

const subTopicSchema = z
    .object({
        type: z.nativeEnum(SubTopicType),
        title: z.string().optional(),
        image: z.array(z.instanceof(File)).optional(),
        video: z.array(z.instanceof(File)).optional(),
        questionSource: z
            .nativeEnum(QuestionSource)
            .default(QuestionSource.LEETCODE),
        questionNumber: z.coerce.number().optional(),
        manualQuestion: z.string().optional(),
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
        if (data.type === SubTopicType.CODING_QUESTION) {
            if (data.questionSource === "LEETCODE" && !data.questionNumber) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Question number is required for LeetCode questions.",
                    path: ["questionNumber"],
                });
            } else if (
                data.questionSource === "MANUAL" &&
                !data.manualQuestion
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Question markdown is required for manual questions.",
                    path: ["manualQuestion"],
                });
            }
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
            let totalBytes = values.image[0].size;
            values.topics.forEach((topic) => {
                topic.subTopics.forEach((subTopic) => {
                    totalBytes += subTopic.image?.[0]?.size || 0;
                    if (subTopic.type === SubTopicType.VIDEO) {
                        totalBytes += subTopic.video?.[0]?.size || 0;
                    }
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

                            let videoUrl = null;
                            if (
                                subTopic.type === SubTopicType.VIDEO &&
                                subTopic.video &&
                                subTopic.video[0]
                            ) {
                                videoUrl = await uploadFile(
                                    subTopic.video[0],
                                    `${folderName}/videos`
                                );
                            }

                            let question_object: {
                                test_cases: string;
                                html: string;
                                title: string;
                            } | null = null;
                            if (
                                subTopic.type ===
                                    SubTopicType.CODING_QUESTION &&
                                subTopic.questionSource === "LEETCODE"
                            ) {
                                question_object = await getLeetCodeProblem(
                                    subTopic.questionNumber
                                );
                            }

                            return {
                                title:
                                    subTopic.type ===
                                        SubTopicType.CODING_QUESTION &&
                                    subTopic.questionSource === "LEETCODE" &&
                                    question_object
                                        ? question_object.title
                                        : subTopic.title,
                                imageUrl: videoImageUrl,
                                videoUrl: videoUrl,
                                type: subTopic.type,
                                questionSource: subTopic.questionSource,
                                questionNumber:
                                    subTopic.questionSource === "LEETCODE"
                                        ? subTopic.questionNumber
                                        : null,
                                questionHTML:
                                    subTopic.questionSource === "LEETCODE" &&
                                    question_object
                                        ? question_object.html
                                        : null,
                                questionMarkdown:
                                    subTopic.questionSource === "MANUAL"
                                        ? subTopic.manualQuestion
                                        : null,
                                testCases:
                                    subTopic.questionSource === "LEETCODE" &&
                                    question_object
                                        ? JSON.parse(question_object.test_cases)
                                        : subTopic.testCases,
                                projectMarkdown: subTopic.projectMarkdown,
                                offlineContentMarkdown:
                                    subTopic.offlineContentMarkdown,
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

            toast("Course created successfully!");
            form.reset();
        } catch (error) {
            console.error("Error creating course:", error);
            toast("An error occurred. Please check the console.");
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
                        onSubmit={form.handleSubmit(
                            (values) => {
                                console.log("Validation passed ✅", values);
                                onSubmit(values);
                            },
                            (errors) => {
                                console.log("Validation failed ❌", errors);
                                console.log(JSON.stringify(errors, null, 2));
                            }
                        )}
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
                                                    Mark as an offline course
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
                                                {" "}
                                                <XCircle className="h-5 w-5 text-destructive" />{" "}
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
                                    appendTopic({ title: "", subTopics: [] })
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
                                <p className="text-xs text-muted-foreground text-center">{`${(
                                    totalLoaded /
                                    1024 /
                                    1024
                                ).toFixed(2)} MB / ${(
                                    totalSize /
                                    1024 /
                                    1024
                                ).toFixed(2)} MB`}</p>
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

const SubTopicItem = ({ topicIndex, subTopicIndex, removeSubTopic }: any) => {
    const { control, watch } = useFormContext<CourseFormValues>();
    const subTopicTypes = watch(`topics.${topicIndex}.subTopics`);
    const subTopicType = subTopicTypes?.[subTopicIndex]?.type;
    const questionSource = subTopicTypes?.[subTopicIndex]?.questionSource;

    const { fields, append, remove } = useFieldArray({
        control,
        name: `topics.${topicIndex}.subTopics.${subTopicIndex}.testCases`,
    });

    return (
        <div className="p-4 border rounded-md space-y-4 relative">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSubTopic(subTopicIndex)}
                className="absolute top-2 right-2"
            >
                <XCircle className="h-4 w-4 text-destructive" />{" "}
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
                                            value={SubTopicType.VIDEO}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Video
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem
                                            value={SubTopicType.CODING_QUESTION}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Coding Question
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem
                                            value={SubTopicType.PROJECT}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Project
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem
                                            value={SubTopicType.OFFLINE_CONTENT}
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
            {!(
                subTopicType === SubTopicType.CODING_QUESTION &&
                questionSource === "LEETCODE"
            ) && (
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
            )}
            <div
                className={cn("space-y-4", {
                    hidden: subTopicType !== SubTopicType.VIDEO,
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
                                    accept={{
                                        "image/*": [],
                                    }}
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
                                    accept={{
                                        "video/*": [],
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div
                className={cn("space-y-4", {
                    hidden: subTopicType !== SubTopicType.CODING_QUESTION,
                })}
            >
                <FormField
                    control={control}
                    name={`topics.${topicIndex}.subTopics.${subTopicIndex}.questionSource`}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Question Source</FormLabel>
                                <FormDescription>
                                    Switch between LeetCode and Manual question
                                    input.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Label>LeetCode</Label>
                                    <Switch
                                        checked={field.value === "MANUAL"}
                                        onCheckedChange={(checked) =>
                                            field.onChange(
                                                checked ? "MANUAL" : "LEETCODE"
                                            )
                                        }
                                    />
                                    <Label>Manual</Label>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
                {questionSource === "LEETCODE" ? (
                    <FormField
                        control={control}
                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.questionNumber`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Number</FormLabel>
                                <FormControl>
                                    <Input className="resize-y" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <div className="space-y-4">
                        <FormField
                            control={control}
                            name={`topics.${topicIndex}.subTopics.${subTopicIndex}.manualQuestion`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question (Markdown)</FormLabel>
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
                        <div>
                            <h4 className="font-medium mb-2">Test Cases</h4>
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-4 border rounded-md space-y-4 relative mb-4"
                                >
                                    <FormField
                                        control={control}
                                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.testCases.${index}.stdin`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Standard Input
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
                                    <FormField
                                        control={control}
                                        name={`topics.${topicIndex}.subTopics.${subTopicIndex}.testCases.${index}.expected_output`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Expected Output
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
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        Remove Test Case
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    append({
                                        stdin: "",
                                        expected_output: "",
                                    })
                                }
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Test
                                Case
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div
                className={cn("space-y-4", {
                    hidden: subTopicType !== SubTopicType.PROJECT,
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
                                <Textarea className="resize-y" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div
                className={cn("space-y-4", {
                    hidden: subTopicType !== SubTopicType.OFFLINE_CONTENT,
                })}
            >
                <FormField
                    control={control}
                    name={`topics.${topicIndex}.subTopics.${subTopicIndex}.offlineContentMarkdown`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content (Markdown)</FormLabel>
                            <FormControl>
                                <Textarea className="resize-y" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

const SubTopicsFieldArray = ({ topicIndex }: { topicIndex: number }) => {
    const { control } = useFormContext<CourseFormValues>();
    const {
        fields: subTopicFields,
        append: appendSubTopic,
        remove: removeSubTopic,
        insert: insertSubTopic,
    } = useFieldArray({
        control,
        name: `topics.${topicIndex}.subTopics`,
    });

    return (
        <div className="space-y-4">
            <h3 className="font-medium">Subtopics</h3>
            {subTopicFields.map((subTopic, subTopicIndex) => (
                <React.Fragment key={subTopic.id}>
                    <SubTopicItem
                        topicIndex={topicIndex}
                        subTopicIndex={subTopicIndex}
                        removeSubTopic={removeSubTopic}
                    />
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
                                    questionSource: QuestionSource.LEETCODE,
                                    questionNumber: 0,
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
                        questionSource: QuestionSource.LEETCODE,
                        questionNumber: 0,
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

export default CreateCourseForm;
