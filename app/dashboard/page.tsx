import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    // Fetch initial bookmarks server-side
    const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen relative">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06]">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold">
                            <span className="text-white">Smart</span>
                            <span className="text-purple-400">Mark</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user.user_metadata?.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata.full_name || "User"}
                                className="w-8 h-8 rounded-full border border-white/10"
                            />
                        )}
                        <span className="text-white/50 text-sm hidden sm:block">
                            {user.user_metadata?.full_name || user.email}
                        </span>
                        <AuthButton mode="signout" />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                <DashboardClient initialBookmarks={bookmarks || []} userId={user.id} />
            </main>
        </div>
    );
}
