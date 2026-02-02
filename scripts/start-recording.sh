#!/bin/bash

###############################################
# 快速启动录屏 - 一键配置并开始
###############################################

echo "🎥 启动录屏准备..."
echo ""

# 1. 打开系统设置的辅助功能（用户需要手动勾选）
echo "📝 第1步：启用放大功能"
echo ""
echo "我将打开系统设置 → 辅助功能 → 缩放"
echo "请手动勾选："
echo "  ☐ 使用键盘快捷键缩放"
echo "  ☐ 缩放样式：选择"画中画""
echo ""
echo "按回车键继续..."
read

open "x-apple.systempreferences:com.apple.preference.universalaccess?Seeing_Zoom"
sleep 3

echo ""
echo "✅ 请确认你已经勾选了上述选项"
echo "按回车键继续..."
read

# 2. 测试放大功能
echo ""
echo "📝 第2步：测试放大功能"
echo ""
echo "现在请测试以下快捷键："
echo "  Option + Command + 8    开关放大"
echo "  Option + Command + =    放大"
echo "  Option + Command + -    缩小"
echo ""
echo "按回车键继续..."
read

# 3. 打开浏览器
echo ""
echo "📝 第3步：打开演示系统"
echo ""
open "http://localhost:3000"
sleep 2

# 4. 打开QuickTime
echo ""
echo "📝 第4步：打开QuickTime Player"
echo ""
open -a "QuickTime Player"
sleep 2

echo ""
echo "✅ 准备完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 下一步操作："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 在QuickTime中："
echo "   文件 → 新建屏幕录制"
echo ""
echo "2. 点击录制按钮，开始录制"
echo ""
echo "3. 录制时使用放大快捷键："
echo "   Option + Command + 8    开关放大"
echo "   Option + Command + =    放大"
echo "   Option + Command + -    缩小"
echo ""
echo "4. 同时播放配音："
echo "   在另一个终端运行："
echo "   afplay docs/audio/part1-natural/01-opening.aiff"
echo ""
echo "5. 停止录制："
echo "   Control + Command + Escape"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "• 配音文件位置: docs/audio/part1-natural/"
echo "• 操作脚本位置: docs/RECORDING-SCRIPT-PART1.md"
echo "• 完整指南位置: docs/SCREEN-RECORDING-GUIDE.md"
echo ""
echo "🎬 准备好了吗？开始录制吧！"
