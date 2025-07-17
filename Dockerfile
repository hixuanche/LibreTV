FROM node:lts-alpine

LABEL maintainer="LibreTV Team"
LABEL description="LibreTV - 免費在線視頻搜索與觀看平台"

# 設置環境變量
ENV PORT=8080
ENV CORS_ORIGIN=*
ENV DEBUG=false
ENV REQUEST_TIMEOUT=5000
ENV MAX_RETRIES=2
ENV CACHE_MAX_AGE=1d

# 設置工作目錄
WORKDIR /app

# 覆制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 覆制應用文件
COPY . .

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 啟動應用
CMD ["npm", "start"]
