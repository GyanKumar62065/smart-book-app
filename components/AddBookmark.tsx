"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

import { Bookmark } from "@/types";

interface AddBookmarkProps {
    userId: string;
    onAdd?: (bookmark: Bookmark) => void;
}

export default function AddBookmark({ userId, onAdd }: AddBookmarkProps) {
    const supabase = createClient();
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !url.trim()) {
            setError("Please fill in both fields");
            return;
        }

        // Basic URL validation — prepend https:// if missing
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = "https://" + finalUrl;
        }

        setIsAdding(true);

        const { error: insertError, data } = await supabase
            .from("bookmarks")
            .insert({
                user_id: userId,
                title: title.trim(),
                url: finalUrl,
            })
            .select()
            .single();

        if (insertError) {
            setError(insertError.message);
            setIsAdding(false);
            return;
        }

        if (onAdd && data) {
            onAdd(data);
        }

        setTitle("");
        setUrl("");
        setIsAdding(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Bookmark title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all duration-200 text-sm"
                />
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all duration-200 text-sm"
                />
                <button
                    type="submit"
                    disabled={isAdding}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                    {isAdding ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Adding...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Bookmark
                        </span>
                    )}
                </button>
            </div>
            {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                    {error}
                </p>
            )}
        </form>
    );
}
