# 貢獻指南

感謝您對 LibreTV 項目的關注！我們歡迎所有形式的貢獻，包括但不限於代碼提交、問題報告、功能建議、文檔改進等。

## 🚀 快速開始

### 開發環境要求

- Node.js 16.0 或更高版本
- Git
- 支持 ES6 的現代瀏覽器

### 本地開發設置

1. **Fork 項目**
   ```bash
   # 通過 GitHub 網頁 Fork 本項目到您的賬戶
   ```

2. **克隆倉庫**
   ```bash
   git clone https://github.com/YOUR_USERNAME/LibreTV.git
   cd LibreTV
   ```

3. **安裝依賴**
   ```bash
   npm install
   ```

4. **配置環境變量**
   ```bash
   cp .env.example .env
   # 根據需要修改 .env 文件中的配置
   ```

5. **啟動開發服務器**
   ```bash
   npm run dev
   ```

6. **訪問應用**
   ```
   打開瀏覽器訪問 http://localhost:8080
   ```

## 🤝 如何貢獻

### 報告問題

如果您發現了 bug 或希望建議新功能：

1. 首先查看 [Issues](https://github.com/LibreSpark/LibreTV/issues) 確保問題尚未被報告
2. 創建新的 Issue，請包含：
   - 清晰的標題和描述
   - 重現步驟（如果是 bug）
   - 預期行為和實際行為
   - 環境信息（瀏覽器、操作系統等）
   - 截圖或錯誤日志（如果適用）

### 提交代碼

1. **創建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

2. **進行開發**
   - 保持代碼風格一致
   - 添加必要的注釋
   - 確保功能正常工作

3. **測試更改**
   ```bash
   # 確保應用正常啟動
   npm run dev
   
   # 測試各項功能
   # - 視頻搜索
   # - 視頻播放
   # - 響應式設計
   # - 各種部署方式
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "類型: 簡潔的提交信息"
   ```

5. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **創建 Pull Request**
   - 在 GitHub 上創建 Pull Request
   - 填寫詳細的 PR 描述
   - 等待代碼審查

### 提交信息格式

請使用以下格式提交代碼：

```
類型: 簡潔的描述

詳細描述（可選）

相關 Issue: #123
```

**提交類型：**
- `feat`: 新功能
- `fix`: 修覆 bug
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `refactor`: 代碼重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

**示例：**
```
feat: 添加自定義播放器控制欄

- 增加播放速度調節功能
- 優化進度條拖拽體驗
- 添加音量記憶功能

相關 Issue: #45
```

## 📋 代碼規範

### JavaScript 規範

- 使用 ES6+ 語法
- 優先使用 `const`，需要重新賦值時使用 `let`
- 使用有意義的變量和函數名
- 函數名使用駝峰命名
- 常量使用大寫字母和下劃線

```javascript
// ✅ 推薦
const API_BASE_URL = 'https://api.example.com';
const searchVideos = async (keyword) => {
    // 函數實現
};

// ❌ 不推薦
var url = 'https://api.example.com';
function search(k) {
    // 函數實現
}
```

### CSS 規範

- 使用 BEM 命名方式或語義化類名
- 優先使用 CSS 變量
- 移動端優先的響應式設計
- 避免使用 `!important`

```css
/* ✅ 推薦 */
.video-player {
    --primary-color: #00ccff;
    background-color: var(--primary-color);
}

.video-player__controls {
    display: flex;
    gap: 1rem;
}

/* ❌ 不推薦 */
.player {
    background-color: #00ccff !important;
}
```

### HTML 規範

- 使用語義化標簽
- 確保可訪問性（添加適當的 aria 屬性）
- 保持良好的縮進格式

```html
<!-- ✅ 推薦 -->
<main class="video-search">
    <section class="search-form" role="search">
        <input type="search" aria-label="搜索視頻" placeholder="輸入關鍵詞">
        <button type="submit" aria-label="搜索">搜索</button>
    </section>
</main>

<!-- ❌ 不推薦 -->
<div class="search">
    <input type="text" placeholder="搜索">
    <div onclick="search()">搜索</div>
</div>
```

## 🎯 貢獻重點領域

我們特別歡迎以下方面的貢獻：

### 核心功能
- **搜索優化**: 改進搜索算法和用戶體驗
- **播放器增強**: 新的播放器功能和控制選項
- **API 集成**: 添加新的視頻源 API 支持
- **性能優化**: 加載速度和播放性能改進

### 用戶體驗
- **界面設計**: UI/UX 改進和現代化
- **響應式設計**: 移動端體驗優化
- **無障礙功能**: 提高可訪問性
- **國際化**: 多語言支持

### 技術架構
- **代碼重構**: 提高代碼質量和可維護性
- **安全性**: 安全漏洞修覆和防護
- **部署優化**: 改進各平台部署流程
- **監控日志**: 添加錯誤監控和日志系統

### 文檔和社區
- **文檔完善**: API 文檔、部署指南等
- **示例項目**: 集成示例和最佳實踐
- **社區建設**: 問題回答和新手指導

## 🔍 代碼審查流程

1. **自動檢查**: PR 會觸發自動化測試
2. **代碼審查**: 維護者會審查代碼質量和功能
3. **反饋修改**: 根據審查意見修改代碼
4. **合並**: 審查通過後合並到主分支

### 審查標準

- **功能完整**: 功能按預期工作
- **代碼質量**: 遵循項目編碼規範
- **性能影響**: 不顯著影響應用性能
- **兼容性**: 與現有功能兼容
- **文檔更新**: 必要時更新相關文檔

## 🚫 注意事項

### 不接受的貢獻

- **侵權內容**: 包含版權爭議的代碼或資源
- **惡意代碼**: 包含病毒、後門或其他惡意功能
- **商業推廣**: 純粹的商業宣傳或廣告
- **不相關功能**: 與項目核心功能無關的特性

### 法律要求

- 確保您的貢獻不侵犯他人版權
- 提交的代碼必須是您原創或有合法使用權
- 同意以項目相同的 MIT 許可證分發您的貢獻

## 📞 聯系方式

如果您有任何問題或需要幫助：

- **GitHub Issues**: [報告問題或建議](https://github.com/LibreSpark/LibreTV/issues)
- **GitHub Discussions**: [參與社區討論](https://github.com/LibreSpark/LibreTV/discussions)
- **Email**: 通過 GitHub 聯系項目維護者

## 🙏 致謝

感謝所有為 LibreTV 項目做出貢獻的開發者！您的每一份貢獻都讓這個項目變得更好。

### 貢獻者列表

我們會在項目 README 中展示所有貢獻者。您的貢獻被合並後，您的 GitHub 頭像將出現在貢獻者列表中。

---

**再次感謝您的貢獻！** 🎉

讓我們一起構建一個更好的 LibreTV！
