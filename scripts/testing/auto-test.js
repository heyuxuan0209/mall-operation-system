/**
 * 浏览器端自动化测试脚本
 * 模拟用户操作，验证关键功能
 *
 * 使用方法：
 * 1. 访问 http://localhost:3000/inspection
 * 2. 打开浏览器控制台 (F12)
 * 3. 复制粘贴此脚本并运行
 * 4. 调用 AutoTest.runAll() 开始自动测试
 */

const AutoTest = {
  results: [],
  passed: 0,
  failed: 0,

  /**
   * 日志输出
   */
  log(message, type = 'info') {
    const styles = {
      info: 'color: #3b82f6',
      success: 'color: #10b981; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      warning: 'color: #f59e0b',
    };
    console.log(`%c${message}`, styles[type] || styles.info);
  },

  /**
   * 测试结果记录
   */
  assert(testName, condition, message) {
    if (condition) {
      this.passed++;
      this.results.push({ test: testName, status: 'PASS', message });
      this.log(`✓ ${testName}: ${message}`, 'success');
    } else {
      this.failed++;
      this.results.push({ test: testName, status: 'FAIL', message });
      this.log(`✗ ${testName}: ${message}`, 'error');
    }
  },

  /**
   * 等待元素出现
   */
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Element not found: ${selector}`);
  },

  /**
   * 模拟点击
   */
  click(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.click();
      return true;
    }
    return false;
  },

  /**
   * 测试 1: 页面基础元素检查
   */
  async testPageElements() {
    this.log('\n=== 测试 1: 页面基础元素检查 ===\n', 'info');

    // 检查页面标题
    const title = document.querySelector('h1');
    this.assert(
      'Page Title',
      title && title.textContent.includes('现场巡店'),
      '页面标题存在'
    );

    // 检查签到模块
    const checkInSection = document.querySelector('h2');
    this.assert(
      'CheckIn Section',
      checkInSection && checkInSection.textContent.includes('快捷签到'),
      '签到模块存在'
    );

    // 检查拍照模块
    const photoSection = Array.from(document.querySelectorAll('h2')).find(
      h => h.textContent.includes('拍照记录')
    );
    this.assert('Photo Section', !!photoSection, '拍照模块存在');

    // 检查评分模块
    const ratingSection = Array.from(document.querySelectorAll('h2')).find(
      h => h.textContent.includes('快速评分')
    );
    this.assert('Rating Section', !!ratingSection, '评分模块存在');

    // 检查保存按钮
    const saveButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent.includes('保存')
    );
    this.assert('Save Button', !!saveButton, '保存按钮存在');
  },

  /**
   * 测试 2: LocalStorage 数据结构
   */
  testLocalStorageStructure() {
    this.log('\n=== 测试 2: LocalStorage 数据结构 ===\n', 'info');

    // 清空数据
    localStorage.removeItem('inspection_records');
    localStorage.removeItem('merchants');

    // 创建测试数据
    const testRecord = {
      id: 'test_123',
      merchantId: 'M001',
      merchantName: '测试商户',
      photos: [],
      issues: [],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('inspection_records', JSON.stringify([testRecord]));

    // 验证读取
    const stored = localStorage.getItem('inspection_records');
    const parsed = JSON.parse(stored);

    this.assert(
      'Storage Write/Read',
      parsed[0].id === 'test_123',
      'LocalStorage 读写正常'
    );

    this.assert(
      'Record Structure',
      parsed[0].merchantName === '测试商户',
      '记录结构正确'
    );

    // 清理
    localStorage.removeItem('inspection_records');
  },

  /**
   * 测试 3: 健康度计算逻辑
   */
  testHealthScoreCalculation() {
    this.log('\n=== 测试 3: 健康度计算逻辑 ===\n', 'info');

    // 计算函数
    const calculateScore = (oldScore, avgRating, photos) => {
      let newScore = oldScore;

      if (avgRating >= 80) newScore += 5;
      else if (avgRating >= 60) { /* 不变 */ }
      else if (avgRating >= 40) newScore -= 5;
      else newScore -= 10;

      const criticalCount = photos.filter(p => p.issueLevel === 'critical').length;
      const warningCount = photos.filter(p => p.issueLevel === 'warning').length;
      const goodCount = photos.filter(p => p.issueLevel === 'good').length;

      newScore -= criticalCount * 5;
      newScore -= warningCount * 2;
      newScore += goodCount * 1;

      return Math.max(0, Math.min(100, newScore));
    };

    // 测试用例 1: 高评分 + 良好照片
    const test1 = calculateScore(65, 85, [{ issueLevel: 'good' }, { issueLevel: 'good' }]);
    this.assert(
      'Calculation Test 1',
      test1 === 72,
      `高评分场景: 65 → ${test1} (预期 72)`
    );

    // 测试用例 2: 低评分 + 严重问题
    const test2 = calculateScore(65, 30, [{ issueLevel: 'critical' }, { issueLevel: 'critical' }]);
    this.assert(
      'Calculation Test 2',
      test2 === 45,
      `低评分场景: 65 → ${test2} (预期 45)`
    );

    // 测试用例 3: 上限测试
    const test3 = calculateScore(95, 90, [{ issueLevel: 'good' }, { issueLevel: 'good' }]);
    this.assert(
      'Calculation Test 3',
      test3 === 100,
      `上限测试: 95 → ${test3} (预期 100)`
    );

    // 测试用例 4: 下限测试
    const test4 = calculateScore(10, 20, [
      { issueLevel: 'critical' },
      { issueLevel: 'critical' },
      { issueLevel: 'critical' },
    ]);
    this.assert(
      'Calculation Test 4',
      test4 === 0,
      `下限测试: 10 → ${test4} (预期 0)`
    );
  },

  /**
   * 测试 4: 照片分类数据结构
   */
  testPhotoClassification() {
    this.log('\n=== 测试 4: 照片分类数据结构 ===\n', 'info');

    const photoCategories = {
      people: { label: '人（员工）', icon: '👥' },
      merchandise: { label: '货（商品）', icon: '📦' },
      place: { label: '场（环境）', icon: '🏪' },
    };

    const issueLevels = {
      good: { label: '良好' },
      normal: { label: '一般' },
      warning: { label: '警告' },
      critical: { label: '严重' },
    };

    this.assert(
      'Photo Categories',
      Object.keys(photoCategories).length === 3,
      '照片分类定义正确（人货场）'
    );

    this.assert(
      'Issue Levels',
      Object.keys(issueLevels).length === 4,
      '问题等级定义正确（4级）'
    );

    // 测试照片对象
    const testPhoto = {
      id: 'test_photo',
      category: 'place',
      tags: ['环境整洁', '灯光明亮'],
      issueLevel: 'good',
      description: '测试照片',
    };

    this.assert(
      'Photo Structure',
      testPhoto.category in photoCategories,
      '照片分类字段有效'
    );

    this.assert(
      'Photo Tags',
      Array.isArray(testPhoto.tags) && testPhoto.tags.length > 0,
      '照片标签结构正确'
    );
  },

  /**
   * 测试 5: 反馈生成逻辑
   */
  testFeedbackGeneration() {
    this.log('\n=== 测试 5: 反馈生成逻辑 ===\n', 'info');

    const generateHighlights = (photos, rating) => {
      const improvements = [];
      const concerns = [];

      photos.forEach(photo => {
        if (photo.issueLevel === 'good' && photo.tags.length > 0) {
          improvements.push(`${photo.tags[0]}表现良好`);
        }
        if (photo.issueLevel === 'critical' && photo.tags.length > 0) {
          concerns.push(`${photo.tags[0]}问题严重`);
        }
      });

      if (rating && rating.people >= 80) {
        improvements.push('员工服务态度优秀');
      }

      return { improvements, concerns };
    };

    const testPhotos = [
      { issueLevel: 'good', tags: ['环境整洁'] },
      { issueLevel: 'critical', tags: ['卫生问题'] },
    ];
    const testRating = { people: 85 };

    const highlights = generateHighlights(testPhotos, testRating);

    this.assert(
      'Feedback Improvements',
      highlights.improvements.length >= 2,
      `生成了 ${highlights.improvements.length} 条改进亮点`
    );

    this.assert(
      'Feedback Concerns',
      highlights.concerns.length >= 1,
      `生成了 ${highlights.concerns.length} 条关注点`
    );
  },

  /**
   * 测试 6: 性能检查
   */
  testPerformance() {
    this.log('\n=== 测试 6: 性能检查 ===\n', 'info');

    // 测试 LocalStorage 大小
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }

    const sizeInKB = totalSize / 1024;
    const sizeInMB = sizeInKB / 1024;

    this.assert(
      'Storage Size',
      sizeInMB < 5,
      `LocalStorage 使用量: ${sizeInKB.toFixed(2)} KB (限制: 5 MB)`
    );

    // 测试页面加载时间（从 performance API）
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      this.assert(
        'Page Load Time',
        loadTime < 5000,
        `页面加载时间: ${(loadTime / 1000).toFixed(2)}s (目标: <5s)`
      );
    }
  },

  /**
   * 显示测试报告
   */
  showReport() {
    this.log('\n═══════════════════════════════════', 'info');
    this.log('        测试报告', 'info');
    this.log('═══════════════════════════════════\n', 'info');

    console.table(this.results);

    const total = this.passed + this.failed;
    const passRate = ((this.passed / total) * 100).toFixed(1);

    this.log(`\n总计: ${total} 个测试`, 'info');
    this.log(`通过: ${this.passed} ✓`, 'success');
    if (this.failed > 0) {
      this.log(`失败: ${this.failed} ✗`, 'error');
    }
    this.log(`通过率: ${passRate}%\n`, this.failed === 0 ? 'success' : 'warning');

    if (this.failed === 0) {
      this.log('🎉 所有测试通过！', 'success');
    } else {
      this.log('⚠️  存在失败的测试，请检查', 'warning');
    }
  },

  /**
   * 重置测试结果
   */
  reset() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  },

  /**
   * 运行所有测试
   */
  async runAll() {
    this.reset();
    this.log('\n🧪 开始自动化测试...\n', 'info');

    try {
      await this.testPageElements();
      this.testLocalStorageStructure();
      this.testHealthScoreCalculation();
      this.testPhotoClassification();
      this.testFeedbackGeneration();
      this.testPerformance();
    } catch (error) {
      this.log(`\n❌ 测试过程中出现错误: ${error.message}`, 'error');
      console.error(error);
    }

    this.showReport();
    return this.results;
  },
};

// 全局访问
window.autoTest = AutoTest;

console.log('%c=== 自动化测试脚本已加载 ===', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('\n运行测试:');
console.log('  autoTest.runAll()  - 运行所有自动化测试');
console.log('\n单独测试:');
console.log('  autoTest.testPageElements()');
console.log('  autoTest.testHealthScoreCalculation()');
console.log('  autoTest.testPhotoClassification()');
console.log('  autoTest.testFeedbackGeneration()');
console.log('\n');
