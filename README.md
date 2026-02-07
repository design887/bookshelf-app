# 📚 Bookshelf

A personal book collection tracker with shelf visualization, themes, and search.

## Deploy to Vercel

### 1. Create a new GitHub repo

```bash
# In this directory:
git init
git add .
git commit -m "Initial commit"

# Create a NEW repo on GitHub (e.g. "bookshelf-app")
# Do NOT use your existing fantasy-map repo
gh repo create bookshelf-app --public --source=. --push
# Or manually:
git remote add origin https://github.com/YOUR_USERNAME/bookshelf-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"** (not import into existing)
3. Select the **bookshelf-app** repo
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy** — no env vars needed

This creates a **separate Vercel project** from your map generator. Each GitHub repo → its own Vercel project automatically.

### 3. Custom domain (optional)

In the Vercel project dashboard → Settings → Domains, you can add a custom domain or use the free `bookshelf-app-xxx.vercel.app` URL.

## Local development

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

## Tech

- Next.js 14 (App Router)
- React 18
- localStorage for persistence
- Open Library API for cover images
- Zero backend — fully static
