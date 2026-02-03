/**
 * Skill 2: Deployment Readiness Checker
 * 部署就绪检查器
 *
 * 功能：
 * - 检查 next.config.ts 生产优化配置
 * - 检查 .env.production 是否存在
 * - 检查 package.json engines 字段
 * - 验证 npm run build 是否成功
 * - 检查 package-lock.json 有效性
 * - 检查 .vercelignore 配置
 * - 检查 Git 状态
 * - 生成部署清单报告
 *
 * 使用：npm run check:deploy
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  passed: boolean;
  message: string;
  details?: string[];
  severity: 'error' | 'warning' | 'info';
}

interface DeploymentReport {
  checks: Map<string, CheckResult>;
  overallStatus: 'ready' | 'warning' | 'blocked';
  timestamp: string;
}

class DeploymentReadinessChecker {
  private projectRoot: string;
  private checks: Map<string, CheckResult>;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.checks = new Map();
  }

  /**
   * 执行所有检查
   */
  async runAllChecks(): Promise<DeploymentReport> {
    console.log('🔍 开始部署前检查...\n');

    await this.checkNextConfig();
    await this.checkEnvProduction();
    await this.checkPackageJson();
    await this.checkVercelIgnore();
    await this.checkPackageLock();
    await this.checkBuildSuccess();
    await this.checkGitStatus();
    await this.checkEnvironmentVariables();

    return this.generateReport();
  }

  /**
   * 检查 next.config.ts
   */
  private async checkNextConfig(): Promise<void> {
    const configPath = path.join(this.projectRoot, 'next.config.ts');

    if (!fs.existsSync(configPath)) {
      this.checks.set('next.config.ts', {
        passed: false,
        message: 'next.config.ts 不存在',
        severity: 'error',
        details: ['运行 npm run init:production 生成配置'],
      });
      return;
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const hasSourceMaps = content.includes('productionBrowserSourceMaps: false');
    const hasRemoveConsole = content.includes('removeConsole');
    const hasPoweredByHeader = content.includes('poweredByHeader: false');

    const details: string[] = [];
    if (!hasSourceMaps) details.push('⚠️  未禁用 Source Maps（代码保护不足）');
    if (!hasRemoveConsole) details.push('⚠️  未配置移除 console.log');
    if (!hasPoweredByHeader) details.push('⚠️  未移除 X-Powered-By header');

    this.checks.set('next.config.ts', {
      passed: hasSourceMaps && hasRemoveConsole && hasPoweredByHeader,
      message: details.length === 0 ? 'next.config.ts 配置正确' : 'next.config.ts 配置不完整',
      severity: details.length === 0 ? 'info' : 'warning',
      details: details.length > 0 ? details : undefined,
    });
  }

  /**
   * 检查 .env.production
   */
  private async checkEnvProduction(): Promise<void> {
    const envPath = path.join(this.projectRoot, '.env.production');

    if (!fs.existsSync(envPath)) {
      this.checks.set('.env.production', {
        passed: false,
        message: '.env.production 不存在',
        severity: 'error',
        details: ['运行 npm run init:production 生成环境变量模板'],
      });
      return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const hasEnv = content.includes('NEXT_PUBLIC_ENV');

    this.checks.set('.env.production', {
      passed: hasEnv,
      message: hasEnv ? '.env.production 存在' : '.env.production 配置不完整',
      severity: hasEnv ? 'info' : 'warning',
    });
  }

  /**
   * 检查 package.json
   */
  private async checkPackageJson(): Promise<void> {
    const packagePath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packagePath)) {
      this.checks.set('package.json', {
        passed: false,
        message: 'package.json 不存在',
        severity: 'error',
      });
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const hasEngines = !!packageJson.engines?.node;

    this.checks.set('package.json', {
      passed: hasEngines,
      message: hasEngines
        ? `Node.js 版本要求: ${packageJson.engines.node}`
        : '未设置 Node.js 版本要求',
      severity: hasEngines ? 'info' : 'warning',
      details: hasEngines ? undefined : ['建议添加 "engines": { "node": ">=18.17.0" }'],
    });
  }

  /**
   * 检查 .vercelignore
   */
  private async checkVercelIgnore(): Promise<void> {
    const ignorePath = path.join(this.projectRoot, '.vercelignore');

    if (!fs.existsSync(ignorePath)) {
      this.checks.set('.vercelignore', {
        passed: true,
        message: '.vercelignore 不存在（使用默认规则）',
        severity: 'info',
      });
      return;
    }

    const content = fs.readFileSync(ignorePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));

    // 检查是否过度配置（超过20行规则可能有问题）
    const isOverConfigured = lines.length > 20;

    this.checks.set('.vercelignore', {
      passed: !isOverConfigured,
      message: isOverConfigured
        ? '.vercelignore 配置可能过度（排除规则过多）'
        : '.vercelignore 配置合理',
      severity: isOverConfigured ? 'warning' : 'info',
      details: isOverConfigured ? ['过度配置可能导致部署失败，建议简化'] : undefined,
    });
  }

  /**
   * 检查 package-lock.json
   */
  private async checkPackageLock(): Promise<void> {
    const lockPath = path.join(this.projectRoot, 'package-lock.json');

    if (!fs.existsSync(lockPath)) {
      this.checks.set('package-lock.json', {
        passed: false,
        message: 'package-lock.json 不存在',
        severity: 'error',
        details: ['运行 npm install 生成 lock 文件'],
      });
      return;
    }

    try {
      const content = fs.readFileSync(lockPath, 'utf-8');
      JSON.parse(content); // 验证JSON格式

      this.checks.set('package-lock.json', {
        passed: true,
        message: 'package-lock.json 有效',
        severity: 'info',
      });
    } catch (error) {
      this.checks.set('package-lock.json', {
        passed: false,
        message: 'package-lock.json 格式错误',
        severity: 'error',
        details: ['删除后重新运行 npm install'],
      });
    }
  }

  /**
   * 检查构建是否成功
   */
  private async checkBuildSuccess(): Promise<void> {
    try {
      console.log('   正在执行构建测试（可能需要1-2分钟）...');

      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      this.checks.set('npm run build', {
        passed: true,
        message: '生产构建成功',
        severity: 'info',
      });
    } catch (error) {
      this.checks.set('npm run build', {
        passed: false,
        message: '生产构建失败',
        severity: 'error',
        details: ['检查构建错误日志并修复后重试'],
      });
    }
  }

  /**
   * 检查 Git 状态
   */
  private async checkGitStatus(): Promise<void> {
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      });

      const hasUncommitted = status.trim().length > 0;

      this.checks.set('Git 状态', {
        passed: !hasUncommitted,
        message: hasUncommitted ? '有未提交的文件' : 'Git 仓库干净',
        severity: hasUncommitted ? 'warning' : 'info',
        details: hasUncommitted ? ['部署前建议提交所有更改'] : undefined,
      });
    } catch (error) {
      this.checks.set('Git 状态', {
        passed: true,
        message: '未检测到 Git 仓库',
        severity: 'info',
      });
    }
  }

  /**
   * 检查环境变量提醒
   */
  private async checkEnvironmentVariables(): Promise<void> {
    const envPath = path.join(this.projectRoot, '.env.production');

    if (!fs.existsSync(envPath)) {
      return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const vars = content
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
      .map(line => line.split('=')[0].trim());

    this.checks.set('环境变量提醒', {
      passed: true,
      message: `需要在 Vercel Dashboard 中手动添加 ${vars.length} 个环境变量`,
      severity: 'info',
      details: vars.map(v => `  - ${v}`),
    });
  }

  /**
   * 生成报告
   */
  private generateReport(): DeploymentReport {
    console.log('\n' + '='.repeat(60));
    console.log('📊 部署检查报告');
    console.log('='.repeat(60) + '\n');

    let hasErrors = false;
    let hasWarnings = false;

    this.checks.forEach((result, name) => {
      const icon = result.severity === 'error' ? '❌' :
                   result.severity === 'warning' ? '⚠️' : '✅';

      console.log(`${icon} ${name}: ${result.message}`);

      if (result.details) {
        result.details.forEach(detail => {
          console.log(`   ${detail}`);
        });
      }
      console.log();

      if (result.severity === 'error') hasErrors = true;
      if (result.severity === 'warning') hasWarnings = true;
    });

    const overallStatus = hasErrors ? 'blocked' : hasWarnings ? 'warning' : 'ready';

    console.log('='.repeat(60));

    if (overallStatus === 'ready') {
      console.log('✅ 所有检查通过，可以部署！\n');
      this.printDeploymentSteps();
    } else if (overallStatus === 'warning') {
      console.log('⚠️  存在警告，建议修复后再部署\n');
    } else {
      console.log('❌ 存在错误，必须修复后才能部署\n');
    }

    return {
      checks: this.checks,
      overallStatus,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 打印部署步骤
   */
  private printDeploymentSteps(): void {
    console.log('📋 部署步骤：\n');
    console.log('1. 提交代码到 Git：');
    console.log('   git add .');
    console.log('   git commit -m "feat: 准备生产部署"');
    console.log('   git push origin main\n');
    console.log('2. 访问 Vercel Dashboard：https://vercel.com');
    console.log('3. 导入 GitHub 仓库');
    console.log('4. 配置环境变量（参考上面的环境变量提醒）');
    console.log('5. 点击 Deploy\n');
  }
}

/**
 * CLI入口
 */
async function main() {
  const projectRoot = process.cwd();

  const checker = new DeploymentReadinessChecker(projectRoot);

  try {
    const report = await checker.runAllChecks();

    // 如果有错误，退出码为1
    process.exit(report.overallStatus === 'blocked' ? 1 : 0);
  } catch (error) {
    console.error('❌ 检查过程中发生错误：', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { DeploymentReadinessChecker };
