# PROJECT WARRIOR - Professional AI Project Portfolio

這是一個極致華麗、高交互性的 AI 項目集錦平台，採用 **Next.js 15** 與 **Vibe Coding** 指令式開發範式打造。本專案整合了多個尖端 AI 應用模組，並透過直觀的「儀表板」模式提供精品級的用戶體驗。

---

## 🌟 核心特色 (Core Features)

- **💎 極致視覺美學**：融合深色模式、玻璃擬態 (Glassmorphism) 與動態霓虹光感，打造精品級 UI。
- **⚡ 高效模組整合**：透過 iframe 與 `postMessage` 機制，無縫集成多個獨立開發的 Vite/React 項目。
- **🤖 多模態 AI 支援**：整合 Google Gemini 1.5/2.0 全系列模型，涵蓋文字、語音與影像處理。
- **🛠 靈活 API 管理**：支援全局環境變數與前端即時 API Key 同步機制。

---

## 🚀 內置 AI 模組 (Active Demos)

### 1. 📄 Markdown PDF Studio
- **描述**：高效率的 Markdown 文件處理中心。支援 AI 自動修辭美化、即時 A4 預覽，並可一鍵生成高解析度 PDF 與可編輯 Word 檔案。
- **技術**：Vite, Gemini API, `html2pdf.js`, `docx` library.

### 2. 🎙 AI 語音轉文字助手 (Speech-to-Text)
- **描述**：專業級錄音與轉錄工具。支援即時錄音上傳，能精準生成的帶有時間戳的結構化文本，並支援多格式導出。
- **技術**：Web Audio API, Gemini 1.5 Flash.

### 3. 🎬 YouTube 影片摘要助手 (Video Intelligence)
- **描述**：輸入 YouTube 網址，AI 會自動掃描影片內容並生成結構化摘要與重點時間軸，大幅提升資訊獲取效率。
- **技術**：Gemini 2.0 Flash (Multimodal capabilities).

### 4. 🕹 Neon Tetris Elite (Gaming Demo)
- **描述**：懷舊與科技的完美融合。具備精美霓虹特效的高性能俄羅斯方塊，展示 Web GL 與流暢動畫的結合。
- **技術**：Vite, Canvas API, Retro Aesthetics.

### 5. ☕ L'ÉLÉGANCE CAFÉ (Luxury Commerce)
- **描述**：精品電商設計範例。展示了如何利用極簡美學與流暢交互打造出令人心動的高級購物體驗。
- **技術**：Premium CSS, Responsive Design.

---

## 🛠 技術棧 (Tech Stack)

- **Framework**: Next.js 15 (App Router), React 19
- **Animation**: Motion (formerly Framer Motion)
- **Styling**: TailwindCSS, Vanilla CSS, Lucide icons
- **AI Core**: Google Generative AI SDK (Gemini)
- **Tools**: Vite, html2pdf.js, docx.js, Firebase Hosting

---

## 📦 快速部署 (Deployment)

1. **複製範本**：
   ```bash
   cp .env.example .env
   ```
2. **填寫 API Key**：
   在 `.env` 中填入您的 `NEXT_PUBLIC_GEMINI_API_KEY`。
3. **推送到 Git**：
   本項目已預設優化 `.gitignore`，確保排除大型編譯源碼（如 `scratch/`），保持倉庫輕量。
4. **Firebase / Vercel**：
   支援一鍵部署到主流雲端平台。

---

Powered by **WarriorHub Engine** | **Vibe Coding Enabled**
