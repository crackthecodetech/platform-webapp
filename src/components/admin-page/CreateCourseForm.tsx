"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { FileUploader } from "./FileUploader";

const formSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters." }),
    description: z.string().optional(),
    imageUrl: z.array(z.instanceof(File)).min(1, "Please upload an image."),
    videos: z
        .array(z.instanceof(File))
        .min(1, "Please upload at least one video."),
});

export function CreateCourseForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: [],
            videos: [],
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form Values:", values);
        alert("Form submitted! Check console.");
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., 'Advanced Next.js'"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is the public title of your course.
                                </FormDescription>
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
                                        placeholder="Tell us a little bit about the course"
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
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Image</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple={false}
                                        accept={{ "image/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="videos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Videos</FormLabel>
                                <FormControl>
                                    <FileUploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        multiple={true}
                                        accept={{ "video/*": [] }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Create Course</Button>
                </form>
            </Form>
        </div>
    );
}

export default CreateCourseForm;
