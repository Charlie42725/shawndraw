-- 🧩 會員主表 — users
-- 記錄會員名稱與推薦人（上線）
CREATE TABLE users (
  id VARCHAR(8) PRIMARY KEY,          -- 使用者ID（8碼中英混雜）
  name VARCHAR(100) UNIQUE NOT NULL,  -- 會員名稱（唯一）
  referrer_id VARCHAR(8) NULL,        -- 推薦人ID（上層會員）
  created_at TIMESTAMP DEFAULT NOW(), -- 建立時間
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 🎁 獎項表 — prizes
-- 記錄中獎紀錄（組合A 或 組合B）
CREATE TABLE prizes (
  id SERIAL PRIMARY KEY,
  winner_id VARCHAR(8) NOT NULL,      -- 中獎者ID
  prize_name VARCHAR(50) NOT NULL,    -- 獎項名稱（組合A 或 組合B）
  created_at TIMESTAMP DEFAULT NOW(), -- 中獎時間
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 💰 分潤紀錄表 — commissions
-- 記錄每一筆分潤：誰賺錢、來源是哪個中獎事件、哪一代、金額
CREATE TABLE commissions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(8) NOT NULL,        -- 收入者（上線）
  prize_id INT NOT NULL,              -- 來自哪個中獎紀錄
  winner_id VARCHAR(8) NOT NULL,      -- 中獎者（觸發分潤的下線）
  level INT NOT NULL,                 -- 第幾代 (1, 2, 3)
  amount INT NOT NULL,                -- 分潤金額 (150, 100, 50)
  created_at TIMESTAMP DEFAULT NOW(), -- 建立時間
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ⚙️ 分潤設定表 — commission_rules
-- 方便以後要改分潤比例或擴充第 4、5 代
CREATE TABLE commission_rules (
  id SERIAL PRIMARY KEY,
  level INT UNIQUE NOT NULL,   -- 代數 (1, 2, 3)
  amount INT NOT NULL          -- 該代金額
);

-- 預設分潤制度
INSERT INTO commission_rules (level, amount)
VALUES (1, 150), (2, 100), (3, 50);

-- 建立索引以提升查詢效能
CREATE INDEX idx_users_referrer ON users(referrer_id);
CREATE INDEX idx_prizes_winner ON prizes(winner_id);
CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_prize ON commissions(prize_id);
CREATE INDEX idx_commissions_winner ON commissions(winner_id);
