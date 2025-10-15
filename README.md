# TaskReward - Telegram Mini App

A Telegram Mini App for earning rewards through watching ads and inviting friends.

## Features

- 💰 **Watch Ads**: Earn 10 points per ad view with Monetag integration
- 👥 **Referral System**: Invite friends and earn 500 points per referral
- 🏆 **Leaderboard**: Compete with other users and climb the rankings
- 📱 **Telegram Integration**: Native Telegram WebApp experience with haptic feedback
- 💳 **Monetag Ads**: Integrated ad network (Zone ID: 10042745)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Monetag Ad Network
NEXT_PUBLIC_MONETAG_ZONE_ID=10042745

# Rewards Configuration (points)
NEXT_PUBLIC_POINTS_PER_AD_VIEW=10
NEXT_PUBLIC_REFERRAL_BONUS_REFERRER=500
NEXT_PUBLIC_REFERRAL_BONUS_REFEREE=250
NEXT_PUBLIC_MIN_WITHDRAWAL_POINTS=1000
\`\`\`

## Setup Instructions

### 1. Database Setup

Visit `/setup` in your deployed app to automatically initialize the database, or manually run the SQL scripts in the `/scripts` folder in order.

### 2. Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Get your bot token and add it to environment variables
3. Set up your Mini App:
   \`\`\`
   /newapp
   Select your bot
   Enter app title: TaskReward
   Enter app description: Earn rewards by watching ads
   Upload app icon (512x512 PNG)
   Enter Web App URL: https://your-domain.vercel.app
   \`\`\`
4. Get your Mini App link and share it with users

### 3. Monetag Setup

The app is pre-configured with Monetag Zone ID `10042745`. The integration uses:

\`\`\`html
<script src='//libtl.com/sdk.js' data-zone='10042745' data-sdk='show_10042745'></script>
\`\`\`

To use your own Monetag account:
1. Sign up at [Monetag](https://monetag.com)
2. Create an ad zone and get your zone ID
3. Update `NEXT_PUBLIC_MONETAG_ZONE_ID` in your environment variables

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy!

## How It Works

### Earning Points

**Watch Ads (10 points)**
- Click "Watch Ad" button
- Monetag ad is displayed
- Earn 10 points after viewing

**Invite Friends (500 points)**
- Share your referral link
- When someone joins using your link, you earn 500 points
- They also get 250 points as a welcome bonus

### Leaderboard

- View top earners
- See your rank
- Track your referral stats

## Rewards Configuration

All reward amounts are configurable via environment variables:

- **Ad View**: 10 points (default)
- **Referral Bonus (Referrer)**: 500 points (default)
- **Referral Bonus (Referee)**: 250 points (default)
- **Minimum Withdrawal**: 1000 points (default)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Telegram WebApp
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Ad Network**: Monetag (libtl.com SDK)

## Telegram Mini App Features

- Native Telegram theme integration
- Haptic feedback on interactions
- Native share functionality
- Optimized for mobile WebView
- Back button handling

## License

MIT
