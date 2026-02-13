import type {
    BookmarkFormState,
    BookmarkFormAction,
    BookmarkDeleteState,
    BookmarkDeleteAction,
    BookmarkListState,
    BookmarkListAction,
} from "@/types";

// =============================================================================
// Bookmark Form Reducer
// =============================================================================

export function bookmarkFormReducer(
    state: BookmarkFormState,
    action: BookmarkFormAction
): BookmarkFormState {
    switch (action.type) {
        case "SUBMIT":
            // Can submit from idle or error (retry)
            if (state.status === "idle" || state.status === "error") {
                return { status: "validating" };
            }
            return state;

        case "VALIDATION_ERROR":
            if (state.status === "validating") {
                return { status: "error", message: action.message };
            }
            return state;

        case "SUBMIT_START":
            if (state.status === "validating") {
                return { status: "submitting" };
            }
            return state;

        case "SUBMIT_SUCCESS":
            if (state.status === "submitting") {
                return { status: "idle" };
            }
            return state;

        case "SUBMIT_ERROR":
            if (state.status === "submitting") {
                return { status: "error", message: action.message };
            }
            return state;

        case "RESET":
            return { status: "idle" };

        default:
            return state;
    }
}

// =============================================================================
// Bookmark Delete Reducer
// =============================================================================

export function bookmarkDeleteReducer(
    state: BookmarkDeleteState,
    action: BookmarkDeleteAction
): BookmarkDeleteState {
    switch (action.type) {
        case "DELETE":
            // Can initiate delete from idle or error (retry)
            if (state.status === "idle" || state.status === "error") {
                return { status: "confirming" };
            }
            return state;

        case "CONFIRM":
            if (state.status === "confirming") {
                return { status: "deleting" };
            }
            return state;

        case "CANCEL":
            if (state.status === "confirming") {
                return { status: "idle" };
            }
            return state;

        case "DELETE_SUCCESS":
            if (state.status === "deleting") {
                return { status: "idle" };
            }
            return state;

        case "DELETE_ERROR":
            if (state.status === "deleting") {
                return { status: "error", message: action.message };
            }
            return state;

        case "RESET":
            return { status: "idle" };

        default:
            return state;
    }
}

// =============================================================================
// Bookmark List Reducer
// =============================================================================

export function bookmarkListReducer(
    state: BookmarkListState,
    action: BookmarkListAction
): BookmarkListState {
    switch (action.type) {
        case "INSERT": {
            // Deduplicate — avoid adding if already present
            const exists = state.bookmarks.some(
                (b) => b.id === action.bookmark.id
            );
            if (exists) return state;

            return {
                status: "idle",
                bookmarks: [action.bookmark, ...state.bookmarks],
            };
        }

        case "DELETE":
            return {
                status: state.status === "error" ? "error" : "idle",
                bookmarks: state.bookmarks.filter((b) => b.id !== action.bookmarkId),
                ...(state.status === "error" ? { message: state.message } : {}),
            } as BookmarkListState;

        case "SYNC_ERROR":
            return {
                status: "error",
                bookmarks: state.bookmarks,
                message: action.message,
            };

        case "RESET_ERROR":
            return {
                status: "idle",
                bookmarks: state.bookmarks,
            };

        default:
            return state;
    }
}
