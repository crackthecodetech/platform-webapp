import {
    clerkClient,
    clerkMiddleware,
    createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// --- Define route matchers ---
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCourseRoute = createRouteMatcher(["/courses/(.*)"]); // Matches individual course pages
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // Protect general routes first
    if (isProtectedRoute(req)) {
        auth.protect();
    }

    // --- Admin Route Protection ---
    if (isAdminRoute(req)) {
        const { userId } = auth();
        // If there's no user, auth.protect() above would have handled it
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const user = await clerkClient.users.getUser(userId);

        if (
            user?.emailAddresses[0]?.emailAddress !==
            "mullagurithanuj0@gmail.com"
        ) {
            const dashboardUrl = new URL("/dashboard", req.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    // --- Specific Course Page Protection ---
    if (isCourseRoute(req)) {
        auth.protect(); // Ensure the user is logged in to view any course

        const courseId = req.nextUrl.pathname.split("/").pop();
        if (!courseId) {
            return NextResponse.redirect(new URL("/courses", req.url));
        }

        try {
            // Construct the absolute URL for the API endpoint
            const checkEnrollmentUrl = new URL(
                "/api/enrollments/check",
                req.url
            );

            // Use fetch to call the internal API route
            const response = await fetch(checkEnrollmentUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Forward the user's cookie to the API route for authentication
                    Cookie: req.headers.get("cookie") || "",
                },
                body: JSON.stringify({ courseId }),
            });

            if (!response.ok) {
                // If the API call fails, redirect as a security measure
                throw new Error(`API responded with status ${response.status}`);
            }

            const { isEnrolled } = await response.json();

            // If the API confirms the user is not enrolled, redirect them
            if (!isEnrolled) {
                return NextResponse.redirect(new URL("/courses", req.url));
            }
        } catch (error) {
            console.error("Middleware enrollment check failed:", error);
            // Redirect on any error to be safe
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
