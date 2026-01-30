/**
 * 测试数据生成器
 * 在浏览器控制台运行此脚本，快速生成测试数据
 *
 * 使用方法：
 * 1. 打开 http://localhost:3000/inspection
 * 2. 按 F12 打开控制台
 * 3. 复制粘贴此脚本并运行
 * 4. 调用相关函数生成测试数据
 */

const TestDataGenerator = {
  /**
   * 生成测试商户数据
   * 使用统一的配置确保数据一致性
   */
  generateMerchant() {
    // 统一的商户数据配置（与 mockMerchants 保持一致）
    const merchant = {
      id: 'M001',
      name: '海底捞火锅',
      category: '餐饮-火锅',
      floor: 'L4',
      shopNumber: '401',
      area: 450,
      rent: 132000,
      lastMonthRevenue: 471000, // 修正：确保租售比为28%
      rentToSalesRatio: 0.28,
      status: 'operating',
      riskLevel: 'high',      // 高风险（与 mockMerchants 一致）
      totalScore: 45,         // 初始健康度45分（与 mockMerchants 一致）
      metrics: {
        collection: 60,       // 租金缴纳一般
        operational: 35,      // 经营表现较差
        siteQuality: 50,      // 现场品质一般
        customerReview: 45,   // 顾客满意度偏低
        riskResistance: 35,   // 抗风险能力弱
      },
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2026-01-20').toISOString(),
    };

    const merchants = [merchant];
    localStorage.setItem('merchants', JSON.stringify(merchants));

    console.log('✓ 已生成商户数据:', merchant.name);
    console.log('  健康度:', merchant.totalScore, '分');
    console.log('  风险等级:', merchant.riskLevel);
    return merchant;
  },

  /**
   * 生成测试照片
   */
  generatePhoto(category, issueLevel, tags) {
    // 生成一个简单的测试图片 (1x1 透明 PNG)
    const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    return {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      data: transparentPixel,
      thumbnail: transparentPixel,
      size: 100,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      category: category,
      tags: tags,
      issueLevel: issueLevel,
      description: `测试照片 - ${category} - ${issueLevel}`,
    };
  },

  /**
   * 生成完整的巡检记录
   */
  generateInspectionRecord(scenario = 'normal') {
    const merchant = this.generateMerchant();

    let photos = [];
    let rating = null;
    let textNotes = '';

    // 根据场景生成不同的数据
    switch (scenario) {
      case 'excellent':
        // 优秀场景
        photos = [
          this.generatePhoto('place', 'good', ['环境整洁', '灯光明亮']),
          this.generatePhoto('merchandise', 'good', ['陈列整齐', '商品丰富']),
          this.generatePhoto('people', 'good', ['着装规范', '服务态度']),
        ];
        rating = {
          id: `rating_${Date.now()}`,
          merchantId: merchant.id,
          timestamp: new Date().toISOString(),
          ratings: {
            staffCondition: 90,
            merchandiseDisplay: 88,
            storeEnvironment: 92,
            managementCapability: 85,
            safetyCompliance: 90,
          },
        };
        textNotes = '整体表现优秀，值得表扬';
        break;

      case 'problems':
        // 发现问题场景
        photos = [
          this.generatePhoto('place', 'critical', ['卫生问题', '设施损坏']),
          this.generatePhoto('merchandise', 'warning', ['陈列混乱', '断货']),
          this.generatePhoto('place', 'critical', ['安全隐患']),
        ];
        rating = {
          id: `rating_${Date.now()}`,
          merchantId: merchant.id,
          timestamp: new Date().toISOString(),
          ratings: {
            staffCondition: 45,
            merchandiseDisplay: 40,
            storeEnvironment: 35,
            managementCapability: 40,
            safetyCompliance: 38,
          },
        };
        textNotes = '发现多个严重问题，需要立即整改';
        break;

      case 'mixed':
        // 混合场景
        photos = [
          this.generatePhoto('place', 'good', ['环境整洁']),
          this.generatePhoto('merchandise', 'warning', ['陈列混乱']),
          this.generatePhoto('people', 'good', ['服务态度']),
        ];
        rating = {
          id: `rating_${Date.now()}`,
          merchantId: merchant.id,
          timestamp: new Date().toISOString(),
          ratings: {
            staffCondition: 75,
            merchandiseDisplay: 55,
            storeEnvironment: 80,
            managementCapability: 65,
            safetyCompliance: 70,
          },
        };
        textNotes = '整体尚可，商品陈列需要改进';
        break;

      default:
        // 正常场景
        photos = [
          this.generatePhoto('place', 'good', ['环境整洁']),
          this.generatePhoto('merchandise', 'normal', ['陈列整齐']),
        ];
        rating = {
          id: `rating_${Date.now()}`,
          merchantId: merchant.id,
          timestamp: new Date().toISOString(),
          ratings: {
            staffCondition: 70,
            merchandiseDisplay: 65,
            storeEnvironment: 75,
            managementCapability: 68,
            safetyCompliance: 70,
          },
        };
        textNotes = '正常运营，无明显问题';
    }

    const record = {
      id: `inspection_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      inspectorId: 'test_user_001',
      inspectorName: '测试用户',
      checkIn: {
        timestamp: new Date().toISOString(),
        location: {
          latitude: 31.230416,
          longitude: 121.473701,
          accuracy: 10,
        },
        distance: 5,
        withinRange: true,
      },
      rating: rating,
      photos: photos,
      audioNotes: [],
      textNotes: textNotes,
      issues: photos
        .filter(p => p.issueLevel === 'critical' || p.issueLevel === 'warning')
        .map(p => `${p.category}问题(${p.tags.join('、')})`),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return record;
  },

  /**
   * 保存巡检记录到 localStorage
   */
  saveInspectionRecord(record) {
    const stored = localStorage.getItem('inspection_records');
    const records = stored ? JSON.parse(stored) : [];
    records.unshift(record);

    // 限制最多100条
    if (records.length > 100) {
      records.splice(100);
    }

    localStorage.setItem('inspection_records', JSON.stringify(records));
    console.log('✓ 已保存巡检记录:', record.id);
  },

  /**
   * 快速生成测试数据
   */
  quickSetup(scenario = 'normal') {
    console.log('=== 开始生成测试数据 ===\n');

    // 清空现有数据
    localStorage.removeItem('inspection_records');
    localStorage.removeItem('merchants');
    console.log('✓ 已清空旧数据\n');

    // 生成商户
    const merchant = this.generateMerchant();
    console.log('✓ 商户:', merchant.name, '健康度:', merchant.totalScore, '\n');

    // 生成巡检记录
    const record = this.generateInspectionRecord(scenario);
    this.saveInspectionRecord(record);
    console.log('✓ 巡检记录:', record.id);
    console.log('  - 照片数量:', record.photos.length);
    console.log('  - 问题数量:', record.issues.length);
    console.log('  - 评分:', record.rating);

    console.log('\n=== 测试数据生成完成 ===');
    console.log('场景:', scenario);
    console.log('可以开始测试了！\n');

    return { merchant, record };
  },

  /**
   * 生成多条测试记录
   */
  generateMultipleRecords(count = 5) {
    console.log(`=== 生成 ${count} 条测试记录 ===\n`);

    const scenarios = ['excellent', 'normal', 'mixed', 'problems'];
    const merchant = this.generateMerchant();

    for (let i = 0; i < count; i++) {
      const scenario = scenarios[i % scenarios.length];
      const record = this.generateInspectionRecord(scenario);

      // 调整时间戳，让记录看起来是不同时间的
      const date = new Date();
      date.setDate(date.getDate() - i);
      record.createdAt = date.toISOString();
      record.checkIn.timestamp = date.toISOString();

      this.saveInspectionRecord(record);
      console.log(`✓ 记录 ${i + 1}:`, scenario, '场景');
    }

    console.log('\n=== 完成 ===');
    console.log(`已生成 ${count} 条巡检记录`);
  },

  /**
   * 查看当前数据统计
   */
  showStats() {
    const records = JSON.parse(localStorage.getItem('inspection_records') || '[]');
    const merchants = JSON.parse(localStorage.getItem('merchants') || '[]');
    const images = JSON.parse(localStorage.getItem('inspection_images') || '[]');

    console.log('=== 数据统计 ===\n');
    console.log('巡检记录:', records.length, '条');
    console.log('商户数据:', merchants.length, '个');
    console.log('照片数据:', images.length, '张');

    if (records.length > 0) {
      const totalPhotos = records.reduce((sum, r) => sum + r.photos.length, 0);
      const totalIssues = records.reduce((sum, r) => sum + r.issues.length, 0);
      console.log('\n详细统计:');
      console.log('  - 总照片数:', totalPhotos);
      console.log('  - 总问题数:', totalIssues);
      console.log('  - 最新记录:', records[0].createdAt);
    }

    // 计算存储使用
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    console.log('\nLocalStorage 使用:', (totalSize / 1024).toFixed(2), 'KB');
  },

  /**
   * 清空所有测试数据
   */
  clearAll() {
    localStorage.removeItem('inspection_records');
    localStorage.removeItem('inspection_images');
    localStorage.removeItem('merchants');
    console.log('✓ 已清空所有测试数据');
  },
};

// 快捷方法
window.testData = TestDataGenerator;

console.log('%c=== 测试数据生成器已加载 ===', 'color: #10b981; font-size: 16px; font-weight: bold;');
console.log('\n可用命令:');
console.log('  testData.quickSetup()           - 快速生成测试数据（正常场景）');
console.log('  testData.quickSetup("excellent") - 生成优秀场景数据');
console.log('  testData.quickSetup("problems")  - 生成问题场景数据');
console.log('  testData.quickSetup("mixed")     - 生成混合场景数据');
console.log('  testData.generateMultipleRecords(5) - 生成5条不同场景的记录');
console.log('  testData.showStats()             - 查看数据统计');
console.log('  testData.clearAll()              - 清空所有数据');
console.log('\n示例:');
console.log('  testData.quickSetup("problems")  // 生成有问题的巡检记录');
console.log('\n');
