"use client";

import { EnrollmentWithUser } from "@/types/enrollment.types";
import React, { useState, useMemo, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type Timeframe = "day" | "week" | "month";

const processChartData = (
    enrollments: EnrollmentWithUser[],
    timeframe: Timeframe,
    offset: number
) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    const labels: string[] = [];
    const enrollmentsByPeriod: Record<string, number> = {};

    if (timeframe === "day") {
        startDate = new Date(now.setDate(now.getDate() - offset));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        for (let i = 0; i < 12; i++) {
            const hour = i * 2;
            const label = new Date(startDate).setHours(hour, 0, 0, 0);
            const formattedLabel = new Date(label).toLocaleTimeString("en-US", {
                hour: "numeric",
                hour12: true,
            });
            labels.push(formattedLabel);
            enrollmentsByPeriod[formattedLabel] = 0;
        }

        enrollments.forEach((e) => {
            const enrollmentDate = new Date(e.created_at);
            if (enrollmentDate >= startDate && enrollmentDate <= endDate) {
                const hour = new Date(enrollmentDate).getHours();
                const closestHourLabel = new Date(startDate).setHours(
                    Math.floor(hour / 2) * 2,
                    0,
                    0,
                    0
                );
                const formattedLabel = new Date(
                    closestHourLabel
                ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                });
                enrollmentsByPeriod[formattedLabel]++;
            }
        });
    } else if (timeframe === "week") {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = new Date(
            startOfWeek.setDate(startOfWeek.getDate() - offset * 7)
        );
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            const label = day.toLocaleDateString("en-US", { weekday: "short" });
            labels.push(label);
            enrollmentsByPeriod[label] = 0;
        }
        enrollments.forEach((e) => {
            const enrollmentDate = new Date(e.created_at);
            if (enrollmentDate >= startDate && enrollmentDate <= endDate) {
                const label = enrollmentDate.toLocaleDateString("en-US", {
                    weekday: "short",
                });
                enrollmentsByPeriod[label]++;
            }
        });
    } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        for (let i = 1; i <= endDate.getDate(); i++) {
            const label = `${startDate.toLocaleString("default", {
                month: "short",
            })} ${i}`;
            labels.push(label);
            enrollmentsByPeriod[label] = 0;
        }
        enrollments.forEach((e) => {
            const enrollmentDate = new Date(e.created_at);
            if (enrollmentDate >= startDate && enrollmentDate <= endDate) {
                const label = `${enrollmentDate.toLocaleString("default", {
                    month: "short",
                })} ${enrollmentDate.getDate()}`;
                enrollmentsByPeriod[label]++;
            }
        });
    }

    const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    return {
        labels,
        data: labels.map((label) => enrollmentsByPeriod[label]),
        dateRange,
    };
};

const CourseEnrollmentsLineGraph = ({
    enrollments,
}: {
    enrollments: EnrollmentWithUser[];
}) => {
    const [timeframe, setTimeframe] = useState<Timeframe>("week");
    const [offset, setOffset] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        labels,
        data: enrollmentData,
        dateRange,
    } = useMemo(() => {
        return processChartData(enrollments, timeframe, offset);
    }, [enrollments, timeframe, offset]);

    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe as Timeframe);
        setOffset(0);
    };

    const data: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: "Enrollments",
                data: enrollmentData,
                borderColor: "rgb(37, 99, 235)",
                backgroundColor: "rgba(37, 99, 235, 0.5)",
                tension: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                },
            },
        },
    };

    if (!isMounted) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                <Tabs
                    value={timeframe}
                    onValueChange={handleTimeframeChange}
                    className="w-full sm:w-auto"
                >
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOffset(offset + 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground w-48 text-center">
                        {dateRange}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOffset(offset - 1)}
                        disabled={offset === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="relative h-[400px]">
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default CourseEnrollmentsLineGraph;
