// Database Types
export interface User {
  id: string;  // 改為 8 碼中英混雜字串
  name: string;
  referrer_id: string | null;
  created_at: string;
}

export interface Prize {
  id: number;
  winner_id: string;
  prize_name: string;
  created_at: string;
}

export interface Commission {
  id: number;
  user_id: string;
  prize_id: number;
  winner_id: string;
  level: number;
  amount: number;
  created_at: string;
}

export interface CommissionRule {
  id: number;
  level: number;
  amount: number;
}

// API Response Types
export interface UserWithStats extends User {
  total_commission?: number;
  downline_count?: number;
  prize_count?: number;
  referrer_name?: string;
}

export interface PrizeWithWinner extends Prize {
  winner_name?: string;
}

export interface CommissionWithNames extends Commission {
  winner_name?: string;
  user_name?: string;
  prize_name?: string;
}

export interface DownlineUser {
  id: string;
  name: string;
  level: number;
  created_at: string;
}

// API Request Types
export interface CreateUserRequest {
  name: string;
  referrer_id?: string;
}

export interface CreatePrizeRequest {
  winner_id: string;
  prize_name: '組合A' | '組合B';
}
