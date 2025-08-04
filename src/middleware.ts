import {
    clerkClient,
    clerkMiddleware,
    createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCourseRoute = createRouteMatcher(["/courses/(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        auth.protect();
    }

    if (isAdminRoute(req)) {
        const { userId } = await auth();
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const client = await clerkClient();

        const user = await client.users.getUser(userId);

        if (user?.emailAddresses[0]?.emailAddress !== process.env.ADMIN) {
            const dashboardUrl = new URL("/dashboard", req.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    if (isCourseRoute(req)) {
        auth.protect();

        const courseId = req.nextUrl.pathname.split("/").pop();
        if (!courseId) {
            return NextResponse.redirect(new URL("/courses", req.url));
        }

        try {
            const checkEnrollmentUrl = new URL(
                "/api/enrollments/check",
                req.url
            );

            const response = await fetch(checkEnrollmentUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: req.headers.get("cookie") || "",
                },
                body: JSON.stringify({ courseId }),
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const { isEnrolled } = await response.json();

            if (!isEnrolled) {
                return NextResponse.redirect(new URL("/courses", req.url));
            }
        } catch (error) {
            console.error("Middleware enrollment check failed:", error);
            return NextResponse.redirect(new URL("/courses", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
