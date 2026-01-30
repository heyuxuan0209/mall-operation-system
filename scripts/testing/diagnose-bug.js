/**
 * Bug 诊断脚本
 * 用于诊断健康度计算错误的问题
 */

function diagnoseBug() {
  console.log('%c=== Bug 诊断开始 ===', 'color: #ef4444; font-size: 16px; font-weight: bold');
  console.log('\n');

  // 1. 检查商户数据
  console.log('%c1. 商户数据检查', 'color: #3b82f6; font-weight: bold');
  const merchantsStr = localStorage.getItem('merchants');
  if (!merchantsStr) {
    console.log('%c✗ 没有商户数据', 'color: #ef4444');
    return;
  }

  const merchants = JSON.parse(merchantsStr);
  const merchant = merchants[0];

  console.log('商户名称:', merchant.name);
  console.log('当前健康度:', merchant.totalScore);
  console.log('风险等级:', merchant.riskLevel);
  console.log('');

  // 2. 检查巡检记录
  console.log('%c2. 巡检记录检查', 'color: #3b82f6; font-weight: bold');
  const recordsStr = localStorage.getItem('inspection_records');
  if (!recordsStr) {
    console.log('%c✗ 没有巡检记录', 'color: #ef4444');
    return;
  }

  const records = JSON.parse(recordsStr);
  if (records.length === 0) {
    console.log('%c✗ 巡检记录为空', 'color: #ef4444');
    return;
  }

  const latestRecord = records[0];
  console.log('巡检ID:', latestRecord.id);
  console.log('巡检时间:', new Date(latestRecord.createdAt).toLocaleString());
  console.log('');

  // 3. 检查评分数据
  console.log('%c3. 评分数据检查', 'color: #3b82f6; font-weight: bold');
  if (!latestRecord.rating) {
    console.log('%c✗ 没有评分数据', 'color: #ef4444');
  } else {
    const rating = latestRecord.rating;
    console.log('人（员工）:', rating.people);
    console.log('货（商品）:', rating.merchandise);
    console.log('场（环境）:', rating.place);
    console.log('整体印象:', rating.overall);

    const avgRating = (rating.people + rating.merchandise + rating.place + rating.overall) / 4;
    console.log('平均评分:', avgRating.toFixed(2));

    let scoreFromRating = 0;
    if (avgRating >= 80) {
      scoreFromRating = 5;
      console.log('评分影响: +5 (平均分 >= 80)');
    } else if (avgRating >= 60) {
      scoreFromRating = 0;
      console.log('评分影响: 0 (平均分 60-80)');
    } else if (avgRating >= 40) {
      scoreFromRating = -5;
      console.log('评分影响: -5 (平均分 40-60)');
    } else {
      scoreFromRating = -10;
      console.log('评分影响: -10 (平均分 < 40)');
    }
    console.log('');

    // 保存评分影响供后面使用
    window.debugScoreFromRating = scoreFromRating;
  }

  // 4. 检查照片数据
  console.log('%c4. 照片数据检查', 'color: #3b82f6; font-weight: bold');
  const photos = latestRecord.photos;
  console.log('照片数量:', photos.length);

  if (photos.length === 0) {
    console.log('%c⚠️  没有照片', 'color: #f59e0b');
  } else {
    let criticalCount = 0;
    let warningCount = 0;
    let goodCount = 0;
    let normalCount = 0;
    let unknownCount = 0;

    photos.forEach((photo, index) => {
      console.log(`\n照片 ${index + 1}:`);
      console.log('  ID:', photo.id);
      console.log('  分类:', photo.category || '未分类');
      console.log('  等级:', photo.issueLevel || '未设置');
      console.log('  标签:', photo.tags?.join(', ') || '无');

      // 统计
      switch (photo.issueLevel) {
        case 'critical':
          criticalCount++;
          break;
        case 'warning':
          warningCount++;
          break;
        case 'good':
          goodCount++;
          break;
        case 'normal':
          normalCount++;
          break;
        default:
          unknownCount++;
      }
    });

    console.log('\n照片等级统计:');
    console.log('  严重 (critical):', criticalCount);
    console.log('  警告 (warning):', warningCount);
    console.log('  良好 (good):', goodCount);
    console.log('  一般 (normal):', normalCount);
    console.log('  未设置:', unknownCount);

    const scoreFromPhotos = goodCount * 1 - warningCount * 2 - criticalCount * 5;
    console.log('\n照片影响: ' + (scoreFromPhotos >= 0 ? '+' : '') + scoreFromPhotos);
    console.log('  计算: 良好(' + goodCount + ')×1 - 警告(' + warningCount + ')×2 - 严重(' + criticalCount + ')×5');
    console.log('');

    // 保存照片影响供后面使用
    window.debugScoreFromPhotos = scoreFromPhotos;
  }

  // 5. 手动计算预期分数
  console.log('%c5. 健康度计算验证', 'color: #3b82f6; font-weight: bold');

  // 从记录中找到旧分数
  let oldScore = 65; // 默认初始值
  if (records.length > 1) {
    // 如果有多条记录，从第二条的商户数据中获取
    // 但这不准确，应该从保存时记录的 oldScore
    console.log('⚠️  无法准确获取保存前的旧分数，假设为 65');
  } else {
    console.log('这是第一次巡检，旧分数应该是 65');
  }

  const scoreFromRating = window.debugScoreFromRating || 0;
  const scoreFromPhotos = window.debugScoreFromPhotos || 0;

  const calculatedScore = oldScore + scoreFromRating + scoreFromPhotos;
  const finalScore = Math.max(0, Math.min(100, calculatedScore));

  console.log('计算过程:');
  console.log('  旧分数:', oldScore);
  console.log('  + 评分影响:', scoreFromRating);
  console.log('  + 照片影响:', scoreFromPhotos);
  console.log('  = 计算结果:', calculatedScore);
  console.log('  最终分数 (0-100):', finalScore);
  console.log('');

  console.log('实际保存的分数:', merchant.totalScore);
  console.log('');

  // 6. 对比结果
  console.log('%c6. 问题分析', 'color: #3b82f6; font-weight: bold');

  if (finalScore === merchant.totalScore) {
    console.log('%c✓ 计算正确', 'color: #10b981; font-weight: bold');
  } else {
    console.log('%c✗ 计算错误', 'color: #ef4444; font-weight: bold');
    console.log('预期:', finalScore);
    console.log('实际:', merchant.totalScore);
    console.log('差异:', merchant.totalScore - finalScore);
    console.log('');

    console.log('%c可能的原因:', 'color: #f59e0b; font-weight: bold');

    // 分析可能的原因
    if (photos.length === 0) {
      console.log('  • 照片数据丢失或未正确保存');
    }

    if (!latestRecord.rating) {
      console.log('  • 评分数据丢失或未正确保存');
    }

    if (photos.some(p => !p.issueLevel)) {
      console.log('  • 部分照片没有设置问题等级');
    }

    if (merchant.totalScore < oldScore && scoreFromRating + scoreFromPhotos > 0) {
      console.log('  • 健康度下降但应该上升 - 可能计算逻辑错误');
    }

    if (merchant.totalScore > oldScore && scoreFromRating + scoreFromPhotos < 0) {
      console.log('  • 健康度上升但应该下降 - 可能计算逻辑错误');
    }

    console.log('');
    console.log('%c建议操作:', 'color: #f59e0b; font-weight: bold');
    console.log('  1. 检查照片是否正确分类和设置等级');
    console.log('  2. 检查评分是否正确提交');
    console.log('  3. 查看浏览器控制台是否有 JavaScript 错误');
    console.log('  4. 重新测试一次并记录详细步骤');
  }

  console.log('\n%c=== 诊断完成 ===', 'color: #ef4444; font-size: 16px; font-weight: bold');

  return {
    merchant,
    latestRecord,
    oldScore,
    calculatedScore: finalScore,
    actualScore: merchant.totalScore,
    isCorrect: finalScore === merchant.totalScore,
  };
}

// 全局访问
window.diagnoseBug = diagnoseBug;

console.log('%c=== Bug 诊断脚本已加载 ===', 'color: #ef4444; font-size: 16px; font-weight: bold');
console.log('\n运行诊断:');
console.log('  diagnoseBug()');
console.log('\n');
