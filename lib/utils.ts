/**
 * Extract the domain from a URL string.
 * Returns the hostname without "www." prefix.
 */
export function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

/**
 * Format a date string into a human-readable relative time.
 */
export function getTimeAgo(dateStr: string): string {
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
}

/**
 * Normalize a URL by prepending https:// if no protocol is present.
 */
export function normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        return "https://" + trimmed;
    }
    return trimmed;
}
