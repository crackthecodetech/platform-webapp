"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
});

export default function ContactPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form submitted with values:", values);
        form.reset();
    }

    return (
        <main className="bg-gradient-to-b from-sky-50 via-white to-white">
            <section
                id="contact"
                className="container mx-auto px-6 py-24 sm:py-32"
            >
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl text-balance">
                        Get In Touch
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        Have questions about our courses, or just want to say
                        hello? We'd love to hear from you. Reach out and we'll
                        get back to you as soon as possible.
                    </p>
                </div>
                <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div className="space-y-8 my-auto">
                        <ContactInfoItem
                            icon={<Mail className="h-6 w-6 text-sky-600" />}
                            title="Email"
                            content="crackthecode.tech@gmail.com"
                            href="mailto:crackthecode.tech@gmail.com"
                        />
                        <ContactInfoItem
                            icon={<Phone className="h-6 w-6 text-sky-600" />}
                            title="Phone"
                            content="+91 91825 18264"
                            href="tel:+919182518264"
                        />
                        <ContactInfoItem
                            icon={<MapPin className="h-6 w-6 text-sky-600" />}
                            title="Address"
                            content="Hyderabad, Telangana, 501510, India"
                        />
                    </div>
                    <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-lg rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-slate-800">
                                Send us a Message
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Your Message
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us how we can help..."
                                                        className="resize-none"
                                                        rows={5}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full transition-transform duration-300 hover:scale-105"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting
                                            ? "Sending..."
                                            : "Send Message"}
                                        <Send className="ml-2 h-5 w-5" />
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

const ContactInfoItem = ({ icon, title, content, href = null }) => (
    <div className="flex items-start gap-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {href ? (
                <Link
                    href={href}
                    className="text-slate-600 hover:text-sky-700 hover:underline transition-colors"
                >
                    {content}
                </Link>
            ) : (
                <p className="text-slate-600">{content}</p>
            )}
        </div>
    </div>
);
