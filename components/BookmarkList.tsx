"use client";

import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";
import BookmarkCard from "./BookmarkCard";

interface Bookmark {
    id: string;
    user_id: string;
    title: string;
    url: string;
    created_at: string;
}

export default function BookmarkList({
    initialBookmarks,
    userId,
}: {
    initialBookmarks: Bookmark[];
    userId: string;
}) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to realtime changes for this user's bookmarks
        const channel = supabase
            .channel("bookmarks-realtime")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newBookmark = payload.new as Bookmark;
                    setBookmarks((prev) => {
                        // Avoid duplicates
                        if (prev.find((b) => b.id === newBookmark.id)) return prev;
                        return [newBookmark, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "bookmarks",
                },
                (payload) => {
                    const deletedId = payload.old.id;
                    setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, userId]);

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-6">
                    <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
                <h3 className="text-white/50 text-lg font-medium mb-2">No bookmarks yet</h3>
                <p className="text-white/30 text-sm">Add your first bookmark above to get started</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {bookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
        </div>
    );
}
