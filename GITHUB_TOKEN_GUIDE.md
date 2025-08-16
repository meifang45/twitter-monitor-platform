# 🔑 GitHub Personal Access Token 设置指南

## 问题说明
GitHub已停止支持密码认证，必须使用Personal Access Token (PAT)。

## 🚀 解决步骤

### 步骤1: 创建Personal Access Token
1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置Token名称：`Twitter Monitor Platform`
4. 选择过期时间：建议选择 **"No expiration"** 或 **"90 days"**
5. 勾选权限：
   - ✅ **repo** (完整仓库访问权限)
   - ✅ **workflow** (如果需要GitHub Actions)
6. 点击 **"Generate token"**
7. **重要**: 立即复制Token（只显示一次）

### 步骤2: 使用Token推送
再次执行推送命令：
```bash
git push -u origin main
```

当提示输入认证信息时：
- **Username**: `meifang45`
- **Password**: **粘贴你刚才复制的Token**（不是GitHub密码）

## 🔄 替代方案

### 方案A: 更新远程URL（一次性设置）
```bash
git remote set-url origin https://你的TOKEN@github.com/meifang45/twitter-monitor-platform.git
git push -u origin main
```

### 方案B: 使用SSH（如果已配置SSH密钥）
```bash
git remote set-url origin git@github.com:meifang45/twitter-monitor-platform.git
git push -u origin main
```

### 方案C: 直接在浏览器上传
1. 打开：https://github.com/meifang45/twitter-monitor-platform
2. 点击 **"uploading an existing file"**
3. 拖拽整个项目文件夹上传

## 🎯 推荐步骤
1. 创建Personal Access Token（步骤1）
2. 复制Token
3. 执行 `git push -u origin main`
4. 输入用户名和Token

---

**请先去创建Personal Access Token，然后告诉我结果！** 🚀