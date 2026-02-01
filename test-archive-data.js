// 测试档案数据生成
const { mockMerchants } = require('./data/merchants/mock-data.ts');
const { getMerchantSnapshots, getMerchantRiskChanges } = require('./data/history/mockHistoryData.ts');
const { historyArchiveService } = require('./utils/historyArchiveService.ts');

console.log('=== 测试档案数据生成 ===\n');

// 测试前3个商户
mockMerchants.slice(0, 3).forEach(merchant => {
  console.log(`\n商户: ${merchant.name} (${merchant.id})`);

  const snapshots = getMerchantSnapshots(merchant.id);
  const riskChanges = getMerchantRiskChanges(merchant.id);
  const archive = historyArchiveService.generateArchive(merchant.id);

  console.log(`  快照数量: ${snapshots.length}`);
  console.log(`  风险变更: ${riskChanges.length}`);
  console.log(`  档案生成: ${archive ? '✅ 成功' : '❌ 失败'}`);

  if (!archive) {
    console.log('  ⚠️ 警告：档案为空！');
  } else {
    console.log(`  统计数据:`);
    console.log(`    - 总快照: ${archive.stats.totalSnapshots}`);
    console.log(`    - 风险变更: ${archive.stats.riskChangeCount}`);
    console.log(`    - 帮扶任务: ${archive.stats.assistanceTaskCount}`);
  }
});

console.log('\n=== 测试完成 ===');
