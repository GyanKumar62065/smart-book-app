import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";
            let baseUrl = origin;

            if (!isLocalEnv && forwardedHost) {
                baseUrl = `https://${forwardedHost}`;
            }

            // Always default to /dashboard if next is missing or root
            const targetPath = (next && next !== "/") ? next : "/dashboard";
            const redirectUrl = new URL(targetPath, baseUrl);

            // Explicitly remove code and any other auth params
            redirectUrl.searchParams.delete("code");

            return NextResponse.redirect(redirectUrl);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
