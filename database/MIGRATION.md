# 資料庫遷移說明

## ⚠️ 重要變更

系統已將會員 ID 從**自動遞增的數字**改為**隨機生成的 8 碼中英混雜字串**。

### 變更內容

- `users.id`: `INT` → `VARCHAR(8)`
- `users.referrer_id`: `INT` → `VARCHAR(8)`
- `prizes.winner_id`: `INT` → `VARCHAR(8)`
- `commissions.user_id`: `INT` → `VARCHAR(8)`
- `commissions.winner_id`: `INT` → `VARCHAR(8)`

## 🔄 如何重新設置資料庫

### 方法一：刪除舊表並重建（適用於測試環境）

1. 登入 Supabase Dashboard
2. 前往 **SQL Editor**
3. 執行以下 SQL（**會刪除所有資料**）：

```sql
-- 刪除所有現有資料表
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS commission_rules CASCADE;

-- 重新執行 schema.sql 的內容
-- 複製 schema.sql 的完整內容並執行
```

4. 然後複製 `database/schema.sql` 的完整內容並執行

### 方法二：遷移現有資料（適用於生產環境）

如果您有需要保留的現有資料，請執行以下遷移 SQL：

```sql
-- Step 1: 備份現有資料
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE prizes_backup AS SELECT * FROM prizes;
CREATE TABLE commissions_backup AS SELECT * FROM commissions;

-- Step 2: 刪除外鍵約束
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referrer_id_fkey;
ALTER TABLE prizes DROP CONSTRAINT IF EXISTS prizes_winner_id_fkey;
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_user_id_fkey;
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_winner_id_fkey;

-- Step 3: 修改欄位類型
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(8);
ALTER TABLE users ALTER COLUMN referrer_id TYPE VARCHAR(8);
ALTER TABLE prizes ALTER COLUMN winner_id TYPE VARCHAR(8);
ALTER TABLE commissions ALTER COLUMN user_id TYPE VARCHAR(8);
ALTER TABLE commissions ALTER COLUMN winner_id TYPE VARCHAR(8);

-- Step 4: 重新建立外鍵約束
ALTER TABLE users 
  ADD CONSTRAINT users_referrer_id_fkey 
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE prizes 
  ADD CONSTRAINT prizes_winner_id_fkey 
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE commissions 
  ADD CONSTRAINT commissions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE commissions 
  ADD CONSTRAINT commissions_winner_id_fkey 
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE;
```

**注意**：方法二可能會因為資料格式不符而失敗（數字無法直接轉換為 8 碼字串格式）。建議在測試環境使用方法一。

## 🎯 新功能說明

### 會員 ID 生成

- **格式**：8 碼中英混雜（例如：`aB3xZ9mK`）
- **字符集**：大小寫英文字母 + 數字（A-Z, a-z, 0-9）
- **唯一性**：系統自動檢查並確保不重複
- **生成時機**：註冊新會員時自動生成

### CRUD 功能

後台管理系統現已完整支援：

- ✅ **Create**：新增會員（自動生成 8 碼 ID）
- ✅ **Read**：查看所有會員列表
- ✅ **Update**：編輯會員名稱和推薦人
- ✅ **Delete**：刪除會員（級聯刪除相關資料）

## 📝 使用範例

### API 請求範例

註冊新會員：
```json
POST /api/users
{
  "name": "張三",
  "referrer_id": "aB3xZ9mK"  // 可選，8碼字串
}
```

回應：
```json
{
  "user": {
    "id": "kL9mN2pQ",  // 自動生成的 8 碼 ID
    "name": "張三",
    "referrer_id": "aB3xZ9mK",
    "created_at": "2025-11-10T..."
  },
  "message": "User created successfully"
}
```

登記中獎：
```json
POST /api/prizes
{
  "winner_id": "kL9mN2pQ",  // 8碼會員ID
  "prize_name": "組合A"
}
```

## ⚡ 測試步驟

1. 重新設置資料庫（使用上述方法一）
2. 啟動開發伺服器：`npm run dev`
3. 前往前台註冊新會員，查看生成的 8 碼 ID
4. 前往後台測試 CRUD 功能
5. 登記中獎，驗證分潤功能

## 🐛 可能的問題

### 問題：舊的數字 ID 無法使用

**原因**：資料庫已改用字串格式
**解決**：需要使用新的 8 碼 ID 格式

### 問題：前台顯示錯誤

**原因**：可能資料庫還沒更新
**解決**：確認 Supabase 資料表結構已更新

### 問題：隨機 ID 重複

**原因**：極低機率事件（62^8 種組合）
**解決**：系統會自動重試生成，最多 10 次
