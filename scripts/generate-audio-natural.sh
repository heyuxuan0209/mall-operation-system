#!/bin/bash

###############################################
# Part 1 录制配音自动生成脚本 - 真人化版本
# 使用优化参数，让配音更接近真人
###############################################

OUTPUT_DIR="docs/audio/part1-natural"
mkdir -p "$OUTPUT_DIR"

echo "🎙️ 开始生成Part 1配音（真人化版本）..."
echo "📁 保存位置: $OUTPUT_DIR"
echo ""

# 尝试不同的中文语音，选择最自然的
VOICES=("Ting-Ting" "Mei-Jia" "Sin-Ji")
VOICE=""

for v in "${VOICES[@]}"; do
    if say -v "$v" "测试" 2>/dev/null; then
        VOICE="$v"
        break
    fi
done

if [ -z "$VOICE" ]; then
    echo "⚠️  未找到合适的中文语音，使用系统默认"
    VOICE=""
fi

echo "使用语音: ${VOICE:-系统默认}"
echo ""

# 语速设置（180-220更接近真人，默认175）
RATE=190

# 添加自然停顿的函数（在标点符号处）
function natural_say() {
    local text="$1"
    local output="$2"

    # 添加语速参数，让声音更自然
    if [ -n "$VOICE" ]; then
        say -v "$VOICE" -r $RATE -o "$output" "$text"
    else
        say -r $RATE -o "$output" "$text"
    fi
}

# 00:00-00:10 开场白（自然、轻松的开场）
echo "🎤 [1/15] 生成开场白..."
natural_say "商户智运Agent。让商场运营，更智能。今天，我将展示项目总经理，如何使用系统掌控全局，数据驱动决策。" \
"$OUTPUT_DIR/01-opening.aiff"

# 00:10-00:50 场景1.1 首页仪表板（添加情景感）
echo "🎤 [2/15] 生成首页仪表板旁白..."
natural_say "每周一，早晨8点。李总打开商户智运系统。首页一目了然。18户商户中，有2户，处于高风险状态，需要立即关注。平均健康度，78分。整体运营稳定。" \
"$OUTPUT_DIR/02-dashboard.aiff"

# 饼图和趋势图（数据叙述更自然）
echo "🎤 [3/15] 生成健康度分布旁白..."
natural_say "饼图显示。11%的商户，处于高风险。17%，处于中风险。趋势图显示，近6个月，风险商户数量，呈下降趋势。说明，帮扶措施有效。" \
"$OUTPUT_DIR/03-charts.aiff"

# 00:50-01:30 场景1.2 商户详情
echo "🎤 [4/15] 生成商户详情旁白..."
natural_say "李总，点击海底捞火锅。详情立即显示。健康度，仅45分。处于高风险。五维指标中，经营表现，和抗风险能力最弱。只有35分。" \
"$OUTPUT_DIR/04-merchant-detail.aiff"

echo "🎤 [5/15] 生成AI诊断提示..."
natural_say "点击，AI诊断按钮。系统快速生成报告。" \
"$OUTPUT_DIR/05-ai-prompt.aiff"

# 01:30-02:20 场景2.1 AI诊断（重点突出）
echo "🎤 [6/15] 生成AI诊断旁白..."
natural_say "AI诊断，快速生成报告。系统发现核心问题。营收，持续下滑18%。租金拖欠，45万。翻台率，低于行业标准。更重要的是。系统自动匹配了成功案例。蜀大侠火锅的帮扶经验。3个月内，营收提升25%。" \
"$OUTPUT_DIR/06-ai-diagnosis.aiff"

# 02:20-03:00 场景2.2 创建任务（流程感）
echo "🎤 [7/15] 生成创建任务旁白..."
natural_say "李总，点击，一键创建任务。商户信息，和AI推荐的4条措施，已自动填充。他指定，张经理为责任人。点击保存。任务立即创建完成。张经理的手机，同步收到了，任务通知。" \
"$OUTPUT_DIR/07-create-task.aiff"

