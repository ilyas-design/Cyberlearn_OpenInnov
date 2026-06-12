# CyberLearn

CyberLearn is a cybersecurity learning platform built with **Next.js** and **Firebase**. Students can browse lessons, track progress, save notes, earn badges, and manage their profile. Administrators can manage users, lessons, and platform settings through a dedicated admin panel.

## Features

- **Authentication** — Email/password sign-up and sign-in with **email verification** (Firebase Auth)
- **Lessons** — Structured cybersecurity courses with rich markdown content
- **User profiles** — Progress tracking, favorites, badges, and personal notes
- **Two-factor authentication (2FA)** — Optional TOTP-based security
- **Admin dashboard** — User management, lesson management, and settings (`/admin`)
- **Internationalization** — French and English UI strings

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Backend / Database | [Firebase](https://firebase.google.com) (Auth + Firestore) |
| Styling | CSS Modules |
| UI | React 19, Lucide icons |

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** and **npm**
- A **Google account** with access to the [Firebase Console](https://console.firebase.google.com)
- **Git** (to clone the repository)

## Quick Start (Docker)

The entire stack runs with one command:

```bash
# 1. Clone the repository
git clone <repository-url>
cd cyberlearn-project-1

# 2. Configure environment variables
cp .env.example .env   # fill in Firebase credentials

# 3. Set up Firebase and seed the database (see Firebase Setup)

# 4. Start everything
./run.sh
```

| Service | URL |
|---------|-----|
| CyberLearn app | http://localhost:3000 |
| Chatbot API | http://localhost:8080 |

```bash
./run.sh logs      # follow logs
./run.sh down      # stop stack
./run.sh restart   # rebuild and restart
```

Requires **Docker Desktop** (or Docker Engine + Compose).

### Optional: local AI model (GPU)

Add `COMPOSE_PROFILES=local_model` to `.env` to start the vLLM container (NVIDIA GPU required). Without it, the chatbot falls back to predefined FAQ answers.

---

## Quick Start (local dev)

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For the chatbot API in local dev, run `./run.sh up` (Docker) or start `chabot_api/` manually. Set `CHATBOT_API_URL=http://localhost:8080` in `.env`.

---

## Chatbot API

The support chatbot is powered by [chabot_api](https://github.com/Yatarox/chabot_api), included in `chabot_api/`. It proxies requests to an OpenAI-compatible LLM (local vLLM or external service).

The Next.js app calls `/api/chat`, which forwards messages to the chatbot API with CyberLearn context. If the API is unavailable, the chatbot falls back to predefined answers.

Point `MODEL_URL` in `.env` to any OpenAI-compatible endpoint for AI responses without a local GPU.

---

## Firebase Setup

CyberLearn uses **Firestore** (not Firebase Data Connect / SQL). Follow these steps to connect a new Firebase project.

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a project (or select an existing one).
2. Register a **Web app** (`</>` icon) under **Project settings → Your apps**.
3. Copy the `firebaseConfig` values — you will need them for `.env`.

### 2. Enable Firestore

1. In the sidebar, open **Firestore Database** (use the search bar if you do not see it).
2. Click **Create database**.
3. Choose a location (e.g. `eur3` for Europe).
4. Select **production mode**, then confirm.

### 3. Enable Authentication

1. Open [Authentication](https://console.firebase.google.com) for your project (search “Authentication” in the sidebar).
2. Click **Get started**.
3. Under **Sign-in method**, enable **Email/Password**.

Email verification is handled by the app automatically on registration. Optionally customize the verification email under **Authentication → Templates → Email address verification**.

Make sure your domains are listed under **Authentication → Settings → Authorized domains** (include `localhost` for local development and your production domain when deployed).

### 4. Deploy Firestore security rules

This project includes security rules in `firestore.rules`. Deploy them to your Firebase project:

```bash
npm run firebase:login    # opens browser for Google sign-in (first time only)
npm run deploy:rules
```

The project ID is configured in `.firebaserc`. Update it if you use a different Firebase project:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 5. Seed lesson data

Lessons are stored in Firestore collections `lessons` and `lessonContents`. Populate them with the seed script.

**Recommended — Service account (Admin SDK):**

1. Firebase Console → **Project settings → Service accounts**
2. Click **Generate new private key** and download the JSON file
3. Save it as `serviceAccountKey.json` in the project root (this file is gitignored)
4. Add to `.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

5. Run the seed:

```bash
npm run seed:lessons
```

You should see `Mode : Firebase Admin SDK` and success messages for each lesson.

**Alternative — Admin user credentials:**

If you already have a user with `isAdmin: true` in Firestore, you can seed with:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=your-password
```

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file** — it is listed in `.gitignore`.

### Required (application)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> Use the format `KEY=value` (no colons, no quotes around values).

Find these values in **Firebase Console → Project settings → Your apps → SDK setup and configuration**.

### Required for seeding (one of the following)

```env
# Option A — service account JSON file (recommended)
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Option B — inline credentials
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Option C — existing admin account
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=your-password
```

---

## Granting Admin Access

After registering on the site:

1. Open **Firestore** in the Firebase Console.
2. Go to the `users` collection and open your user document (UID matches Firebase Auth).
3. Add or set the field **`isAdmin`** to `true` (boolean).

You can then access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Email Verification Flow

When a user registers:

1. Firebase Auth creates the account.
2. The app sends a **verification email** via `sendEmailVerification`.
3. The user is redirected to `/auth/verify-email`.
4. Until the email is verified, protected routes redirect back to that page.
5. After clicking the link in the email, the user clicks **“I verified my email”** to refresh their session.

Relevant files:

| File | Role |
|------|------|
| `app/components/Auth/Register.tsx` | Sends verification email on sign-up |
| `app/components/Auth/SignIn.tsx` | Redirects unverified users to `/auth/verify-email` |
| `app/auth/verify-email/page.tsx` | Verification pending screen |
| `app/firebase/emailVerification.ts` | Send and refresh helpers |
| `app/context/AuthContext.tsx` | Blocks unverified users from the app |

If emails are not received, check spam, Firebase **Authentication → Templates**, and that the sender domain is configured for your project.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run seed:lessons` | Upload lessons and content to Firestore |
| `npm run firebase:login` | Authenticate with Firebase CLI |
| `npm run deploy:rules` | Deploy `firestore.rules` to Firebase |

---

## Project Structure

```
cyberlearn-project-1/
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── components/      # React components
│   ├── firebase/        # Firebase config and Firestore helpers
│   ├── lessons/         # Lesson listing and detail pages
│   ├── locales/         # i18n translation files (en, fr)
│   └── ...
├── scripts/
│   └── seedLessons.js   # Database seed script
├── firestore.rules      # Firestore security rules
├── firebase.json        # Firebase CLI configuration
└── .firebaserc          # Firebase project alias
```

---

## Firestore Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles, progress, notes, badges, admin flag |
| `lessons` | Lesson metadata (title, order, category, etc.) |
| `lessonContents` | Lesson body content (markdown) |
| `settings` | Platform settings (admin only) |
| `adminLogs` | Admin action logs |

---

## Troubleshooting

### `firebase: command not found`

Use the npm scripts instead of a global install:

```bash
npm run firebase:login
npm run deploy:rules
```

### `PERMISSION_DENIED` when running `seed:lessons`

Firestore rules only allow admins to write lessons. Use the **service account** method (Admin SDK) or sign in with an account that has `isAdmin: true`.

### Lessons do not appear on the homepage

1. Confirm `npm run seed:lessons` completed without errors.
2. Check Firestore for the `lessons` collection in the Firebase Console.
3. Restart the dev server after changing `.env`.

### Authentication errors

- Verify **Email/Password** is enabled in Firebase Authentication.
- Confirm `.env` values match your Firebase Web app config.
- Restart `npm run dev` after editing `.env`.

### Firebase Console in the wrong language

Add `?hl=en` to the console URL, or change your preferred language at [myaccount.google.com/language](https://myaccount.google.com/language).

---

## Security Notes

- **Never commit** `.env`, `serviceAccountKey.json`, or any `*-firebase-adminsdk-*.json` file.
- Rotate your service account key if it is ever exposed.
- Review `firestore.rules` before deploying to production.
- For deployed sites, add your domain under **Authentication → Settings → Authorized domains**.
- HTTP security headers are set in `next.config.ts` (no extra service required).

---

## Staying at $0 (Student / Free Tier)

This project is designed to run **without paid services**. You only need:

| Service | Free option | Used by CyberLearn |
|---------|-------------|-------------------|
| Firebase | **Spark plan** (default) | Auth + Firestore rules |
| Hosting | **Vercel Hobby** or local `npm run dev` | Next.js app |
| Database | Firestore free quota | Lessons, users, progress |

### What this project uses (all free on Spark)

- **Firebase Authentication** (email/password)
- **Cloud Firestore** (reads/writes within daily free limits)
- **Firestore security rules** (`npm run deploy:rules` only — no Cloud Functions, no Storage)

### What to avoid (can trigger billing)

1. **Do not upgrade to the Blaze plan** unless you explicitly need paid features.
2. **Do not enable** Cloud Functions, Cloud Storage uploads, or Firebase Extensions that require Blaze.
3. **Do not add** OpenAI, Hugging Face, or other paid API keys — the app does not use them.
4. **Do not run** `firebase deploy` without `--only firestore:rules` if you later add Hosting/Functions to `firebase.json`.
5. **Service account key** — only for local `npm run seed:lessons`; never expose it publicly (abuse can inflate Firestore usage).

### Recommended safeguards (free, 2 minutes)

1. [Firebase Console](https://console.firebase.google.com) → **Usage and billing** → confirm plan is **Spark**.
2. Google Cloud Console → **Billing** → **Budgets & alerts** → create a **$0 or $1 budget** with email alerts.
3. Monitor **Firestore** usage under Firebase → **Firestore** → **Usage** during demos or class presentations.

### Typical student usage

For a class project (tens of users, seeded lessons, local dev + occasional demo deploy), you should remain **well within** Spark limits (e.g. 50K Firestore reads / day). The hardened `firestore.rules` also reduce abuse (fake admin, XP inflation, spam logs).

---

## License

Private project — all rights reserved unless otherwise specified by the repository owner.
