# Timmer - 個人時間軸管理系統

一個自用的時間軸網頁應用，具有深色主題和螢光色系設計。

## 功能特色

- 🎨 **深色主題 + 螢光色系**：現代化的視覺設計
- 📅 **日期時間選擇**：支持 24 小時制時間選擇
- ⏱️ **持續時間**：可選的持續時間記錄
- 📝 **事件管理**：添加、刪除、排序事件
- 💾 **本地存儲**：數據保存在瀏覽器本地
- 📊 **統計信息**：事件統計和概覽
- 📱 **響應式設計**：支持桌面和移動設備

## 技術棧

- **Next.js 14** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **date-fns** - 日期處理
- **Lucide React** - 圖標庫

## 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 啟動開發服務器：
```bash
npm run dev
```

3. 打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

1. 將代碼推送到 GitHub
2. 在 Vercel 中導入項目
3. 自動部署完成

## 使用說明

1. **添加事件**：點擊「展開」按鈕，填寫事件信息
2. **必填欄位**：日期、時間（24小時制）、標題
3. **可選欄位**：持續時間、描述
4. **排序**：事件按日期時間自動排序（最新的在前）
5. **刪除**：點擊事件右上角的刪除按鈕

## 項目結構

```
timmer/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根佈局
│   └── page.tsx           # 主頁面
├── components/            # React 組件
│   ├── AddEventForm.tsx   # 添加事件表單
│   └── TimelineItem.tsx   # 時間軸項目
├── types/                 # TypeScript 類型定義
│   └── timeline.ts        # 時間軸相關類型
├── package.json           # 項目依賴
├── tailwind.config.js     # Tailwind 配置
└── vercel.json           # Vercel 部署配置
```

## 自定義

- 修改 `tailwind.config.js` 中的顏色配置
- 調整 `app/globals.css` 中的樣式
- 在 `components/` 中添加新組件

## 許可證

MIT License 