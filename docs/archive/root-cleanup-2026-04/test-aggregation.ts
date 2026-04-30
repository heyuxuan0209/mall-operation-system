/**
 * 聚合查询功能测试
 * 测试AI助手是否能正确处理聚合统计查询
 */

// 测试用例
const testCases = [
  {
    query: "这个月有多少高风险商户？",
    expected: {
      type: "aggregation",
      operation: "count",
      filters: { riskLevel: ["high", "critical"] }
    }
  },
  {
    query: "餐饮类商户有几个？",
    expected: {
      type: "aggregation",
      operation: "count",
      filters: { category: ["餐饮"] }
    }
  },
  {
    query: "按风险等级统计商户数量",
    expected: {
      type: "aggregation",
      operation: "count",
      groupBy: "riskLevel"
    }
  },
  {
    query: "这个月高风险商户比上个月多了几个？",
    expected: {
      type: "aggregation",
      operation: "count",
      filters: { riskLevel: ["high", "critical"] },
      comparison: "last_month"
    }
  },
  {
    query: "所有商户的平均健康度是多少？",
    expected: {
      type: "aggregation",
      operation: "avg",
      field: "totalScore"
    }
  }
];

// 测试步骤
console.log("=== 聚合查询功能测试 ===\n");

console.log("📋 测试用例：");
testCases.forEach((tc, i) => {
  console.log(`\n${i + 1}. 问题: "${tc.query}"`);
  console.log(`   预期类型: ${tc.expected.type}`);
  console.log(`   预期操作: ${tc.expected.operation}`);
  if (tc.expected.filters) {
    console.log(`   预期筛选: ${JSON.stringify(tc.expected.filters)}`);
  }
  if (tc.expected.groupBy) {
    console.log(`   预期分组: ${tc.expected.groupBy}`);
  }
  if (tc.expected.comparison) {
    console.log(`   预期对比: ${tc.expected.comparison}`);
  }
});

console.log("\n\n🧪 测试方法：");
console.log("1. 启动开发服务器: npm run dev");
console.log("2. 打开浏览器访问: http://localhost:3000");
console.log("3. 点击右下角AI助手图标");
console.log("4. 依次输入上述测试问题");
console.log("5. 验证AI回答是否包含正确的统计数据");

console.log("\n\n✅ 成功标志：");
console.log("- AI能理解聚合查询意图");
console.log("- 返回正确的统计数字");
console.log("- 包含分组明细（如果有分组）");
console.log("- 包含对比数据（如果有对比）");
console.log("- 回答格式清晰易读");

console.log("\n\n❌ 失败标志：");
console.log("- AI回答\"我不理解\"或答非所问");
console.log("- 统计数字错误");
console.log("- 缺少分组明细");
console.log("- 缺少对比数据");
console.log("- 回答格式混乱");

console.log("\n\n📊 当前商户数据概况：");
console.log("- 总商户数: 18个");
console.log("- 高风险 (high): 2个");
console.log("- 中风险 (medium): 3个");
console.log("- 低风险 (low): 9个");
console.log("- 无风险 (none): 4个");
console.log("\n预期聚合查询结果：");
console.log("- \"有多少高风险商户\" → 应回答: 2个");
console.log("- \"有多少中高风险商户\" → 应回答: 5个 (high 2 + medium 3)");
console.log("- \"按风险等级统计\" → 应回答: high:2, medium:3, low:9, none:4");

export {};
