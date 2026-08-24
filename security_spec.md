# Firestore Security Specification - Santri Modern

## 1. Data Invariants
- A `post` must have a valid `userId` matching the creator.
- Users can only edit their own `posts`.
- `likes` on a post are an array of User IDs; a user can only add/remove their own ID.
- `comments` must be associated with a valid `postId`.
- `users` profiles can only be written by the owner.
- Admin features (quizzes, rewards, broadcasts) are only writeable by users with the `admin` role.

## 2. The "Dirty Dozen" Payloads (Rejected Cases)
1. Creating a post with another user's `userId`.
2. Updating a post's `content` as a different user.
3. Modifying the `role` field in a user profile (privilege escalation).
4. Deleting another user's post.
5. Injected "Ghost Fields" like `isAdmin: true` into a post payload.
6. Massive string (>1MB) in `content` field (Denial of Wallet).
7. Invalid ID characters in a `postId`.
8. Updating `createdAt` timestamp (Immutability violation).
9. Self-approving a redemption request.
10. Listing all users' private bookmarks.
11. Spoofing user email in a read request.
12. Incrementing `commentCount` by a value other than 1.

## 3. Test Runner (Conceptual)
All the above payloads MUST return `PERMISSION_DENIED`.
