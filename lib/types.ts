export type Lang = "fi" | "uk" | "en"

export interface Casino {
  id: string
  slug: string
  name: string
  logo_url?: string
  banner_url?: string
  established_year?: number
  rating: number
  trust_score: number
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  rank: number
  affiliate_url: string
  mene_slug: string
  languages_supported: string[]
  available_in: string[]
  restricted_in: string[]

  // Licensing
  license_authority?: string
  license_number?: string
  license_url?: string
  is_verified?: boolean

  // WP-imported bonus content (HTML — strip before display)
  bonus_text?: string
  bonus_terms?: string
  bonus_detailed_tc?: string
  excerpt_fi?: string
  rating_trust?: number
  rating_games?: number
  rating_bonus?: number
  rating_customer?: number
  button_title?: string
  button_notice?: string
  lang?: string

  // Bonuses
  welcome_bonus_text?: string
  welcome_bonus_percent?: number
  welcome_bonus_max_amount?: number
  welcome_bonus_currency?: string
  welcome_bonus_wagering?: number
  welcome_bonus_min_deposit?: number
  no_deposit_bonus?: boolean
  no_deposit_amount?: number
  free_spins_amount?: number
  free_spins_game?: string
  cashback_percent?: number
  loyalty_program?: boolean
  vip_program?: boolean

  // Payments
  min_deposit?: number
  max_withdrawal_per_day?: number
  max_withdrawal_per_month?: number
  withdrawal_time_min_hours?: number
  withdrawal_time_max_hours?: number
  payment_methods: string[] | null
  currencies_accepted: string[] | null

  // Games
  game_providers: string[] | null
  total_games_count?: number
  slots_count?: number
  live_casino?: boolean
  sports_betting?: boolean
  poker?: boolean
  jackpot_games?: boolean
  game_demo_available?: boolean

  // UX/Technical
  mobile_app_ios?: boolean
  mobile_app_android?: boolean
  mobile_optimized?: boolean
  live_chat_support?: boolean
  support_email?: boolean
  support_phone?: boolean
  support_languages: string[]
  kyc_required?: boolean | null
  kyc_documents?: string[] | null
  registration_steps?: number | null
  account_verification_time?: number | null
  is_pikakasino?: boolean

  // Content (per language)
  review_fi?: string
  review_en?: string
  review_uk?: string
  pros_fi?: string[]
  pros_en?: string[]
  pros_uk?: string[]
  cons_fi?: string[]
  cons_en?: string[]
  cons_uk?: string[]
  faq_fi?: { q: string; a: string }[]
  faq_en?: { q: string; a: string }[]
  faq_uk?: { q: string; a: string }[]
  meta_title_fi?: string
  meta_title_en?: string
  meta_title_uk?: string
  meta_description_fi?: string
  meta_description_en?: string
  meta_description_uk?: string

  // Media
  screenshots?: string[]
  video_review_url?: string

  // Badge/tag for display
  badge?: string
  badge_variant?: "gold" | "yellow" | "gray"
}

export interface Bonus {
  id: string
  casino_id?: string
  casino_name?: string
  casino_logo?: string
  casino_slug?: string
  title?: string
  description?: string
  bonus_type: "welcome" | "no_deposit" | "free_spins" | "cashback" | "reload"
  amount?: string
  wagering?: number
  min_deposit?: number
  is_featured?: boolean
  is_active?: boolean
  start_date?: string
  end_date?: string
  lang?: string
  created_at?: string
}

export interface Game {
  id: string
  slug: string
  name: string
  provider: string
  thumbnail?: string
  thumbnail_url?: string
  rtp?: number
  volatility?: "low" | "medium" | "high"
  type?: "slot" | "live" | "table" | "jackpot" | "other"
  min_bet?: number
  max_bet?: number
  paylines?: number
  demo_url?: string
  is_active?: boolean
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

export interface BonusHuntSlot {
  game: string
  provider: string
  balance: number
  bet: number
  bonus_value: number
  multiplier: number | null
}

export interface RaffleWinner {
  name: string
  prize: string
  casino?: string
  date?: string
}

export interface Raffle {
  id: string
  title: string
  description?: string
  prize?: string
  prize_value?: number
  status: "upcoming" | "active" | "completed" | "cancelled"
  starts_at?: string
  ends_at: string
  winner_id?: string
  stream_url?: string
  created_at?: string
  // Enriched fields (may come from DB JSONB columns)
  casino_name?: string
  casino_slug?: string
  how_to?: string[]
  past_winners?: RaffleWinner[]
  upcoming?: Raffle[]
}

export interface BonusHunt {
  id: string
  title: string
  date: string
  status: "upcoming" | "active" | "completed"
  is_active: boolean
  start_balance: number
  current_balance: number
  total_buyin: number
  total_invested: number
  total_won: number
  stream_url?: string
  notes?: string
  slots: BonusHuntSlot[]
}

export interface NavItem {
  label_fi: string
  label_en: string
  label_uk: string
  href: string
}
