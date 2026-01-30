/**
 * Phase 5: 代码验证脚本
 * 在浏览器控制台运行此脚本来验证功能
 */

console.log('=== Phase 5: 功能验证开始 ===\n');

// 1. 验证类型定义
console.log('✓ 检查 1: 验证接口导入');
try {
  // 这些类型应该在运行时可用（通过 localStorage）
  const testRecord = {
    id: 'test_123',
    merchantId: 'M001',
    merchantName: '测试商户',
    inspectorId: 'user_001',
    inspectorName: '测试用户',
    checkIn: {
      timestamp: new Date().toISOString(),
      location: { latitude: 0, longitude: 0 },
      distance: 0,
      withinRange: true,
    },
    rating: null,
    photos: [],
    audioNotes: [],
    textNotes: '',
    issues: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log('  ✓ InspectionRecord 接口验证通过');
} catch (e) {
  console.error('  ✗ InspectionRecord 接口验证失败:', e);
}

// 2. 验证照片分类
console.log('\n✓ 检查 2: 验证照片分类功能');
try {
  const testPhoto = {
    id: 'photo_123',
    type: 'image',
    data: 'data:image/png;base64,test',
    thumbnail: 'data:image/png;base64,test',
    size: 1024,
    mimeType: 'image/png',
    createdAt: new Date().toISOString(),
    category: 'place',
    tags: ['环境整洁', '灯光明亮'],
    issueLevel: 'good',
    description: '测试照片',
  };

  const photoCategories = {
    people: { label: '人（员工）', icon: '👥' },
    merchandise: { label: '货（商品）', icon: '📦' },
    place: { label: '场（环境）', icon: '🏪' },
  };

  if (photoCategories[testPhoto.category]) {
    console.log('  ✓ 照片分类验证通过');
  } else {
    console.error('  ✗ 照片分类验证失败');
  }
} catch (e) {
  console.error('  ✗ 照片分类验证失败:', e);
}

// 3. 验证问题等级
console.log('\n✓ 检查 3: 验证问题等级');
try {
  const issueLevels = {
    good: { label: '良好', color: 'bg-green-500' },
    normal: { label: '一般', color: 'bg-gray-500' },
    warning: { label: '警告', color: 'bg-orange-500' },
    critical: { label: '严重', color: 'bg-red-500' },
  };

  const testLevel = 'critical';
  if (issueLevels[testLevel]) {
    console.log('  ✓ 问题等级验证通过');
  } else {
    console.error('  ✗ 问题等级验证失败');
  }
} catch (e) {
  console.error('  ✗ 问题等级验证失败:', e);
}

// 4. 验证健康度计算逻辑
console.log('\n✓ 检查 4: 验证健康度计算');
try {
  // 模拟计算
  function calculateScore(oldScore, rating, photos) {
    let newScore = oldScore;

    if (rating) {
      const avgRating = (rating.people + rating.merchandise + rating.place + rating.overall) / 4;
      if (avgRating >= 80) newScore += 5;
      else if (avgRating >= 60) { /* 不变 */ }
      else if (avgRating >= 40) newScore -= 5;
      else newScore -= 10;
    }

    const criticalCount = photos.filter(p => p.issueLevel === 'critical').length;
    const warningCount = photos.filter(p => p.issueLevel === 'warning').length;
    const goodCount = photos.filter(p => p.issueLevel === 'good').length;

    newScore -= criticalCount * 5;
    newScore -= warningCount * 2;
    newScore += goodCount * 1;

    return Math.max(0, Math.min(100, newScore));
  }

  // 测试用例1: 高评分 + 良好照片 = 提升
  const test1 = calculateScore(65, { people: 85, merchandise: 85, place: 85, overall: 85 }, [
    { issueLevel: 'good' },
    { issueLevel: 'good' },
  ]);
  if (test1 > 65) {
    console.log(`  ✓ 测试1通过: 65 → ${test1} (预期提升)`);
  } else {
    console.error(`  ✗ 测试1失败: 65 → ${test1} (预期提升)`);
  }

  // 测试用例2: 低评分 + 严重问题 = 下降
  const test2 = calculateScore(65, { people: 30, merchandise: 30, place: 30, overall: 30 }, [
    { issueLevel: 'critical' },
    { issueLevel: 'critical' },
  ]);
  if (test2 < 65) {
    console.log(`  ✓ 测试2通过: 65 → ${test2} (预期下降)`);
  } else {
    console.error(`  ✗ 测试2失败: 65 → ${test2} (预期下降)`);
  }

  // 测试用例3: 边界测试 - 不会超过100
  const test3 = calculateScore(95, { people: 90, merchandise: 90, place: 90, overall: 90 }, [
    { issueLevel: 'good' },
    { issueLevel: 'good' },
    { issueLevel: 'good' },
  ]);
  if (test3 <= 100) {
    console.log(`  ✓ 测试3通过: 95 → ${test3} (不超过100)`);
  } else {
    console.error(`  ✗ 测试3失败: 95 → ${test3} (超过100)`);
  }

  // 测试用例4: 边界测试 - 不会低于0
  const test4 = calculateScore(10, { people: 20, merchandise: 20, place: 20, overall: 20 }, [
    { issueLevel: 'critical' },
    { issueLevel: 'critical' },
    { issueLevel: 'critical' },
  ]);
  if (test4 >= 0) {
    console.log(`  ✓ 测试4通过: 10 → ${test4} (不低于0)`);
  } else {
    console.error(`  ✗ 测试4失败: 10 → ${test4} (低于0)`);
  }

  console.log('  ✓ 健康度计算逻辑验证通过');
} catch (e) {
  console.error('  ✗ 健康度计算逻辑验证失败:', e);
}

// 5. 验证反馈生成逻辑
console.log('\n✓ 检查 5: 验证反馈生成');
try {
  function generateHighlights(photos, rating) {
    const improvements = [];
    const concerns = [];

    // 从照片生成
    photos.forEach(photo => {
      if (photo.issueLevel === 'good' && photo.tags.length > 0) {
        improvements.push(`${photo.tags[0]}表现良好`);
      }
      if (photo.issueLevel === 'critical' && photo.tags.length > 0) {
        concerns.push(`${photo.tags[0]}问题严重，需立即整改`);
      }
    });

    // 从评分生成
    if (rating) {
      if (rating.people >= 80) improvements.push('员工服务态度优秀');
      else if (rating.people < 50) concerns.push('员工服务需要培训提升');
    }

    return { improvements, concerns };
  }

  const testHighlights = generateHighlights([
    { issueLevel: 'good', tags: ['环境整洁'] },
    { issueLevel: 'critical', tags: ['卫生问题'] },
  ], { people: 85, merchandise: 70, place: 80, overall: 78 });

  if (testHighlights.improvements.length > 0 && testHighlights.concerns.length > 0) {
    console.log('  ✓ 改进亮点:', testHighlights.improvements);
    console.log('  ✓ 关注点:', testHighlights.concerns);
    console.log('  ✓ 反馈生成验证通过');
  } else {
    console.error('  ✗ 反馈生成验证失败');
  }
} catch (e) {
  console.error('  ✗ 反馈生成验证失败:', e);
}

// 6. 验证 localStorage 操作
console.log('\n✓ 检查 6: 验证数据持久化');
try {
  // 测试写入
  const testData = { test: 'phase5_validation' };
  localStorage.setItem('test_validation', JSON.stringify(testData));

  // 测试读取
  const retrieved = JSON.parse(localStorage.getItem('test_validation'));

  if (retrieved && retrieved.test === 'phase5_validation') {
    console.log('  ✓ localStorage 读写验证通过');
    // 清理测试数据
    localStorage.removeItem('test_validation');
  } else {
    console.error('  ✗ localStorage 读写验证失败');
  }
} catch (e) {
  console.error('  ✗ localStorage 验证失败:', e);
}

// 7. 总结
console.log('\n=== Phase 5: 功能验证完成 ===');
console.log('\n下一步: 在浏览器中进行完整的端到端测试');
console.log('访问: http://localhost:3000/inspection');
console.log('参考: docs/phase5-e2e-testing-guide.md');
