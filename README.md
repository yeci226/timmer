# Timmer - 個人時間軸管理系統

一個自用的時間軸網頁應用，具有深色主題和螢光色系設計。

![Timmer 界面展示](/public/p1.png)

## 功能特色

- 📅 **智能時間軸**：雙時間軸設計，過去事件和當前/未來事件分離顯示
- ⏱️ **當前時間指示器**：實時顯示當前時間位置
- 📝 **事件管理**：添加、編輯、刪除、排序事件
- 🎯 **預設模板系統**：可重複使用的預設事件模板
- 🔄 **自動重複事件**：支持按小時、天、週、月重複的事件
- 🎨 **自訂顏色系統**：支持預設顏色和自訂顏色選擇
- 📊 **事件狀態顯示**：進行中事件高亮顯示
- 🔐 **Google 登錄**：使用 Firebase Authentication 進行用戶認證
- ☁️ **雲端同步**：登錄後數據自動同步到 Firebase Firestore
- 📱 **多設備同步**：可在不同設備間同步數據
- 💾 **本地存儲**：離線時數據保存在瀏覽器本地
- 📱 **響應式設計**：支持桌面和移動設備
- 🗑️ **自動清理**：自動清理過期 14 天的事件

## 技術棧

- **Next.js 14** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Firebase** - 認證、數據庫和分析
- **date-fns** - 日期處理
- **Lucide React** - 圖標庫

## 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 設置 Firebase（詳見 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)）：
   - 創建 Firebase 項目
   - 啟用 Authentication、Firestore 和 Analytics
   - 在專案根目錄建立 `.env.local`，內容如下：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=你的API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL=你的DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=你的APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=你的MEASUREMENT_ID
```

3. 啟動開發服務器：
```bash
npm run dev
```

4. 打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

5. 測試 Firebase 配置：訪問 [http://localhost:3000/test-firebase](http://localhost:3000/test-firebase)

## 部署到 Firebase Hosting

1. 安裝 Firebase CLI：
```bash
npm install -g firebase-tools
```

2. 登錄 Firebase：
```bash
firebase login
```

3. 部署到 Firebase Hosting：
```bash
npm run deploy
```

## 使用說明

### 基本功能
1. **添加事件**：點擊「展開」按鈕，填寫事件信息
2. **必填欄位**：日期、時間（24小時制）、標題
3. **可選欄位**：結束時間、描述、顏色
4. **排序**：事件按日期時間自動排序（最新的在前）
5. **編輯/刪除**：點擊事件右上角的編輯或刪除按鈕

### 預設模板
1. **創建模板**：在設置中展開「自訂預設事件模板」
2. **設置重複**：選擇重複類型（小時/天/週/月）和間隔
3. **顯示控制**：選擇是否在時間軸上顯示模板事件
4. **編輯模板**：點擊時間軸中預設事件的編輯按鈕

### 時間軸特性
- **雙時間軸**：過去事件顯示在左側（縮小、半透明）
- **當前時間**：綠色指示器顯示當前時間位置
- **進行中事件**：正在進行的事件會顯示綠色邊框和「進行中」標籤
- **自動清理**：過期 14 天的事件會自動刪除

### 雲端同步
- **Google 登錄**：點擊左上角的登錄按鈕使用 Google 賬戶登錄
- **自動同步**：登錄後，所有數據會自動同步到雲端
- **智能同步控制**：同步成功後顯示"已同步至最新！"，一分鐘內防止重複操作
- **多設備同步**：在不同設備上登錄相同賬戶可訪問相同數據
- **離線支持**：離線時數據保存在本地，聯網後自動同步
- **同步狀態**：左下角顯示同步狀態和最後同步時間

### 顏色系統
- **預設顏色**：藍色、綠色、紫色、橙色、紅色、粉色、黃色
- **自訂顏色**：點擊「自訂」可選擇任意顏色
- **顏色一致性**：相同顏色的事件在時間軸上保持一致的視覺效果

## 項目結構

```
timmer/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── version/       # 版本 API
│   │   └── github/        # GitHub API
│   ├── test-firebase/     # Firebase 測試頁面
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根佈局
│   └── page.tsx           # 主頁面
├── components/            # React 組件
│   ├── AddEventForm.tsx   # 添加/編輯事件表單
│   ├── LoginButton.tsx    # 登錄按鈕
│   ├── PresetTemplateManager.tsx # 預設模板管理
│   ├── SyncStatus.tsx     # 同步狀態指示器
│   └── TimelineItem.tsx   # 時間軸項目
├── contexts/              # React Context
│   └── AuthContext.tsx    # 認證上下文
├── lib/                   # 工具庫
│   └── firebase.ts        # Firebase 配置
├── types/                 # TypeScript 類型定義
│   └── timeline.ts        # 時間軸相關類型
├── package.json           # 項目依賴
├── tailwind.config.js     # Tailwind 配置
├── FIREBASE_SETUP.md      # Firebase 設置指南
└── vercel.json           # Vercel 部署配置
```

## 主要功能詳解

### 時間軸顯示
- **過去事件**：顯示在左側，縮小 75%，半透明效果
- **當前/未來事件**：顯示在右側，正常大小
- **當前時間指示器**：綠色圓點，顯示當前時間位置
- **進行中事件**：綠色邊框，顯示「進行中」標籤

### 預設模板系統
- **重複類型**：支持按小時、天、週、月重複
- **間隔設置**：可設置重複間隔（如每 2 天、每 3 週等）
- **顯示控制**：可選擇是否在時間軸上顯示模板事件
- **自動生成**：模板事件會根據設置自動生成到時間軸

### 顏色管理
- **預設顏色**：7 種預設顏色供選擇
- **自訂顏色**：支持選擇任意十六進制顏色
- **顏色選擇器**：點擊自訂顏色會打開系統顏色選擇器

### GitHub 整合
- **Commit 記錄**：顯示最近 5 條 commit
- **版本信息**：動態讀取 package.json 版本號
- **直接鏈接**：可點擊跳轉到 GitHub 查看詳細信息

### 同步功能詳解
- **即時反饋**：同步成功立即顯示綠色成功狀態和"已同步至最新！"提示
- **防重複操作**：同步成功後一分鐘內按鈕保持禁用狀態，防止頻繁請求
- **狀態管理**：自動處理同步中、成功、失敗等不同狀態的視覺反饋
- **離線檢測**：實時監控網絡狀態，離線時顯示相應提示

## 自定義

- 修改 `tailwind.config.js` 中的顏色配置
- 調整 `app/globals.css` 中的樣式
- 在 `components/` 中添加新組件
- 修改 `app/api/` 中的 API 路由
- 調整 `lib/firebase.ts` 中的 Firebase 配置

## 許可證

MIT License 
