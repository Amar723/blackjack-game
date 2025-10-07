# 🃏 Blackjack Game Setup Guide

## Quick Setup Steps

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Supabase Setup

1. **Create Supabase Project:**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to be ready

2. **Get Your Credentials:**

   - Go to Settings → API
   - Copy Project URL and anon key
   - Add them to your `.env.local`

3. **Set Up Database:**

   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL commands

4. **Enable Google OAuth:**
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your domain to redirect URLs

### 3. Google Gemini Setup

1. **Get API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your `.env.local`

### 4. Run the Application

```bash
npm run dev
```

## Troubleshooting

### Supabase Connection Issues

- Make sure your `.env.local` file exists
- Check that your Supabase URL is correct
- Verify your anon key is correct
- Ensure your Supabase project is active

### Google OAuth Issues

- Make sure Google provider is enabled in Supabase
- Check that redirect URLs include your domain
- Verify your Google OAuth credentials

### Build Issues

- Run `npm run build` to check for errors
- Make sure all environment variables are set
- Check that all dependencies are installed

## Project Structure

```
blackjack-game/
├── .env.local              # Environment variables (create this)
├── app/
│   ├── signin/            # Sign-in page
│   ├── game/              # Game page
│   ├── history/           # History page
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/
│   ├── supabase.ts        # Database operations
│   ├── game-logic.ts      # Blackjack rules
│   └── gemini.ts          # AI integration
└── supabase-schema.sql    # Database setup
```

## Features

- ✅ Google OAuth Authentication
- ✅ Real-time Blackjack Game
- ✅ AI Strategy Assistant (Gemini)
- ✅ Game Statistics & History
- ✅ Chip Management
- ✅ Mobile Responsive Design
- ✅ Dark Theme with Yellow Highlights
