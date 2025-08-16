#!/bin/bash
echo "🚀 推送到 GitHub 仓库..."
echo "仓库地址: https://github.com/meifang45/twitter-monitor-platform.git"
echo "分支: main"
echo ""

# 尝试推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！"
    echo "📍 访问仓库: https://github.com/meifang45/twitter-monitor-platform"
    echo ""
    echo "📊 项目内容已同步:"
    echo "- 完整的源代码"
    echo "- 部署配置文件"
    echo "- 项目文档"
    echo "- 构建脚本"
else
    echo "❌ 推送失败，可能需要认证"
    echo "请手动执行: git push -u origin main"
fi