# 03:00-03:20 场景3.1 健康度监控
echo "🎤 [8/15] 生成健康度监控旁白..."
natural_say "进入健康度监控。18户商户，一览无余。周生生，周大福，等珠宝店，表现优异。而海底捞，排在末尾。" \
"$OUTPUT_DIR/08-health-monitoring.aiff"

# 03:20-04:30 场景3.2 商户对比（对比感突出）
echo "🎤 [9/15] 生成商户对比介绍..."
natural_say "李总，选择同类型的，三家火锅店，进行对比。雷达图清晰显示。海底捞，在所有维度，都明显落后。" \
"$OUTPUT_DIR/09-compare-intro.aiff"

echo "🎤 [10/15] 生成商户对比数据..."
natural_say "对比表格，进一步揭示。小龙坎，翻台率3.8次。而海底捞，仅2.1次。仅为标杆的，55%。这些数据，为帮扶方向，提供了明确依据。" \
"$OUTPUT_DIR/10-compare-data.aiff"

# 04:30-05:00 场景4.1 帮扶档案（成功案例感）
echo "🎤 [11/15] 生成帮扶档案旁白..."
natural_say "以蜀大侠火锅为例。这是一个，成功的帮扶案例。档案摘要显示。共有8次，历史记录。3次，风险等级变更。2个，帮扶任务。成功率，100%。" \
"$OUTPUT_DIR/11-archive.aiff"

# 05:00-05:30 场景4.2 健康度趋势（进步感）
echo "🎤 [12/15] 生成健康度趋势旁白..."
natural_say "健康度趋势图，展示了完整的，帮扶过程。起始，58分，中风险。经过两轮，帮扶措施后。评分稳步提升，至75分，低风险。每个关键节点，都有清晰标注。效果，一目了然。" \
"$OUTPUT_DIR/12-health-trend.aiff"

# 05:30-06:00 场景5.1 任务清单（细节感）
echo "🎤 [13/15] 生成任务清单旁白..."
natural_say "展开任务详情。每条措施的效果，清晰可见。措施A，优化菜单结构，效果显著。经营表现，从58分，提升到68分。新菜品毛利率，45%。营收增长，18%。措施B，联合营销，效果中等。客流提升，但转化不足。" \
"$OUTPUT_DIR/13-task-measures.aiff"

# 06:00-06:30 场景5.2 措施排行榜（决策感）
echo "🎤 [14/15] 生成措施排行榜旁白..."
natural_say "系统自动统计，所有商户的，措施效果。生成排行榜。菜单结构优化，效果最佳。平均改善，12.5分。已成功应用，5次。这些数据，帮助李总，快速决策。同类问题，优先使用，高效措施。" \
"$OUTPUT_DIR/14-ranking.aiff"

# 06:30-06:40 结尾（总结感）
echo "🎤 [15/15] 生成结尾..."
natural_say "项目总经理，通过商户智运Agent。掌控全局。数据驱动决策。让商户运营，更高效。" \
"$OUTPUT_DIR/15-ending.aiff"

echo ""
echo "✅ 真人化配音生成完成！"
echo "📁 位置: $OUTPUT_DIR"
echo ""
echo "🆚 对比试听："
echo "原版: afplay docs/audio/part1/01-opening.aiff"
echo "真人化: afplay docs/audio/part1-natural/01-opening.aiff"
echo ""
echo "📋 配音文件列表:"
ls -lh "$OUTPUT_DIR"/*.aiff 2>/dev/null | awk '{print $9, "(" $5 ")"}'
echo ""
echo "💡 优化说明:"
echo "✓ 添加了自然停顿（在标点处）"
echo "✓ 调整了语速为190（更接近真人）"
echo "✓ 优化了语句断句结构"
echo "✓ 使用更自然的表达方式"
