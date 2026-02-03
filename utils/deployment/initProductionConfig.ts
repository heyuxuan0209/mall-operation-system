/**
 * Skill 1: Production Config Generator
 * 生产环境配置生成器
 *
 * 功能：
 * - 自动生成 next.config.ts（生产优化版）
 * - 自动生成 .env.production（环境变量模板）
 * - 自动生成 .vercelignore（最佳实践版）
 * - 自动在 package.json 中添加 engines 字段
 *
 * 使用：npm run init:production
 */

import fs from 'fs';
import path from 'path';

interface Config {
  projectRoot: string;
  nodeVersion?: string;
  skipExisting?: boolean;
}

const DEFAULT_NODE_VERSION = '>=18.17.0';

class ProductionConfigGenerator {
  private projectRoot: string;
  private nodeVersion: string;
  private skipExisting: boolean;
  private templatesDir: string;

  constructor(config: Config) {
    this.projectRoot = config.projectRoot;
    this.nodeVersion = config.nodeVersion || DEFAULT_NODE_VERSION;
    this.skipExisting = config.skipExisting ?? true;
    this.templatesDir = path.join(__dirname, 'templates');
  }

  /**
   * 执行所有配置生成
   */
  async generate(): Promise<void> {
    console.log('🚀 开始生成生产环境配置...\n');

    await this.generateNextConfig();
    await this.generateEnvProduction();
    await this.generateVercelIgnore();
    await this.updatePackageJson();

    console.log('\n✅ 生产环境配置生成完成！\n');
    this.printNextSteps();
  }

  /**
   * 生成 next.config.ts
   */
  private async generateNextConfig(): Promise<void> {
    const targetPath = path.join(this.projectRoot, 'next.config.ts');

    if (fs.existsSync(targetPath) && this.skipExisting) {
      console.log('⚠️  next.config.ts 已存在，跳过生成');
      console.log('   提示：如需覆盖，请先删除现有文件\n');
      return;
    }

    const templatePath = path.join(this.templatesDir, 'next.config.template.ts');
    const template = fs.readFileSync(templatePath, 'utf-8');

    fs.writeFileSync(targetPath, template);
    console.log('✅ 已生成 next.config.ts');
    console.log('   - 禁用 Source Maps（代码保护）');
    console.log('   - 移除 console.log（生产优化）');
    console.log('   - 移除 X-Powered-By（安全增强）\n');
  }

  /**
   * 生成 .env.production
   */
  private async generateEnvProduction(): Promise<void> {
    const targetPath = path.join(this.projectRoot, '.env.production');

    if (fs.existsSync(targetPath) && this.skipExisting) {
      console.log('⚠️  .env.production 已存在，跳过生成');
      console.log('   提示：如需覆盖，请先删除现有文件\n');
      return;
    }

    const templatePath = path.join(this.templatesDir, 'env.production.template');
    const template = fs.readFileSync(templatePath, 'utf-8');

    fs.writeFileSync(targetPath, template);
    console.log('✅ 已生成 .env.production');
    console.log('   - NEXT_PUBLIC_ENV=production');
    console.log('   - NEXT_PUBLIC_DEMO_MODE=true');
    console.log('   ⚠️  请根据项目需求修改环境变量\n');
  }

  /**
   * 生成 .vercelignore
   */
  private async generateVercelIgnore(): Promise<void> {
    const targetPath = path.join(this.projectRoot, '.vercelignore');

    if (fs.existsSync(targetPath) && this.skipExisting) {
      console.log('⚠️  .vercelignore 已存在，跳过生成');
      console.log('   提示：如需覆盖，请先删除现有文件\n');
      return;
    }

    const templatePath = path.join(this.templatesDir, 'vercelignore.template');
    const template = fs.readFileSync(templatePath, 'utf-8');

    fs.writeFileSync(targetPath, template);
    console.log('✅ 已生成 .vercelignore');
    console.log('   - 排除 docs/ 目录');
    console.log('   - 排除 IDE 配置文件');
    console.log('   - 采用最佳实践（避免过度配置）\n');
  }

  /**
   * 更新 package.json 添加 engines 字段
   */
  private async updatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ 未找到 package.json\n');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.engines?.node) {
      console.log('⚠️  package.json 中已存在 engines.node 配置');
      console.log(`   当前值: ${packageJson.engines.node}\n`);
      return;
    }

    packageJson.engines = {
      ...packageJson.engines,
      node: this.nodeVersion,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ 已更新 package.json');
    console.log(`   - 添加 engines.node: "${this.nodeVersion}"\n`);
  }

  /**
   * 打印下一步操作提示
   */
  private printNextSteps(): void {
    console.log('📋 下一步操作：\n');
    console.log('1. 检查并修改 .env.production 中的环境变量');
    console.log('2. 测试生产构建：npm run build');
    console.log('3. 运行部署检查：npm run check:deploy');
    console.log('4. 提交代码：git add . && git commit -m "feat: 配置生产环境"');
    console.log('5. 推送到GitHub：git push origin main');
    console.log('6. 在Vercel中部署项目\n');
  }
}

/**
 * CLI入口
 */
async function main() {
  const projectRoot = process.cwd();

  const generator = new ProductionConfigGenerator({
    projectRoot,
    nodeVersion: DEFAULT_NODE_VERSION,
    skipExisting: true,
  });

  try {
    await generator.generate();
    process.exit(0);
  } catch (error) {
    console.error('❌ 生成配置时发生错误：', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProductionConfigGenerator };
