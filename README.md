# Luxue

基于 Refly 的本地部署版本，提供强大的 AI 协作和知识管理功能。

## 功能特点

- AI 辅助创作和编辑
- 知识库管理
- 实时协作
- 多模型支持
- 本地部署，数据安全

## 快速开始

### 前提条件

- Node.js v20.x (LTS)
- Docker 和 Docker Compose
- pnpm 8.15.8 或更高版本

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/aijiang4/luxue.git
   cd luxue
   ```

2. 启动中间件服务
   ```bash
   cd deploy/docker
   docker-compose -f docker-compose.middleware.yml up -d
   ```

3. 安装依赖
   ```bash
   pnpm install
   ```

4. 设置环境变量
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```
   
5. 启动开发服务器
   ```bash
   pnpm dev
   ```

## 许可证

MIT
