# LibreTV - 免費在線視頻搜索與觀看平台

<div align="center">
  <img src="image/logo.png" alt="LibreTV Logo" width="120">
  <br>
  <p><strong>自由觀影，暢享精彩</strong></p>
</div>

## 📺 項目簡介

LibreTV 是一個輕量級、免費的在線視頻搜索與觀看平台，提供來自多個視頻源的內容搜索與播放服務。無需注冊，即開即用，支持多種設備訪問。項目結合了前端技術和後端代理功能，可部署在支持服務端功能的各類網站托管服務上。**項目門戶**： [libretv.is-an.org](https://libretv.is-an.org)

本項目基於 [bestK/tv](https://github.com/bestK/tv) 進行重構與增強。

<details>
  <summary>點擊查看項目截圖</summary>
  <img src="https://github.com/user-attachments/assets/df485345-e83b-4564-adf7-0680be92d3c7" alt="項目截圖" style="max-width:600px">
</details>

## 🥇 感謝讚助

- **[YXVM](https://yxvm.com)**  
- **[ZMTO/VTEXS](https://zmto.com)**

## 🚀 快速部署

選擇以下任一平台，點擊一鍵部署按鈕，即可快速創建自己的 LibreTV 實例：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLibreSpark%2FLibreTV)  
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LibreSpark/LibreTV)  
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/LibreSpark/LibreTV)
[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https://github.com/LibreSpark/LibreTV)

## ⚠️ 安全與隱私提醒

### 🔒 強烈建議設置密碼保護

為了您的安全和避免潛在的法律風險，我們**強烈建議**在部署時設置密碼保護：

- **避免公開訪問**：不設置密碼的實例任何人都可以訪問，可能被惡意利用
- **防範版權風險**：公開的視頻搜索服務可能面臨版權方的投訴舉報
- **保護個人隱私**：設置密碼可以限制訪問範圍，保護您的使用記錄

### 📝 部署建議

1. **設置環境變量 `PASSWORD`**：為您的實例設置一個強密碼
2. **僅供個人使用**：請勿將您的實例鏈接公開分享或傳播
3. **遵守當地法律**：請確保您的使用行為符合當地法律法規

### 🚨 重要聲明

- 本項目僅供學習和個人使用
- 請勿將部署的實例用於商業用途或公開服務
- 如因公開分享導致的任何法律問題，用戶需自行承擔責任
- 項目開發者不對用戶的使用行為承擔任何法律責任

## ⚠️ 請勿使用 Pull Bot 自動同步

Pull Bot 會反覆觸發無效的 PR 和垃圾郵件，嚴重幹擾項目維護。作者可能會直接拉黑所有 Pull Bot 自動發起的同步請求的倉庫所有者。

**推薦做法：**

建議在 fork 的倉庫中啟用本倉庫自帶的 GitHub Actions 自動同步功能（見 `.github/workflows/sync.yml`）。 

如需手動同步主倉庫更新，也可以使用 GitHub 官方的 [Sync fork](https://docs.github.com/cn/github/collaborating-with-issues-and-pull-requests/syncing-a-fork) 功能。


## 📋 詳細部署指南

### Cloudflare Pages

1. Fork 或克隆本倉庫到您的 GitHub 賬戶
2. 登錄 [Cloudflare Dashboard](https://dash.cloudflare.com/)，進入 Pages 服務
3. 點擊"創建項目"，連接您的 GitHub 倉庫
4. 使用以下設置：
   - 構建命令：留空（無需構建）
   - 輸出目錄：留空（默認為根目錄）
5. **⚠️ 重要：在"設置" > "環境變量"中添加 `PASSWORD` 變量**
6. **可選：在"Settings" > "Environment Variables"中添加 `ADMINPASSWORD` 變量**
7. 點擊"保存並部署"

### Vercel

1. Fork 或克隆本倉庫到您的 GitHub/GitLab 賬戶
2. 登錄 [Vercel](https://vercel.com/)，點擊"New Project"
3. 導入您的倉庫，使用默認設置
4. **⚠️ 重要：在"Settings" > "Environment Variables"中添加 `PASSWORD` 變量**
5. **可選：在"Settings" > "Environment Variables"中添加 `ADMINPASSWORD` 變量**
6. 點擊"Deploy"
7. 可選：在"Settings" > "Environment Variables"中配置密碼保護和設置按鈕密碼保護

### Render

1. Fork 或克隆本倉庫到您的 GitHub 賬戶
2. 登錄 [Render](https://render.com/)，點擊 "New Web Service"
3. 選擇您的倉庫，Render 會自動檢測到 `render.yaml` 配置文件
4. 保持默認設置（無需設置環境變量，默認不啟用密碼保護）
5. 點擊 "Create Web Service"，等待部署完成
6. 部署成功後即可訪問您的 LibreTV 實例

> 如需啟用密碼保護，可在 Render 控制台的環境變量中手動添加 `PASSWORD` 和/或 `ADMINPASSWORD`。

### Docker
```
docker run -d \
  --name libretv \
  --restart unless-stopped \
  -p 8899:8080 \
  -e PASSWORD=your_password \
  -e ADMINPASSWORD=your_adminpassword \
  bestzwei/libretv:latest
```

### Docker Compose

`docker-compose.yml` 文件：

```yaml
services:
  libretv:
    image: bestzwei/libretv:latest
    container_name: libretv
    ports:
      - "8899:8080" # 將內部 8080 端口映射到主機的 8899 端口
    environment:
      - PASSWORD=${PASSWORD:-your_password} # 可將 your_password 修改為你想要的密碼，默認為 your_password
      - ADMINPASSWORD=${PASSWORD:-your_adminpassword} # 可將 your_adminpassword 修改為你想要的密碼，默認為 your_adminpassword
    restart: unless-stopped
```
啟動 LibreTV：

```bash
docker compose up -d
```
訪問 `http://localhost:8899` 即可使用。

### 本地開發環境

項目包含後端代理功能，需要支持服務器端功能的環境：

```bash
# 首先，通過覆制示例來設置 .env 文件（可選）
cp .env.example .env

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

訪問 `http://localhost:8080` 即可使用（端口可在.env文件中通過PORT變量修改）。

> ⚠️ 注意：使用簡單靜態服務器（如 `python -m http.server` 或 `npx http-server`）時，視頻代理功能將不可用，視頻無法正常播放。完整功能測試請使用 Node.js 開發服務器。

## 🔧 自定義配置

### 密碼保護

要為您的 LibreTV 實例添加密碼保護，可以在部署平台上設置環境變量：

**環境變量名**: `PASSWORD` 
**值**: 您想設置的密碼

**環境變量名**: `ADMINPASSWORD` 
**值**: 您想設置的密碼

各平台設置方法：

- **Cloudflare Pages**: Dashboard > 您的項目 > 設置 > 環境變量
- **Vercel**: Dashboard > 您的項目 > Settings > Environment Variables
- **Netlify**: Dashboard > 您的項目 > Site settings > Build & deploy > Environment
- **Docker**: 修改 `docker run` 中 `your_password` 為你的密碼
- **Docker Compose**: 修改 `docker-compose.yml` 中的 `your_password` 為你的密碼
- **本地開發**: SET PASSWORD=your_password

### API兼容性

LibreTV 支持標準的蘋果 CMS V10 API 格式。添加自定義 API 時需遵循以下格式：
- 搜索接口: `https://example.com/api.php/provide/vod/?ac=videolist&wd=關鍵詞`
- 詳情接口: `https://example.com/api.php/provide/vod/?ac=detail&ids=視頻ID`

**添加 CMS 源**:
1. 在設置面板中選擇"自定義接口"
2. 接口地址: `https://example.com/api.php/provide/vod`

## ⌨️ 鍵盤快捷鍵

播放器支持以下鍵盤快捷鍵：

- **空格鍵**: 播放/暫停
- **左右箭頭**: 快退/快進
- **上下箭頭**: 音量增加/減小
- **M 鍵**: 靜音/取消靜音
- **F 鍵**: 全屏/退出全屏
- **Esc 鍵**: 退出全屏

## 🛠️ 技術棧

- HTML5 + CSS3 + JavaScript (ES6+)
- Tailwind CSS
- HLS.js 用於 HLS 流處理
- DPlayer 視頻播放器核心
- Cloudflare/Vercel/Netlify Serverless Functions
- 服務端 HLS 代理和處理技術
- localStorage 本地存儲

## ⚠️ 免責聲明

LibreTV 僅作為視頻搜索工具，不存儲、上傳或分發任何視頻內容。所有視頻均來自第三方 API 接口提供的搜索結果。如有侵權內容，請聯系相應的內容提供方。

本項目開發者不對使用本項目產生的任何後果負責。使用本項目時，您必須遵守當地的法律法規。

## 🎉 貢獻者福利

活躍貢獻者可以在 [Issue #268](https://github.com/LibreSpark/LibreTV/issues/268) 中留言，申請免費上車 1Password Team，享受團隊協作工具的便利！

## 💝 支持項目

如果您想支持本項目，可以考慮進行捐款：

[![捐贈](https://img.shields.io/badge/愛心捐贈-無國界醫生-1a85ff?style=for-the-badge&logo=medical-cross)](https://www.msf.hk/zh-hant/donate/general?type=one-off)
