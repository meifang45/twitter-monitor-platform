import { auth } from "./auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define routes that require authentication
const protectedRoutes = ["/"]
// Define routes that should redirect to home if user is authenticated
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.includes(pathname)

  // If user is not authenticated and trying to access a protected route
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth routes, redirect to home
  if (session && isAuthRoute) {
    const homeUrl = new URL("/", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}