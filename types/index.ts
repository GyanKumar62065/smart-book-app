// =============================================================================
// Domain Models
// =============================================================================

export interface Bookmark {
    id: string;
    user_id: string;
    title: string;
    url: string;
    created_at: string;
}

// =============================================================================
// Bookmark Form State Machine
// =============================================================================

/**
 * State machine for the "Add Bookmark" form.
 *
 * Transitions:
 *   idle  ──SUBMIT──▶  validating
 *   validating ──VALIDATION_ERROR──▶  error
 *   validating ──SUBMIT_START──▶  submitting
 *   submitting ──SUBMIT_SUCCESS──▶  idle
 *   submitting ──SUBMIT_ERROR──▶  error
 *   error ──RESET──▶  idle
 *   error ──SUBMIT──▶  validating  (retry)
 */
export type BookmarkFormState =
    | { status: "idle" }
    | { status: "validating" }
    | { status: "submitting" }
    | { status: "error"; message: string };

export type BookmarkFormAction =
    | { type: "SUBMIT" }
    | { type: "VALIDATION_ERROR"; message: string }
    | { type: "SUBMIT_START" }
    | { type: "SUBMIT_SUCCESS" }
    | { type: "SUBMIT_ERROR"; message: string }
    | { type: "RESET" };

// =============================================================================
// Bookmark Delete State Machine
// =============================================================================

/**
 * State machine for deleting a bookmark.
 *
 * Transitions:
 *   idle  ──DELETE──▶  confirming
 *   confirming ──CONFIRM──▶  deleting
 *   confirming ──CANCEL──▶  idle
 *   deleting ──DELETE_SUCCESS──▶  idle
 *   deleting ──DELETE_ERROR──▶  error
 *   error ──RESET──▶  idle
 *   error ──DELETE──▶  confirming  (retry)
 */
export type BookmarkDeleteState =
    | { status: "idle" }
    | { status: "confirming" }
    | { status: "deleting" }
    | { status: "error"; message: string };

export type BookmarkDeleteAction =
    | { type: "DELETE" }
    | { type: "CONFIRM" }
    | { type: "CANCEL" }
    | { type: "DELETE_SUCCESS" }
    | { type: "DELETE_ERROR"; message: string }
    | { type: "RESET" };

// =============================================================================
// Bookmark List State Machine
// =============================================================================

/**
 * State machine for the real-time bookmark list.
 *
 * Transitions:
 *   idle ──INSERT──▶  idle  (with new bookmark prepended)
 *   idle ──DELETE──▶  idle  (with bookmark removed)
 *   idle ──SYNC_ERROR──▶  error
 *   error ──RESET_ERROR──▶  idle
 */
export type BookmarkListState =
    | { status: "idle"; bookmarks: Bookmark[] }
    | { status: "error"; bookmarks: Bookmark[]; message: string };

export type BookmarkListAction =
    | { type: "INSERT"; bookmark: Bookmark }
    | { type: "DELETE"; bookmarkId: string }
    | { type: "SYNC_ERROR"; message: string }
    | { type: "RESET_ERROR" };
