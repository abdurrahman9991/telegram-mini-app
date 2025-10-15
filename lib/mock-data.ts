export interface User {
  id: string
  username: string
  firstName: string
  avatar: string
  points: number
  adsWatched: number
  tasksCompleted: number
  referrals: number
  rank: number
}

export interface Task {
  id: string
  title: string
  description: string
  thumbnail: string
  points: number
  type: "content" | "quiz" | "game"
  completed: boolean
}

export interface LeaderboardEntry {
  id: string
  username: string
  avatar: string
  points: number
  rank: number
}

export const mockUser: User = {
  id: "1",
  username: "telegram_user",
  firstName: "John",
  avatar: "/diverse-user-avatars.png",
  points: 2450,
  adsWatched: 45,
  tasksCompleted: 23,
  referrals: 8,
  rank: 12,
}

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Watch Daily News",
    description: "Stay updated with today's top stories",
    thumbnail: "/news-thumbnail.png",
    points: 50,
    type: "content",
    completed: false,
  },
  {
    id: "2",
    title: "Complete Quiz Challenge",
    description: "Test your knowledge and earn rewards",
    thumbnail: "/quiz-thumbnail.jpg",
    points: 100,
    type: "quiz",
    completed: false,
  },
  {
    id: "3",
    title: "Play Mini Game",
    description: "Have fun and collect bonus points",
    thumbnail: "/game-thumbnail.jpg",
    points: 75,
    type: "game",
    completed: false,
  },
  {
    id: "4",
    title: "Read Tech Article",
    description: "Learn about the latest technology trends",
    thumbnail: "/tech-article.png",
    points: 60,
    type: "content",
    completed: true,
  },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    username: "crypto_king",
    avatar: "/diverse-group-avatars.png",
    points: 5420,
    rank: 1,
  },
  {
    id: "2",
    username: "task_master",
    avatar: "/pandora-ocean-scene.png",
    points: 4890,
    rank: 2,
  },
  {
    id: "3",
    username: "reward_hunter",
    avatar: "/diverse-group-futuristic-setting.png",
    points: 4320,
    rank: 3,
  },
  {
    id: "4",
    username: "daily_grinder",
    avatar: "/diverse-group-futuristic-avatars.png",
    points: 3850,
    rank: 4,
  },
  {
    id: "5",
    username: "point_collector",
    avatar: "/diverse-futuristic-avatars.png",
    points: 3420,
    rank: 5,
  },
]
