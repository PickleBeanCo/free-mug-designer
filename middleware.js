import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only force authentication on the main pages, leaving internal file loading open
const isProtectedRoute = createRouteMatcher(['/']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
