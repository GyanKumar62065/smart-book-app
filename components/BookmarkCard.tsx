"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { Bookmark } from "@/types";

interface BookmarkCardProps {
    bookmark: Bookmark;
    onDelete?: (id: string) => void;
    onEdit?: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({ bookmark, onDelete, onEdit }: BookmarkCardProps) {
    const supabase = createClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editTitle, setEditTitle] = useState(bookmark.title);
    const [editUrl, setEditUrl] = useState(bookmark.url);
    const [editError, setEditError] = useState("");

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

    const handleEdit = async () => {
        setEditError("");

        if (!editTitle.trim() || !editUrl.trim()) {
            setEditError("Please fill in both fields");
            return;
        }

        let finalUrl = editUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = "https://" + finalUrl;
        }

        setIsSaving(true);

        const { error, data } = await supabase
            .from("bookmarks")
            .update({ title: editTitle.trim(), url: finalUrl })
            .eq("id", bookmark.id)
            .select();

        if (error) {
            setEditError(error.message);
            setIsSaving(false);
            return;
        }

        if (!data || data.length === 0) {
            setEditError("Update failed. You may not have permission to edit this bookmark.");
            setIsSaving(false);
            return;
        }

        if (onEdit) {
            onEdit(data[0]);
        }

        setIsEditing(false);
        setIsSaving(false);
    };

    const handleCancelEdit = () => {
        setEditTitle(bookmark.title);
        setEditUrl(bookmark.url);
        setEditError("");
        setIsEditing(false);
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

    if (isEditing) {
        return (
            <div className="relative bg-white/[0.06] border border-purple-500/30 rounded-2xl p-5 transition-all duration-300 shadow-lg shadow-purple-500/5">
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Bookmark title"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all duration-200 text-sm"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all duration-200 text-sm"
                    />
                    {editError && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5">
                            {editError}
                        </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleEdit}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-1.5">
                                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save"
                            )}
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white/60 hover:text-white/80 text-xs transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-purple-500/20 text-white/30 hover:text-purple-400 transition-all duration-200 cursor-pointer"
                        title="Edit bookmark"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
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
            </div>

            {/* Subtle gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-cyan-500/5 pointer-events-none transition-all duration-500" />
        </div>
    );
}
