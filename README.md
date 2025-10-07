# 🃏 Blackjack Game - AI-Powered Casino Experience

A full-stack blackjack game built with Next.js 14, featuring AI strategy advice, detailed game statistics, and secure authentication. Experience authentic casino gameplay with modern web technologies.

## ✨ Features

- **🎮 Authentic Blackjack Gameplay**: Standard casino rules with realistic card dealing
- **🤖 AI Strategy Assistant**: Real-time advice from Google Gemini AI during gameplay
- **📊 Game Statistics**: Detailed history tracking with win/loss analytics
- **🔐 Secure Authentication**: Google OAuth integration with Supabase
- **💳 Chip Management**: Buy chips and track your balance
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🎨 Smooth Animations**: Card dealing animations with Framer Motion
- **🎯 Real-time Updates**: Live game state management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account (for Gemini AI)

### 1. Clone and Install

```bash
git clone <repository-url>
cd blackjack-game
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL commands from `supabase-schema.sql`
4. Enable Google OAuth in Authentication > Providers
5. Add your domain to the allowed redirect URLs

### 4. Google Gemini Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎮 How to Play

1. **Sign In**: Use Google OAuth to authenticate
2. **Place Bet**: Choose your bet amount (start with 500 free chips)
3. **Play**: Get as close to 21 as possible without going over
4. **AI Advice**: Click "Ask AI for Strategy" for real-time recommendations
5. **Track Progress**: View your game history and statistics

## 📁 Project Structure

```
blackjack-game/
├── app/                    # Next.js App Router
│   ├── game/              # Game page
│   ├── history/           # Statistics page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # ShadCN UI components
│   ├── Card.tsx           # Playing card component
│   ├── Hand.tsx           # Card hand display
│   ├── BettingInterface.tsx
│   ├── AIAdvice.tsx       # Gemini AI integration
│   └── AuthButton.tsx     # Authentication
├── lib/                   # Utility functions
│   ├── supabase.ts        # Database operations
│   ├── game-logic.ts      # Blackjack game rules
│   └── gemini.ts          # AI integration
└── public/                # Static assets
```

## 🎯 Game Rules

- **Objective**: Get as close to 21 as possible without going over
- **Card Values**: 2-10 face value, J/Q/K = 10, Ace = 1 or 11
- **Player Actions**: Hit (draw card) or Stand (keep current hand)
- **Dealer Rules**: Must hit on 16 or less, stand on 17 or more
- **Winning**: Higher total without busting, tie = push (bet returned)
- **Payout**: 1:1 for wins, bet returned for pushes

## 🤖 AI Assistant

The AI assistant uses Google Gemini to provide real-time blackjack strategy advice:

- Analyzes your current hand and dealer's visible card
- Provides Hit/Stand recommendations with reasoning
- Uses standard blackjack strategy principles
- Available during player turn only

## 📊 Game Statistics

Track your performance with detailed analytics:

- **Overall Stats**: Win rate, total games, wins/losses/pushes
- **Financial**: Total wagered, winnings, net result
- **Game History**: Individual game details with hands and results
- **Performance**: Biggest win, streaks, and trends

## 🔐 Security Features

- **Authentication**: Secure Google OAuth integration
- **Data Protection**: Row Level Security (RLS) in Supabase
- **User Isolation**: Each user's data is completely separate
- **Secure API**: Environment variables for sensitive data

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_key
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run format       # Format code
```

### Code Structure

- **Components**: Reusable UI components with TypeScript
- **Game Logic**: Pure functions for blackjack rules
- **Database**: Type-safe Supabase operations
- **AI Integration**: Async Gemini API calls
- **Animations**: Smooth card dealing with Framer Motion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are set correctly
2. Ensure Supabase database schema is properly set up
3. Verify Google Gemini API key is valid
4. Check browser console for any errors

## 🎉 Acknowledgments

- **Next.js** for the amazing React framework
- **Supabase** for the backend-as-a-service platform
- **Google Gemini** for the AI capabilities
- **ShadCN UI** for the beautiful component library
- **Framer Motion** for smooth animations
