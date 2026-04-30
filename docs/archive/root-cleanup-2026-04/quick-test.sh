#!/bin/bash

# 商户详细运营数据扩展 - 快速验证脚本
# 使用方法: bash quick-test.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 商户详细运营数据扩展 - 功能验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查开发服务器
echo "📡 检查开发服务器状态..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 开发服务器正在运行 (http://localhost:3000)"
else
    echo "❌ 开发服务器未运行"
    echo "请先执行: npm run dev"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 测试清单"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 请按顺序测试以下功能："
echo ""

echo "1️⃣  基础数据录入测试"
echo "   📍 访问: http://localhost:3000/archives/M001"
echo "   🎬 操作: 点击【添加数据】→ 填写表单 → 保存"
echo "   ✅ 验证: 显示成功提示，页面刷新，数据正常展示"
echo ""

echo "2️⃣  业态差异化测试"
echo "   🔥 火锅店: http://localhost:3000/archives/M001"
echo "      → 应显示：通用+餐饮+顾客+员工+竞争+位置"
echo "   👔 服装店: http://localhost:3000/archives/M003"
echo "      → 应显示：通用+零售+顾客+员工+竞争+位置"
echo "   ☕ 饮品店: http://localhost:3000/archives/M002"
echo "      → 应显示：通用+餐饮+顾客+员工+竞争"
echo ""

echo "3️⃣  表单验证测试"
echo "   🎬 操作: 输入超范围值（如转化率 150%）"
echo "   ✅ 验证: 显示红色错误提示，阻止提交"
echo ""

echo "4️⃣  折叠面板测试"
echo "   🎬 操作: 点击各字段组头部"
echo "   ✅ 验证: 展开/收起切换流畅，显示已填写徽章"
echo ""

echo "5️⃣  空状态测试"
echo "   🎬 操作: 访问未添加数据的商户"
echo "   ✅ 验证: 显示空状态提示和图标"
echo ""

echo "6️⃣  编辑功能测试"
echo "   🎬 操作: 点击【编辑数据】→ 修改字段 → 保存"
echo "   ✅ 验证: 数据更新成功，更新时间改变"
echo ""

echo "7️⃣  AI诊断增强测试"
echo "   📍 访问: http://localhost:3000/health?merchantId=M001"
echo "   ✅ 验证: 诊断报告引用具体数据（如翻台率1.2次/天）"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 测试数据参考"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 查看测试数据样例:"
echo "   cat TEST_DATA_SAMPLES.ts"
echo ""
echo "📖 查看完整测试指南:"
echo "   cat IMPLEMENTATION_COMPLETE.md"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 快速跳转"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "选择要测试的商户:"
    echo "  [1] 海底捞火锅 (M001) - 餐饮业态"
    echo "  [2] 星巴克咖啡 (M002) - 饮品业态"
    echo "  [3] 优衣库 (M003) - 零售业态"
    echo "  [4] 查看所有商户"
    echo "  [0] 退出"
    echo ""
    read -p "请输入选项 [0-4]: " choice

    case $choice in
        1)
            echo "🔥 正在打开海底捞火锅档案..."
            open http://localhost:3000/archives/M001
            ;;
        2)
            echo "☕ 正在打开星巴克咖啡档案..."
            open http://localhost:3000/archives/M002
            ;;
        3)
            echo "👔 正在打开优衣库档案..."
            open http://localhost:3000/archives/M003
            ;;
        4)
            echo "📚 正在打开档案库..."
            open http://localhost:3000/archives
            ;;
        0)
            echo "👋 测试结束"
            exit 0
            ;;
        *)
            echo "❌ 无效选项"
            exit 1
            ;;
    esac

    echo ""
    echo "✅ 浏览器已打开，开始测试吧！"
    echo ""
    echo "💡 提示: 测试数据样例请查看 TEST_DATA_SAMPLES.ts"

else
    # Linux 或其他系统
    echo "💡 手动访问以下链接:"
    echo "   - 海底捞: http://localhost:3000/archives/M001"
    echo "   - 星巴克: http://localhost:3000/archives/M002"
    echo "   - 优衣库: http://localhost:3000/archives/M003"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 实施状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Task #1: 主表单组件 - 已完成"
echo "✅ Task #2: 数据展示组件 - 已完成"
echo "✅ Task #3: 详情页集成 - 已完成"
echo "✅ Task #4: AI诊断升级 - 已完成"
echo ""
echo "📈 项目进度: 100% ✅"
echo "🎉 所有功能已实施完成，开始验证吧！"
echo ""
