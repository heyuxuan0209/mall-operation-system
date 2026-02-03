#!/usr/bin/env node

const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

async function convertMdToPdf() {
  // 获取命令行参数
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('错误：请提供Markdown文件路径');
    console.log('用法: md-to-pdf <input.md> [output.pdf]');
    console.log('示例: md-to-pdf resume.md');
    console.log('示例: md-to-pdf docs/resume.md output/resume.pdf');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);

  // 检查输入文件是否存在
  if (!fs.existsSync(inputPath)) {
    console.error(`错误：文件不存在 - ${inputPath}`);
    process.exit(1);
  }

  // 确定输出路径
  let outputPath;
  if (args[1]) {
    outputPath = path.resolve(args[1]);
  } else {
    const dir = path.dirname(inputPath);
    const filename = path.basename(inputPath, '.md');
    outputPath = path.join(dir, `${filename}.pdf`);
  }

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📄 输入文件: ${inputPath}`);
  console.log(`📋 输出文件: ${outputPath}`);
  console.log('🔄 正在转换...\n');

  try {
    await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        launch_options: {
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        css: `
          body {
            font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.5;
            max-width: 750px;
            margin: 0 auto;
            padding: 15px 20px;
            font-size: 13px;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 8px;
          }
          h2 {
            font-size: 18px;
            margin-top: 16px;
            margin-bottom: 8px;
            border-bottom: 1px solid #333;
            padding-bottom: 4px;
          }
          h3 {
            font-size: 15px;
            margin-top: 12px;
            margin-bottom: 6px;
          }
          p {
            margin: 6px 0;
            font-size: 13px;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          ul {
            margin: 8px 0;
            padding-left: 18px;
          }
          li {
            margin: 4px 0;
            font-size: 13px;
          }
          hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 8px 0;
          }
          strong {
            font-weight: 600;
          }
          code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
          }
          pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
          }
          blockquote {
            border-left: 3px solid #ddd;
            padding-left: 15px;
            margin-left: 0;
            color: #666;
          }
        `,
        pdf_options: {
          format: 'A4',
          margin: {
            top: '15mm',
            bottom: '15mm',
            left: '18mm',
            right: '18mm'
          },
          printBackground: true
        }
      }
    );

    // 获取生成的PDF信息
    const stats = fs.statSync(outputPath);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log('✅ PDF生成成功！');
    console.log(`📊 文件大小: ${fileSizeInKB} KB`);
    console.log(`📍 保存位置: ${outputPath}`);

  } catch (error) {
    console.error('❌ PDF生成失败:', error.message);
    if (error.stack) {
      console.error('\n详细错误信息:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

convertMdToPdf();
