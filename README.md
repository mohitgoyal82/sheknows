# She Knows — Women's Health Companion

A warm, personalised women's health chat companion by Meesha Goyal (@She_DeservesToKnow).

---

## 🚀 Deploy to Vercel in 5 steps

### Step 1 — Get your free Gemini API key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account (free)
3. Click **Get API Key** → **Create API key**
4. Copy the key — you'll need it in Step 4

> Free tier: 1,500 requests/day — plenty for this app.

---

### Step 2 — Put the project on GitHub
1. Go to [github.com](https://github.com) and create a **New repository** (name it `she-knows`)
2. On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/she-knows.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 3 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Find and select your `she-knows` repository
4. Click **Deploy** — Vercel auto-detects Next.js, no config needed

---

### Step 4 — Add your API key (critical!)
1. In Vercel, open your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** the key you copied in Step 1
   - **Environment:** Production, Preview, Development (tick all three)
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

---

### Step 5 — Done! 🎉
Your app is live at `https://she-knows.vercel.app` (or similar).
Every future `git push` auto-deploys.

---

## 💻 Run locally

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
# Edit .env.local and paste your real API key

# 3. Start the dev server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project structure

```
she-knows/
├── app/
│   ├── layout.js          # HTML shell + metadata
│   ├── page.js            # Root page
│   └── api/
│       └── chat/
│           └── route.js   # 🔒 Secure API route (API key lives here)
├── components/
│   └── SheKnows.js        # Full app UI
├── .env.example           # Template — copy to .env.local
├── .gitignore             # Keeps secrets out of git
└── package.json
```

**The API key never reaches the browser.** All Anthropic calls go through `/api/chat` (a server-side Next.js route), keeping your key safe.

---

## ⚠️ Disclaimer

This app provides informational support only. It is not a diagnosis or substitute for medical care.
