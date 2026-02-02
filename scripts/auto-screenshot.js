const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * 自动截图脚本 - Part 1 演示视频
 * 自动打开浏览器，访问关键页面，截取高质量截图
 */

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../docs/screenshots/part1');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 等待函数
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureScreenshots() {
  console.log('🚀 启动自动截图程序...');
  console.log(`📁 截图保存位置: ${OUTPUT_DIR}`);

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: false, // 显示浏览器窗口，方便调试
    defaultViewport: {
      width: 1280,
      height: 800,
    },
  });

  const page = await browser.newPage();

  try {
    // 截图1: 首页仪表板
    console.log('\n📸 [1/10] 截取首页仪表板...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await wait(2000); // 等待图表渲染
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-homepage.png'),
      fullPage: false
    });
    console.log('✅ 保存: 01-homepage.png');

    // 截图2: 首页滚动后（饼图+柱状图）
    console.log('\n📸 [2/10] 截取健康度分布图表...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await wait(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-dashboard-charts.png')
    });
    console.log('✅ 保存: 02-dashboard-charts.png');

    // 截图3: 待处理商户列表
    console.log('\n📸 [3/10] 截取待处理商户列表...');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await wait(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-pending-merchants.png')
    });
    console.log('✅ 保存: 03-pending-merchants.png');

    // 截图4: 海底捞详情面板
    console.log('\n📸 [4/10] 截取海底捞详情面板...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await wait(2000);

    // 尝试点击海底捞商户卡片（可能需要调整选择器）
    try {
      // 方式1: 通过文字查找
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="merchant"]'));
        const haidilaoCard = cards.find(card => card.textContent.includes('海底捞'));
        if (haidilaoCard) {
          haidilaoCard.click();
        }
      });
      await wait(2000); // 等待详情面板弹出
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '04-haidilao-detail.png')
      });
      console.log('✅ 保存: 04-haidilao-detail.png');
    } catch (err) {
      console.log('⚠️  无法自动点击海底捞，请手动截图: 04-haidilao-detail.png');
    }

    // 截图5: AI诊断报告
    console.log('\n📸 [5/10] 截取AI诊断报告...');
    try {
      // 尝试点击AI诊断按钮
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiButton = buttons.find(btn =>
          btn.textContent.includes('AI诊断') ||
          btn.textContent.includes('智能诊断')
        );
        if (aiButton) {
          aiButton.click();
        }
      });
      await wait(2000); // 等待诊断报告生成
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '05-ai-diagnosis.png')
      });
      console.log('✅ 保存: 05-ai-diagnosis.png');
    } catch (err) {
      console.log('⚠️  无法自动点击AI诊断，请手动截图: 05-ai-diagnosis.png');
    }

    // 截图6: 创建任务表单
    console.log('\n📸 [6/10] 截取创建任务表单...');
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const createButton = buttons.find(btn =>
          btn.textContent.includes('创建任务') ||
          btn.textContent.includes('创建帮扶')
        );
        if (createButton) {
          createButton.click();
        }
      });
      await wait(2000);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '06-create-task.png')
      });
      console.log('✅ 保存: 06-create-task.png');
    } catch (err) {
      console.log('⚠️  无法自动打开任务表单，请手动截图: 06-create-task.png');
    }

    // 截图7: 健康度监控列表
    console.log('\n📸 [7/10] 截取健康度监控列表...');
    await page.goto(`${BASE_URL}/health`, { waitUntil: 'networkidle2' });
    await wait(2000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '07-health-monitoring.png'),
      fullPage: false
    });
    console.log('✅ 保存: 07-health-monitoring.png');

    // 截图8: 商户对比页面
    console.log('\n📸 [8/10] 截取商户对比页面...');
    await page.goto(`${BASE_URL}/health/compare?ids=M001,M007,M008`, {
      waitUntil: 'networkidle2'
    });
    await wait(3000); // 等待雷达图渲染
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '08-merchant-compare.png'),
      fullPage: true
    });
    console.log('✅ 保存: 08-merchant-compare.png');

    // 截图9: 蜀大侠帮扶档案
    console.log('\n📸 [9/10] 截取蜀大侠帮扶档案...');
    await page.goto(`${BASE_URL}/health`, { waitUntil: 'networkidle2' });
    await wait(2000);

    try {
      // 点击蜀大侠
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="merchant"]'));
        const shudaxiaCard = cards.find(card => card.textContent.includes('蜀大侠'));
        if (shudaxiaCard) {
          shudaxiaCard.click();
        }
      });
      await wait(2000);

      // 滚动到档案区域
      await page.evaluate(() => {
        const archiveSection = document.querySelector('[class*="archive"]') ||
                               document.querySelector('h3:contains("历史帮扶档案")');
        if (archiveSection) {
          archiveSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo(0, 1500);
        }
      });
      await wait(1000);

      await page.screenshot({
        path: path.join(OUTPUT_DIR, '09-shudaxia-archive.png')
      });
      console.log('✅ 保存: 09-shudaxia-archive.png');
    } catch (err) {
      console.log('⚠️  无法自动截取档案，请手动截图: 09-shudaxia-archive.png');
    }

    // 截图10: 措施有效性排行榜
    console.log('\n📸 [10/10] 截取措施有效性排行榜...');
    try {
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
        const taskTab = tabs.find(tab => tab.textContent.includes('帮扶任务'));
        if (taskTab) {
          taskTab.click();
        }
      });
      await wait(2000);
      await page.evaluate(() => window.scrollTo(0, 2000));
      await wait(1000);

      await page.screenshot({
        path: path.join(OUTPUT_DIR, '10-measure-ranking.png'),
        fullPage: true
      });
      console.log('✅ 保存: 10-measure-ranking.png');
    } catch (err) {
      console.log('⚠️  无法自动截取排行榜，请手动截图: 10-measure-ranking.png');
    }

    console.log('\n🎉 所有截图完成！');
    console.log(`📁 截图位置: ${OUTPUT_DIR}`);
    console.log('\n💡 下一步:');
    console.log('1. 查看截图，确认清晰度');
    console.log('2. 打开 docs/RECORDING-SCRIPT-PART1.md 查看录制脚本');
    console.log('3. 启动录屏软件，按照脚本录制');

  } catch (error) {
    console.error('❌ 截图过程出错:', error);
  } finally {
    // 不要立即关闭浏览器，让用户有时间查看
    console.log('\n⏳ 浏览器将在10秒后关闭...');
    await wait(10000);
    await browser.close();
  }
}

// 执行截图
captureScreenshots().catch(console.error);
