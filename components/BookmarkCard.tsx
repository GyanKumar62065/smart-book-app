"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { Bookmark } from "@/types";

interface BookmarkCardProps {
    bookmark: Bookmark;
    onDelete?: (id: string) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
    const supabase = createClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("id", bookmark.id);

        if (error) {
            console.error("Error deleting bookmark:", error);
            setIsDeleting(false);
        }
        // No need to update state — realtime will handle it
    };

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace("www.", "");
        } catch {
            return url;
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div
            className={`group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 ${isDeleting ? "opacity-50 scale-95" : ""
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group/link"
                    >
                        <h3 className="text-white font-medium text-base truncate group-hover/link:text-purple-300 transition-colors duration-200">
                            {bookmark.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                            <p className="text-white/40 text-sm truncate">
                                {getDomain(bookmark.url)}
                            </p>
                        </div>
                    </a>
                    <p className="text-white/25 text-xs mt-3">
                        {getTimeAgo(bookmark.created_at)}
                    </p>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all duration-200 cursor-pointer"
                    title="Delete bookmark"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Subtle gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-cyan-500/5 pointer-events-none transition-all duration-500" />
        </div>
    );
}
