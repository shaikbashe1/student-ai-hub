# Firestore Security Specification

This document outlines the security invariants, vulnerability tests ("Dirty Dozen" payloads), and rules validation for the Student AI Hub Firestore architecture.

## 1. Data Invariants

- **Profiles (`/profiles/{profileId}`)**:
  - Every profile must correspond to an authenticated user where `profileId == auth.uid`.
  - The `email` stored must match the `auth.token.email`.
  - Users cannot self-escalate their `role` (e.g., from `student` to `admin`). Only administrators can modify roles or we block role changes on updates.
  - Daily prompt limit must be strictly enforced.

- **AI Tools (`/ai_tools/{toolId}`)**:
  - Anyone (authenticated or guest) can read the AI tools directory.
  - Only authorized admin users (`profiles/{userId}` with role == 'admin') can create, update, or deletes tools.

- **Internships (`/internships/{internshipId}`)**:
  - Anyone (authenticated or guest) can read available internships.
  - Only authorized admin users can create, update, or delete internships.

- **Hackathons (`/hackathons/{hackathonId}`)**:
  - Anyone can read hackathons.
  - Only admin users can manage (create, update, delete) hackathons.

- **Chat Sessions (`/chat_sessions/{sessionId}`)**:
  - Chat sessions belong to a single user (`ownerId` / `user_id`).
  - Reads and writes to a session or its nested messages are restricted strictly to that specific user.
  - Admins can delete or inspect if there are issues, or only the user can access them. We restrict it so only the owner has access to their session.

- **Saved Items (`/saved_items/{savedItemId}`)**:
  - A saved item belongs to a specific user (`user_id`).
  - Only the owner can create, read, or delete their saved items.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Self-Elevated Admin Profile**: A student attempts to create a profile under their own UID with `role: "admin"`.
2. **Profile Spoofing**: User A attempts to update User B's profile.
3. **Ghost fields on Profile**: A user attempts to add an un-modeled field (e.g., `isSuperDeveloper: true`) during a profile update.
4. **Unauthorized AI Tool Injection**: A student attempts to publish a malicious endpoint in `/ai_tools/xyz` without admin credentials.
5. **Admin Bypass on Tool Editing**: Student updates `/ai_tools/some-tool` and changes its URL to a phishing domain.
6. **Malicious Hackathon Deletion**: An unauthenticated or standard student user attempts to DELETE `/hackathons/hack-123`.
7. **Chat Session Stealing**: User B attempts to read User A's session in `/chat_sessions/session_a`.
8. **Malicious Chat Message Spoofing**: User B writes a message into User A's chat session path `/chat_sessions/session_a/messages/msg_999` with role `assistant` pretending to be AI.
9. **Saved Item Forgery**: User B creates a bookmark `/saved_items/save_abc` asserting `user_id: "user_a"` to mess with their count.
10. **Denial of Wallet ID Poisoning**: Attacker injects a massive 1MB string as the Document ID for an internship `/internships/LONG_MALICIOUS_KEY_OF_1MB_CHARS_TO_EXHAUST_QUERY_LOGS`.
11. **Immotable Fields Tampering**: A user attempts to update the immutable `created_at` timestamp on their profile or chat session.
12. **Future Timestamp Spoofing**: User attempts to set a custom future timestamp on a chat message rather than the current server timestamp `request.time`.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

// Mock environment setup to verify that all non-compliant transactions are aborted.
// Example: verifying that User B writing into '/profiles/user_a' fails.
```
