import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip middleware if env vars are not configured
    if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        !supabaseUrl.startsWith("http")
    ) {
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh the session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect the /dashboard route
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    // If user is logged in and visits /, redirect to dashboard
    if (user && request.nextUrl.pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
