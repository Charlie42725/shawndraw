# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個基於 Next.js 16 (App Router) 和 Supabase 的**三級推薦分潤系統**（Multi-Level Marketing）。當會員中獎時，系統會自動追溯上三代推薦人並建立分潤紀錄。

核心業務邏輯：
- 會員註冊時可選擇推薦人（建立上下線關係）
- 會員中獎時（組合A 或 組合B）觸發分潤計算
- 自動追溯三級上線：第一代 NT$ 150、第二代 NT$ 100、第三代 NT$ 50
- 會員 ID 使用 8 碼中英混雜字串（由 `lib/utils.ts` 生成）

## 開發指令

```bash
# 開發模式（在 localhost:3000）
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 程式碼檢查
npm run lint
```

## 資料庫架構

使用 Supabase (PostgreSQL)，包含四個核心表格：

1. **users** - 會員主表
   - `id` (VARCHAR(8), PK): 8碼會員ID
   - `name` (VARCHAR, UNIQUE): 會員名稱
   - `referrer_id` (VARCHAR(8), FK): 推薦人ID（上線）
   - 自我參照外鍵：referrer_id → users(id)

2. **prizes** - 中獎紀錄表
   - `id` (SERIAL, PK): 中獎紀錄ID
   - `winner_id` (VARCHAR(8), FK): 中獎者ID
   - `prize_name` (VARCHAR): 獎項名稱（組合A 或 組合B）

3. **commissions** - 分潤紀錄表
   - `user_id` (VARCHAR(8), FK): 收入者（上線）
   - `prize_id` (INT, FK): 來自哪個中獎紀錄
   - `winner_id` (VARCHAR(8), FK): 中獎者（觸發分潤的下線）
   - `level` (INT): 第幾代 (1, 2, 3)
   - `amount` (INT): 分潤金額

4. **commission_rules** - 分潤設定表
   - `level` (INT, UNIQUE): 代數
   - `amount` (INT): 該代金額
   - 預設值：(1, 150), (2, 100), (3, 50)

資料庫 schema 位於 `database/schema.sql`。

## 核心邏輯說明

### 分潤計算流程（app/api/prizes/route.ts）

當 POST `/api/prizes` 被呼叫時（會員中獎）：
1. 驗證中獎者存在
2. 建立中獎紀錄（prizes 表）
3. **核心分潤邏輯**：
   - 從中獎者的 `referrer_id` 開始
   - 使用迴圈追溯上三代（`for (let level = 1; level <= 3 && currentReferrerId; level++)`）
   - 每一代都查詢 `commission_rules` 表取得分潤金額
   - 插入 commission 記錄（包含 user_id, prize_id, winner_id, level, amount）
   - 更新 `currentReferrerId` 為當前上線的 `referrer_id`，繼續向上追溯
   - 如果某一代沒有上線則停止

### 會員 ID 生成（lib/utils.ts）

- `generateUserId()`: 生成隨機 8 碼（A-Z, a-z, 0-9）
- `generateUniqueUserId(supabase)`: 確保生成的 ID 唯一（最多重試 10 次）
- 在 POST `/api/users` 時呼叫

### API 路由結構

```
app/api/
├── users/
│   ├── route.ts              # GET 所有會員, POST 註冊新會員
│   └── [id]/
│       ├── route.ts          # GET 特定會員詳情
│       ├── commissions/route.ts  # GET 會員的分潤紀錄
│       └── downline/route.ts     # GET 會員的三代下線
├── prizes/
│   └── route.ts              # GET 所有中獎紀錄, POST 中獎登記（觸發分潤）
└── admin/
    ├── stats/route.ts        # GET 統計資訊（總會員、總分潤等）
    └── commissions/route.ts  # GET 所有分潤紀錄
```

## 型別定義（lib/types.ts）

所有資料庫表格都有對應的 TypeScript 介面：
- `User`, `Prize`, `Commission`, `CommissionRule`
- 擴展型別：`UserWithStats`, `CommissionWithNames`, `DownlineUser`
- Request 型別：`CreateUserRequest`, `CreatePrizeRequest`

## 重要注意事項

1. **Supabase 連線**：客戶端設定在 `lib/db.ts`，使用環境變數或預設值
2. **無身份驗證**：目前系統沒有登入機制，所有 API 都是公開的
3. **無權限控制**：後台管理（`/admin`）沒有權限驗證
4. **分潤觸發點**：分潤不是在會員註冊時觸發，而是在中獎時觸發（POST `/api/prizes`）
5. **會員名稱唯一性**：name 欄位有 UNIQUE 約束，重複註冊會回傳 409 錯誤

## 資料庫遷移

專案包含 `database/MIGRATION.md` 記錄資料庫結構變更。如需修改 schema：
1. 先更新 `database/schema.sql`
2. 記錄遷移步驟到 `MIGRATION.md`
3. 在 Supabase Dashboard 的 SQL Editor 執行遷移 SQL

## 前端頁面結構

- `app/page.tsx`: 首頁（會員註冊表單）
- `app/dashboard/[id]/page.tsx`: 會員儀表板（顯示分潤收入、下線名單）
- `app/admin/page.tsx`: 後台管理（系統統計、會員管理）
- `app/IDGK/page.tsx`: ID 查詢工具頁面

使用 Tailwind CSS 4 進行樣式設計。
