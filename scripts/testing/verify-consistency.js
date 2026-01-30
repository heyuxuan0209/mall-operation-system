/**
 * 商户数据一致性验证脚本
 * 在浏览器控制台运行，验证所有地方的商户数据是否一致
 *
 * 使用方法：
 * 1. 打开 http://localhost:3000/inspection
 * 2. 按 F12 打开控制台
 * 3. 复制粘贴此脚本并运行
 * 4. 调用 verifyDataConsistency()
 */

function verifyDataConsistency() {
  console.log('%c=== 商户数据一致性验证 ===', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
  console.log('\n');

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, message, expected, actual) {
    if (condition) {
      passed++;
      console.log(`%c✓ ${testName}`, 'color: #10b981; font-weight: bold');
      console.log(`  ${message}`);
    } else {
      failed++;
      console.log(`%c✗ ${testName}`, 'color: #ef4444; font-weight: bold');
      console.log(`  ${message}`);
      if (expected !== undefined && actual !== undefined) {
        console.log(`  预期: ${expected}, 实际: ${actual}`);
      }
    }
    console.log('');
  }

  // 测试 1: 检查 localStorage 中是否有商户数据
  const merchantsStr = localStorage.getItem('merchants');
  assert(
    '测试 1: 商户数据存在',
    !!merchantsStr,
    merchantsStr ? 'localStorage 中存在商户数据' : 'localStorage 中没有商户数据'
  );

  if (!merchantsStr) {
    console.log('%c⚠️  请先访问页面初始化数据', 'color: #f59e0b; font-weight: bold');
    return;
  }

  let merchants;
  try {
    merchants = JSON.parse(merchantsStr);
  } catch (e) {
    console.log('%c✗ 数据格式错误', 'color: #ef4444; font-weight: bold');
    console.error(e);
    return;
  }

  const merchant = merchants[0];

  // 测试 2: 基础字段完整性
  assert(
    '测试 2: 基础字段完整',
    merchant.id && merchant.name && merchant.totalScore !== undefined,
    `商户: ${merchant.name} (${merchant.id}), 健康度: ${merchant.totalScore}`
  );

  // 测试 3: 健康度范围
  assert(
    '测试 3: 健康度范围',
    merchant.totalScore >= 0 && merchant.totalScore <= 100,
    `健康度在有效范围内: ${merchant.totalScore}`,
    '0-100',
    merchant.totalScore
  );

  // 测试 4: 风险等级映射
  const expectedRiskLevel =
    merchant.totalScore >= 80 ? 'low' :
    merchant.totalScore >= 60 ? 'medium' :
    merchant.totalScore >= 40 ? 'high' : 'critical';

  assert(
    '测试 4: 风险等级映射',
    merchant.riskLevel === expectedRiskLevel,
    `健康度 ${merchant.totalScore} 对应风险等级 ${merchant.riskLevel}`,
    expectedRiskLevel,
    merchant.riskLevel
  );

  // 测试 5: 初始数据配置
  if (merchant.totalScore === 65) {
    assert(
      '测试 5: 初始配置',
      merchant.totalScore === 65 && merchant.riskLevel === 'medium',
      '使用正确的初始配置（65分，中风险）'
    );
  } else {
    console.log('%cℹ️  测试 5: 数据已更新', 'color: #3b82f6');
    console.log(`  当前健康度: ${merchant.totalScore} (不是初始值65)`);
    console.log('');
  }

  // 测试 6: 检查巡检记录
  const recordsStr = localStorage.getItem('inspection_records');
  if (recordsStr) {
    const records = JSON.parse(recordsStr);

    assert(
      '测试 6: 巡检记录存在',
      records.length > 0,
      `找到 ${records.length} 条巡检记录`
    );

    if (records.length > 0) {
      const latestRecord = records[0];

      // 测试 7: 记录中的商户ID一致
      assert(
        '测试 7: 商户ID一致',
        latestRecord.merchantId === merchant.id,
        `记录中的商户ID (${latestRecord.merchantId}) 与当前商户ID一致`
      );

      // 测试 8: 照片数据结构
      if (latestRecord.photos && latestRecord.photos.length > 0) {
        const validPhotos = latestRecord.photos.every(p =>
          p.category && p.issueLevel && Array.isArray(p.tags)
        );

        assert(
          '测试 8: 照片数据结构',
          validPhotos,
          `${latestRecord.photos.length} 张照片的数据结构正确`
        );
      } else {
        console.log('%cℹ️  测试 8: 跳过（无照片）', 'color: #3b82f6');
        console.log('');
      }

      // 测试 9: 计算健康度变化的逻辑
      if (records.length >= 2) {
        const record1 = records[1]; // 倒数第二条
        const record2 = records[0]; // 最新一条

        console.log('%c📊 健康度变化历史', 'color: #3b82f6; font-weight: bold');
        console.log(`  巡检 1: ${new Date(record1.createdAt).toLocaleString()}`);
        console.log(`  巡检 2: ${new Date(record2.createdAt).toLocaleString()}`);
        console.log(`  当前健康度: ${merchant.totalScore}`);
        console.log('');
      }
    }
  } else {
    console.log('%cℹ️  测试 6-9: 跳过（无巡检记录）', 'color: #3b82f6');
    console.log('');
  }

  // 测试 10: 存储大小
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  const sizeInKB = totalSize / 1024;
  const sizeInMB = sizeInKB / 1024;

  assert(
    '测试 10: 存储容量',
    sizeInMB < 5,
    `LocalStorage 使用 ${sizeInKB.toFixed(2)} KB，未超过 5 MB 限制`
  );

  // 总结
  console.log('%c═══════════════════════════════════', 'color: #6b7280');
  console.log('%c         验证总结', 'color: #3b82f6; font-weight: bold');
  console.log('%c═══════════════════════════════════', 'color: #6b7280');
  console.log('');

  const total = passed + failed;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`总计: ${total} 个测试`);
  console.log(`%c通过: ${passed} ✓`, 'color: #10b981; font-weight: bold');

  if (failed > 0) {
    console.log(`%c失败: ${failed} ✗`, 'color: #ef4444; font-weight: bold');
    console.log(`通过率: ${passRate}%`);
    console.log('');
    console.log('%c⚠️  存在数据一致性问题，请检查', 'color: #f59e0b; font-weight: bold');
  } else {
    console.log(`通过率: ${passRate}%`);
    console.log('');
    console.log('%c🎉 所有测试通过，数据一致性良好！', 'color: #10b981; font-weight: bold');
  }

  // 显示当前商户状态
  console.log('');
  console.log('%c当前商户状态', 'color: #3b82f6; font-weight: bold');
  console.log('─────────────────────────────────');
  console.log(`商户: ${merchant.name}`);
  console.log(`健康度: ${merchant.totalScore} 分`);
  console.log(`风险等级: ${merchant.riskLevel}`);
  console.log(`更新时间: ${new Date(merchant.updatedAt).toLocaleString()}`);

  return {
    passed,
    failed,
    total,
    passRate,
    merchant,
  };
}

