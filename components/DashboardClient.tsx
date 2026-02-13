"use client";

import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";
import AddBookmark from "./AddBookmark";
import BookmarkList from "./BookmarkList";
import { Bookmark } from "@/types";

export default function DashboardClient({
    initialBookmarks,
    userId,
}: {
    initialBookmarks: Bookmark[];
    userId: string;
}) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
    const supabase = createClient();

    // Optimistic add
    const handleAdd = (newBookmark: Bookmark) => {
        setBookmarks((prev) => [newBookmark, ...prev]);
    };

    // Optimistic delete
    const handleDelete = (id: string) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
    };

    // Optimistic edit
    const handleEdit = (updatedBookmark: Bookmark) => {
        setBookmarks((prev) =>
            prev.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b))
        );
    };

    useEffect(() => {
        // Subscribe to realtime changes to keep multiple tabs in sync
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
                        if (prev.find((b) => b.id === newBookmark.id)) return prev;
                        return [newBookmark, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedBookmark = payload.new as Bookmark;
                    setBookmarks((prev) =>
                        prev.map((b) =>
                            b.id === updatedBookmark.id ? updatedBookmark : b
                        )
                    );
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

    return (
        <>
            {/* Add bookmark section */}
            <div className="mb-8">
                <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">
                    Add New Bookmark
                </h2>
                <AddBookmark userId={userId} onAdd={handleAdd} />
            </div>

            {/* Bookmarks list */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                        Your Bookmarks
                    </h2>
                    <span className="text-white/25 text-sm">
                        {bookmarks.length} saved
                    </span>
                </div>
                <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} onEdit={handleEdit} />
            </div>
        </>
    );
}
