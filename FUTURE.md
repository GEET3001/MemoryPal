# MemoryPal — Future Development Paths

Current state: notes with links, AI chat per note, YouTube thumbnails, sharing.
Everything below is ranked by real-world user impact vs. build effort.

---

## Tier 1 — High Impact, Relatively Fast to Build

### 1. Ask Across All Notes (Global AI Search)
Right now the AI only knows about one note at a time. The biggest leap is letting users ask questions across their entire second brain.

**Example:** "What did I learn about startup fundraising?" → AI searches all notes, pulls relevant context, gives a synthesized answer.

**How:** On the `/api/v1/chat` global endpoint, fetch all user's notes, send them as context to Gemini. Add semantic chunking for large collections.

**Why it stands out:** This is the core promise of a "second brain" — recall anything you've ever saved. No current free tool does this well.

---

### 2. Browser Extension — Capture Anything in One Click
The current flow requires opening the app, clicking New Note, pasting a link. That friction kills habit formation.

**A browser extension that:**
- Right-click any page → "Save to MemoryPal"
- Auto-fills title from `<title>`, link from current URL, description from `<meta name="description">`
- Shows a mini popup to add a quick note before saving
- Works on YouTube, Twitter/X, articles, GitHub repos, PDFs

**Stack:** Chrome Extension Manifest V3 (plain JS), calls your existing `/api/v1/content` endpoint.

**Why it stands out:** This is the #1 feature request for every note-taking tool. Notion, Obsidian don't have first-party capture that's this fast.

---

### 3. Tags + Smart Filtering
Currently there's a `Tag` model in the DB that's completely unused. Wire it up.

**What to build:**
- Add tags field to notes (multi-select)
- AI auto-suggests tags when you save a note (Gemini: "suggest 3 tags for this note")
- Sidebar filters by tag
- Tag cloud on dashboard

**Why it stands out:** Users accumulate 50+ notes fast. Without filtering, the app becomes a graveyard.

---

### 4. Spaced Repetition Review Mode
Most people save things and never look at them again. This feature turns MemoryPal into an active learning tool.

**How it works:**
- Each note gets a `nextReviewDate` and `reviewInterval` field
- A "Review" page shows 5 notes due for review today
- User marks each as "Got it" (interval doubles) or "Forgot" (resets to 1 day)
- AI generates a question from the note content to test recall

**Why it stands out:** This is Anki meets Notion. No mainstream note-taking app has built this well. Students and learners would pay for this.

---

### 5. Daily Digest Email
Every morning at 8am, send the user an email with:
- 3 random notes from their collection ("Remember this?")
- 1 AI-generated connection between two of their notes
- Any notes due for review (if spaced repetition is built)

**Stack:** Node-cron on the backend, Resend or Nodemailer for email, a simple HTML email template.

**Why it stands out:** Passive recall. Users feel the value even when they don't open the app.

---

## Tier 2 — Meaningful Differentiation

### 6. Rich Content Types Beyond Links
Right now a note is: title + links + description. Expand to:

| Type | What it captures |
|---|---|
| **YouTube note** | Timestamp-linked notes on specific video moments |
| **Twitter/X thread** | Full thread text saved (via Twitter API or scraper) |
| **PDF highlight** | Upload PDF, highlight sections, AI summarizes |
| **Voice note** | Record audio → Gemini transcribes + summarizes |
| **Code snippet** | Syntax-highlighted code block with explanation |

Each type gets its own card design and AI context. A YouTube note's AI knows the transcript, not just the URL.

---

### 7. Note Connections Graph
Show users how their ideas relate.

**How:** After saving a note, run a background job that compares it to existing notes using Gemini embeddings. Store similarity scores. Render as an interactive graph (D3.js or a library like react-force-graph).

**Why it stands out:** This is the "map of your mind" visual. Obsidian charges $25/month partly for this. It's genuinely beautiful and viral — users screenshot and share it.

---

### 8. Public Knowledge Profile
Let users make a curated selection of notes public under `memorypal.com/u/username`.

**Features:**
- Choose which notes to "publish"
- Custom bio + profile photo
- Others can follow you and see your new public notes
- "Inspired by" feature — fork someone's note into your own collection

**Why it stands out:** Turns MemoryPal into a knowledge-sharing community, not just a private tool. Network effects drive growth.

---

### 9. Collaborative Workspaces
Add team/shared workspaces for:
- Study groups
- Startup research
- Team wikis

**Schema change:** Add a `workspaceId` field to Content. Workspace has members list with roles (owner/editor/viewer).

---

### 10. Offline-First PWA
Add a service worker and IndexedDB cache so the app works without internet. Syncs when reconnected.

**Why it matters:** Trust. Users won't rely on a tool that breaks on a bad WiFi connection.

---

## Tier 3 — Monetization & Scale

### 11. Freemium Model
| Free | Pro ($5/mo) |
|---|---|
| 50 notes | Unlimited notes |
| AI chat (limited) | Unlimited AI |
| No email digest | Daily digest |
| No extension | Browser extension |
| No graph view | Graph view |

**Stack:** Stripe Checkout + webhook to set a `plan` field on the User model. Gate features in middleware.

---

### 12. Integrations (Zapier / Webhooks)
Let users auto-save to MemoryPal from:
- Pocket / Instapaper
- Kindle highlights
- Apple Notes / Google Keep
- Slack (save any message with a reaction)
- RSS feeds

**How:** Expose a webhook endpoint per user. User gives the URL to Zapier. Done.

---

### 13. Mobile App (React Native)
The web app is already responsive, but native mobile enables:
- Share sheet integration (share any link from any app → saves to MemoryPal)
- Widget showing a random note
- Offline access
- Push notifications for review reminders

**Stack:** React Native + Expo. Most of the logic reuses your existing API.

---

### 14. Local AI Option
Let privacy-conscious users run AI locally via Ollama (Llama 3, Mistral).

**How:** Add a `AI_PROVIDER` env var. If set to `ollama`, swap the Gemini calls for `ollama.chat()`. Same interface, different backend.

**Why it matters:** Huge niche of users who won't put their notes into a cloud AI. This opens a whole market segment.

---

## Quick Wins (1-2 days each)

These don't need a section — just build them:

- **Note pinning** — pin important notes to the top of the dashboard
- **Word count + read time** on each note
- **Duplicate note** button
- **Keyboard shortcuts** — `N` for new note, `F` for search, `Esc` to close modal
- **Dark mode** — Tailwind makes this trivial with `dark:` classes
- **Export all notes** as a single JSON or ZIP of Markdown files
- **Search** — a simple `GET /api/v1/content?q=keyword` with MongoDB `$text` index
- **Note templates** — "Book Summary", "Meeting Notes", "Article Review" pre-fill the structure
- **Undo delete** — 30-second toast with undo button before actually deleting

---

## Suggested Build Order

If you're building this as a real product, this sequence makes the most sense:

1. **Search** (basic, fast, users expect it)
2. **Tags + filtering** (already have the model in DB)
3. **Global AI chat** (biggest differentiator, reuses Gemini setup)
4. **Browser extension** (biggest growth driver)
5. **Daily digest email** (retention)
6. **Spaced repetition** (retention + uniqueness)
7. **Public profiles** (growth + virality)
8. **Stripe + freemium** (monetization)

---

*The core insight: MemoryPal's moat isn't note storage (Notion does that) — it's AI-powered recall and connection. Every feature should make it easier to get something back out of your second brain, not just put things in.*