// 快捷命令：重置为初始状态
function resetToInitialState() {
  const initialMerchant = {
    id: 'M001',
    name: '星巴克咖啡',
    category: '餐饮-咖啡',
    floor: 'L1',
    shopNumber: 'A101',
    area: 120,
    rent: 50000,
    lastMonthRevenue: 180000,
    rentToSalesRatio: 27.8,
    status: 'operating',
    riskLevel: 'medium',
    totalScore: 65,
    metrics: {
      collection: 85,
      operational: 55,
      siteQuality: 60,
      customerReview: 70,
      riskResistance: 50,
    },
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem('merchants', JSON.stringify([initialMerchant]));
  console.log('%c✓ 已重置为初始状态', 'color: #10b981; font-weight: bold');
  console.log('商户:', initialMerchant.name);
  console.log('健康度:', initialMerchant.totalScore, '分');
  console.log('风险等级:', initialMerchant.riskLevel);
  console.log('');
  console.log('请刷新页面查看效果');
}

// 全局访问
window.verifyDataConsistency = verifyDataConsistency;
window.resetToInitialState = resetToInitialState;

console.log('%c=== 数据一致性验证脚本已加载 ===', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('\n可用命令:');
console.log('  verifyDataConsistency()  - 验证数据一致性');
console.log('  resetToInitialState()    - 重置为初始状态（65分，中风险）');
console.log('\n');
