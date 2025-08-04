import {
    clerkClient,
    clerkMiddleware,
    createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
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

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
