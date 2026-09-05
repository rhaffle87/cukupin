export type Transaction = {
  id: string
  user_id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  transaction_date: string
  note: string | null
  payment_method?: string | null
  created_at: string
}

export type SavingGoal = {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  created_at: string
}

export type WishlistItem = {
  id: string
  user_id: string
  name: string
  price: number
  url?: string | null
  priority: 'Low' | 'Medium' | 'High'
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      transactions: { Row: Transaction; Insert: Omit<Transaction, 'id' | 'created_at'>; Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>> }
      saving_goals: { Row: SavingGoal; Insert: Omit<SavingGoal, 'id' | 'created_at'>; Update: Partial<Omit<SavingGoal, 'id' | 'user_id' | 'created_at'>> }
      wishlist: { Row: WishlistItem; Insert: Omit<WishlistItem, 'id' | 'created_at'>; Update: Partial<Omit<WishlistItem, 'id' | 'user_id' | 'created_at'>> }
    }
  }
}
