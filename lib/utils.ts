/**
 * 生成隨機 8 碼會員 ID（中英混雜）
 * 格式：大小寫英文字母 + 數字
 */
export function generateUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * 檢查用戶 ID 是否已存在（需要傳入 Supabase 客戶端）
 */
export async function isUserIdExists(id: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();
  
  return !!data && !error;
}

/**
 * 生成唯一的用戶 ID（確保不重複）
 */
export async function generateUniqueUserId(supabase: any): Promise<string> {
  let userId = generateUserId();
  let attempts = 0;
  const maxAttempts = 10;
  
  // 最多嘗試 10 次，避免無限迴圈
  while (await isUserIdExists(userId, supabase) && attempts < maxAttempts) {
    userId = generateUserId();
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('無法生成唯一的用戶 ID');
  }
  
  return userId;
}
