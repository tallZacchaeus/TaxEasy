# TaxEasy Survey

A Next.js + Supabase survey app for validating the TaxEasy product idea — built for the TS Academy Product Management capstone (GovTech / Public Services theme).

## What's Inside

- **Public survey** (`/`) — 10 questions, mobile-first, one question at a time
- **Live results page** (`/results`) — public, real-time bar charts of all responses
- **Admin export** (`/admin`) — password-protected CSV download of all responses
- **Supabase backend** — PostgreSQL database, free tier
- **Deploy on Vercel** — free, takes ~5 minutes

---

## Quick Setup (15 minutes total)

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free, no card needed)
2. Click **New Project**
3. Name it `taxeasy-survey`, set a database password (save it somewhere), pick the closest region (probably `eu-west` for Lagos)
4. Wait ~2 minutes for the project to spin up

### Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open the file `supabase-setup.sql` from this project
3. Copy the entire contents and paste into the SQL editor
4. Click **Run**

You should see "Success. No rows returned." This created your table and security policies.

### Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll need three values:
   - **Project URL** (looks like `https://abcdef.supabase.co`)
   - **anon / public key** (long string, safe to expose)
   - **service_role key** (long string, KEEP SECRET — never commit this)

### Step 4: Run Locally

```bash
# Install dependencies
npm install

# Create your env file
cp .env.example .env.local

# Edit .env.local and fill in your Supabase keys + a strong admin password
```

Your `.env.local` should look like:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_PASSWORD=YourStrongPasswordHere
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and take the survey to test.

### Step 5: Deploy to Vercel

1. Push this code to a GitHub repo
2. Go to [vercel.com](https://vercel.com), sign up with GitHub
3. Click **Add New** → **Project** → import your repo
4. In the **Environment Variables** section, add the same 4 variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
5. Click **Deploy**

In ~2 minutes you'll have a live URL like `taxeasy-survey.vercel.app`. Share it on WhatsApp.

---

## How to Use It

### Sharing the Survey
- Send the main URL (`https://your-app.vercel.app`) to respondents on WhatsApp, Twitter, etc.
- They'll see the welcome screen, take the 10-question survey, and submit anonymously.

### Viewing Results
- Anyone can visit `/results` to see live bar charts of responses.
- This is great for sharing aggregate findings with your team.

### Exporting Data for Discovery Evidence
- Visit `/admin` on your deployed site
- Enter the `ADMIN_PASSWORD` you set in Vercel env vars
- Click **Download CSV** — opens in Excel, Google Sheets, or any analytics tool

### Viewing Raw Data in Supabase
- Open your Supabase dashboard → **Table Editor** → `survey_responses`
- See every response, filter, sort, run SQL queries
- No login limits — log in as often as you want

---

## Project Structure

```
taxeasy-survey/
├── app/
│   ├── page.js              # Main survey page (intro + questions)
│   ├── results/page.js      # Public live results dashboard
│   ├── admin/page.js        # Password-protected CSV export
│   ├── api/
│   │   ├── responses/       # POST submit, GET fetch all
│   │   └── admin/export/    # POST CSV export (password required)
│   ├── layout.js
│   └── globals.css
├── lib/
│   ├── supabase.js          # Supabase client setup
│   └── questions.js         # Survey questions (single source of truth)
├── supabase-setup.sql       # Run this once in Supabase SQL editor
├── .env.example             # Template for env variables
├── package.json
└── README.md
```

---

## Customizing the Survey

All 10 questions live in `lib/questions.js`. To edit:

- **Change a question:** edit the `question` field
- **Change options:** edit the `options` array (for `single` type)
- **Add a new question:** add a new object to the array, give it a unique `id` like `q11`
- **Change scale labels:** edit `scaleLabels` (for `scale` type)

After editing, the changes apply to:
- The survey form (automatically)
- The results page (automatically)
- The CSV export (automatically — uses question IDs as column headers)

No database changes needed; new questions just become new keys in the JSON.

---

## Security Notes

- The **anon key** is safe to expose in the browser. It's protected by Row Level Security (RLS) policies.
- The **service role key** must NEVER be sent to the client. It's only used in `/api/admin/export/route.js` server-side.
- The **admin password** is checked server-side before CSV export runs.
- Survey responses are anonymous — no IP, no fingerprint, no user ID stored.

---

## Capstone Submission Tips

For the TS Academy capstone, this app gives you:

- **Discovery evidence:** Real survey responses exported as CSV
- **Build evidence:** Working demo link (the Vercel URL), architecture (Next.js → Supabase Postgres), API approach (REST), basic security (RLS + admin password)
- **Metrics & instrumentation:** Response count, distribution per question
- **Engineering quality:** Real database, proper API routes, environment variable management

Add this README to your submission folder as part of the build documentation.

---

## Troubleshooting

**Survey submits but doesn't save:**
- Check Supabase dashboard → **Logs** → **API logs**. Likely RLS policy missing — re-run `supabase-setup.sql`.

**Admin export says "Unauthorized":**
- The password in your form must match `ADMIN_PASSWORD` in your env vars exactly.
- After changing env vars on Vercel, you must redeploy (Settings → Deployments → Redeploy).

**Project paused:**
- Supabase free tier pauses after 7 days of inactivity. Just click "Restore" in the dashboard. Data is intact.

**"Failed to fetch responses" on results page:**
- Either Supabase is down or your env vars are wrong on Vercel. Check **Settings → Environment Variables**.

---

## Built For

TS Academy Product Management Capstone — Group on **Theme 3: GovTech / Public Services**.

Tax made simple for everyday Nigerians.
