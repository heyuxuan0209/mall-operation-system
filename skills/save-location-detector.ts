/**
 * 保存位置检测器（Save Location Detector）
 *
 * 功能：判断文件应该保存到项目内部还是外部文档
 *
 * 复用场景：
 * - 工作流自动化中的文件保存决策
 * - CLI工具的智能保存建议
 * - IDE扩展的自动分类
 * - 文档管理系统的路径推荐
 *
 * ## 判断规则
 *
 * ### Internal (项目内部)
 * - **源码文件**: .tsx, .ts, .js, .jsx, .css, .scss, .json
 * - **项目路径**: app/, components/, skills/, utils/, lib/, hooks/, types/
 * - **项目文档**: README.md, CONTEXT.md, VERSION.md, CHANGELOG.md
 * - **配置文件**: package.json, tsconfig.json, next.config.js, .env*
 * - **测试文件**: __tests__/, .test., .spec.
 *
 * ### External (外部文档)
 * - **外部路径**: /Desktop/, /Documents/, /Downloads/, /Users/
 * - **教程文档**: 包含"教程"、"tutorial"、"笔记"、"note"等关键词
 * - **总结报告**: 包含"总结"、"草稿"、"draft"、"summary"等
 * - **博客文章**: 包含"小红书"、"博客"、"blog"、"article"等
 *
 * @version 1.0
 * @created 2026-01-29
 */

export type SaveLocation = 'internal' | 'external' | 'unknown';

export type ContentType =
  | 'source-code'
  | 'test-code'
  | 'config'
  | 'project-doc'
  | 'tutorial'
  | 'blog'
  | 'note'
  | 'summary'
  | 'unknown';

export interface DetectionOptions {
  filePath?: string;
  fileName?: string;
  fileExtension?: string;
  content?: string;
  projectRoot?: string;
}

export interface LocationDetectionResult {
  location: SaveLocation;
  contentType: ContentType;
  confidence: number; // 0-100
  reasoning: string[];
  suggestions: string[];
}

/**
 * 从文件名推断扩展名
 *
 * @param fileName - 文件名
 * @returns 文件扩展名（小写，不含点）
 */
function inferExtension(fileName: string): string {
  const match = fileName.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * 从扩展名推断内容类型
 *
 * @param extension - 文件扩展名
 * @returns 内容类型
 */
export function inferContentTypeFromExtension(extension: string): ContentType {
  const ext = extension.toLowerCase();

  // 源码文件
  const sourceExtensions = ['tsx', 'ts', 'js', 'jsx', 'css', 'scss', 'sass', 'less'];
  if (sourceExtensions.includes(ext)) {
    return 'source-code';
  }

  // 配置文件
  const configExtensions = ['json', 'yaml', 'yml', 'toml', 'ini', 'env'];
  if (configExtensions.includes(ext)) {
    return 'config';
  }

  // Markdown可能是项目文档或教程
  if (ext === 'md') {
    return 'project-doc'; // 默认假设是项目文档，后续根据路径和内容判断
  }

  return 'unknown';
}

/**
 * 判断路径是否属于项目内部
 *
 * @param filePath - 文件路径
 * @returns 是否为项目内部路径
 */
export function isProjectInternalPath(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');

  // 项目内部路径特征
  const internalPatterns = [
    '/app/',
    '/components/',
    '/skills/',
    '/utils/',
    '/lib/',
    '/hooks/',
    '/types/',
    '/styles/',
    '/public/',
    '/__tests__/',
    '/tests/',
    '/docs/api/',
    '/docs/architecture/',
    '/docs/features/',
    '/docs/guides/',
    '/docs/standards/',
  ];

  return internalPatterns.some(pattern => normalizedPath.includes(pattern));
}

/**
 * 判断路径是否属于外部路径
 *
 * @param filePath - 文件路径
 * @returns 是否为外部路径
 */
function isExternalPath(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');

  // 外部路径特征
  const externalPatterns = [
    '/desktop/',
    '/documents/',
    '/downloads/',
    '/users/',
    '桌面',
    '文档',
    '下载',
  ];

  return externalPatterns.some(pattern => normalizedPath.includes(pattern));
}

/**
 * 判断文件名是否为项目文档
 *
 * @param fileName - 文件名
 * @returns 是否为项目文档
 */
function isProjectDocumentName(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  const projectDocs = [
    'readme.md',
    'context.md',
    'version.md',
    'changelog.md',
    'contributing.md',
    'license.md',
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'next.config.ts',
    '.gitignore',
    '.env',
    '.env.local',
    '.env.example',
  ];

  return projectDocs.includes(lowerName) || lowerName.startsWith('.env');
}

/**
 * 判断文件名是否为测试文件
 *
 * @param fileName - 文件名
 * @returns 是否为测试文件
 */
function isTestFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return (
    lowerName.includes('.test.') ||
    lowerName.includes('.spec.') ||
    lowerName.includes('__tests__')
  );
}

/**
 * 从内容判断是否为项目相关内容
 *
 * @param content - 文件内容
 * @returns 是否为项目内容
 */
export function isProjectContent(content: string): boolean {
  // 检查是否包含代码特征
  const codePatterns = [
    /^import\s+/m,
    /^export\s+/m,
    /function\s+\w+\(/,
    /const\s+\w+\s*=/,
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /<[\w-]+>/,  // JSX标签
    /from\s+['"][@./]/,  // import语句
  ];

  return codePatterns.some(pattern => pattern.test(content));
}

/**
 * 从内容判断是否为外部教程/笔记
 *
 * @param content - 文件内容
 * @returns 是否为外部内容
 */
function isExternalContent(content: string): boolean {
  const lowerContent = content.toLowerCase();

  // 教程/笔记关键词
  const externalKeywords = [
    '教程',
    'tutorial',
    '笔记',
    'note',
    '总结',
    'summary',
    '草稿',
    'draft',
    '小红书',
    '博客',
    'blog',
    'article',
    '文章',
    '学习',
    'learning',
    '实战',
  ];

  return externalKeywords.some(keyword => lowerContent.includes(keyword));
}

/**
 * 从内容推断内容类型
 *
 * @param content - 文件内容
 * @returns 内容类型
 */
function inferContentTypeFromContent(content: string): ContentType | null {
  if (isProjectContent(content)) {
    return 'source-code';
  }

  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('教程') || lowerContent.includes('tutorial')) {
    return 'tutorial';
  }

  if (lowerContent.includes('小红书') || lowerContent.includes('博客') || lowerContent.includes('blog')) {
    return 'blog';
  }

  if (lowerContent.includes('笔记') || lowerContent.includes('note')) {
    return 'note';
  }

  if (lowerContent.includes('总结') || lowerContent.includes('summary')) {
    return 'summary';
  }

  return null;
}

/**
 * 获取位置描述
 *
 * @param location - 保存位置
 * @returns 位置描述
 */
export function getLocationDescription(location: SaveLocation): string {
  const descriptions: Record<SaveLocation, string> = {
    internal: '项目内部（git管理）',
    external: '外部文档（独立保存）',
    unknown: '未知位置（需要更多信息）',
  };
  return descriptions[location];
}

/**
 * 生成保存建议
 *
 * @param location - 保存位置
 * @param contentType - 内容类型
 * @returns 保存建议列表
 */
function generateSuggestions(location: SaveLocation, contentType: ContentType): string[] {
  if (location === 'internal') {
    const suggestions = ['建议保存到项目目录内'];

    if (contentType === 'source-code') {
      suggestions.push('使用 git commit 提交变更');
    } else if (contentType === 'test-code') {
      suggestions.push('保存到 __tests__/ 或同级目录');
    } else if (contentType === 'config') {
      suggestions.push('保存到项目根目录');
    } else if (contentType === 'project-doc') {
      suggestions.push('保存到项目根目录或 docs/ 目录');
    }

    return suggestions;
  }

  if (location === 'external') {
    const suggestions = ['建议保存到外部文档目录'];

    if (contentType === 'tutorial') {
      suggestions.push('推荐路径: ~/Desktop/教程/ 或 ~/Documents/学习笔记/');
    } else if (contentType === 'blog') {
      suggestions.push('推荐路径: ~/Desktop/博客文章/ 或专门的博客目录');
    } else if (contentType === 'note') {
      suggestions.push('推荐路径: ~/Documents/笔记/ 或笔记软件');
    } else if (contentType === 'summary') {
      suggestions.push('推荐路径: ~/Documents/总结/ 或项目文档');
    }

    return suggestions;
  }

  return ['无法确定最佳保存位置，请手动指定'];
}

/**
 * 检测保存位置
 *
 * 主入口函数，综合判断文件应该保存到哪里
 *
 * @param options - 检测选项
 * @returns 位置检测结果
 *
 * @example
 * ```typescript
 * // 基于文件路径检测
 * const result1 = detectSaveLocation({
 *   filePath: '/project/app/page.tsx'
 * });
 * // => { location: 'internal', contentType: 'source-code', confidence: 95 }
 *
 * // 基于文件名和内容检测
 * const result2 = detectSaveLocation({
 *   fileName: '小红书教程.md',
 *   content: '# Claude Code 实战教程\n...'
 * });
 * // => { location: 'external', contentType: 'tutorial', confidence: 90 }
 * ```
 */
export function detectSaveLocation(options: DetectionOptions): LocationDetectionResult {
  const {
    filePath = '',
    fileName = '',
    fileExtension = '',
    content = '',
  } = options;

  const reasoning: string[] = [];
  let location: SaveLocation = 'unknown';
  let contentType: ContentType = 'unknown';
  let confidence = 0;

  // 推断文件名和扩展名
  const actualFileName = fileName || (filePath ? filePath.split('/').pop() || '' : '');
  const actualExtension = fileExtension || inferExtension(actualFileName);

  // 1. 从扩展名推断内容类型
  if (actualExtension) {
    const extType = inferContentTypeFromExtension(actualExtension);
    if (extType !== 'unknown') {
      contentType = extType;
      reasoning.push(`文件扩展名 .${actualExtension} 识别为 ${contentType}`);
      confidence += 20;
    }
  }

  // 2. 检查是否为项目文档
  if (actualFileName && isProjectDocumentName(actualFileName)) {
    location = 'internal';
    contentType = contentType === 'unknown' ? 'project-doc' : contentType;
    reasoning.push(`文件名 ${actualFileName} 是项目核心文档`);
    confidence += 30;
  }

  // 3. 检查是否为测试文件
  if (actualFileName && isTestFile(actualFileName)) {
    location = 'internal';
    contentType = 'test-code';
    reasoning.push(`文件名 ${actualFileName} 是测试文件`);
    confidence += 30;
  }

  // 4. 从路径判断
  if (filePath) {
    if (isProjectInternalPath(filePath)) {
      location = 'internal';
      reasoning.push(`路径包含项目内部目录`);
      confidence += 30;
    } else if (isExternalPath(filePath)) {
      location = 'external';
      reasoning.push(`路径属于外部目录（Desktop/Documents等）`);
      confidence += 30;
    }
  }

  // 5. 从内容判断
  if (content) {
    const contentBasedType = inferContentTypeFromContent(content);
    if (contentBasedType) {
      contentType = contentBasedType;
      reasoning.push(`内容特征识别为 ${contentType}`);
      confidence += 25;

      // 根据内容类型调整位置判断
      if (['tutorial', 'blog', 'note', 'summary'].includes(contentType)) {
        if (location === 'unknown') {
          location = 'external';
          reasoning.push(`${contentType} 类型通常保存在外部`);
          confidence += 15;
        }
      } else if (contentType === 'source-code') {
        if (location === 'unknown') {
          location = 'internal';
          reasoning.push(`源码应保存在项目内部`);
          confidence += 20;
        }
      }
    }
  }

  // 6. 特殊规则：Markdown文件需要额外判断
  if (actualExtension === 'md') {
    if (location === 'unknown') {
      // 如果还不确定，根据内容判断
      if (content && isExternalContent(content)) {
        location = 'external';
        reasoning.push(`Markdown内容包含教程/笔记关键词`);
        confidence += 20;
      } else if (!content) {
        // 没有内容，无法判断
        reasoning.push(`Markdown文件需要查看内容才能确定位置`);
      }
    }
  }

  // 确保confidence不超过100
  confidence = Math.min(100, confidence);

  // 如果仍然未知，提供默认推理
  if (location === 'unknown') {
    reasoning.push('信息不足，无法确定保存位置');
    confidence = 0;
  }

  const suggestions = generateSuggestions(location, contentType);

  return {
    location,
    contentType,
    confidence,
    reasoning,
    suggestions,
  };
}

/**
 * 批量检测多个文件的保存位置
 *
 * @param fileOptions - 文件选项列表
 * @returns 检测结果列表
 */
export function detectMultipleSaveLocations(
  fileOptions: DetectionOptions[]
): LocationDetectionResult[] {
  return fileOptions.map(options => detectSaveLocation(options));
}

/**
 * 获取建议的保存路径
 *
 * @param result - 位置检测结果
 * @param projectRoot - 项目根目录
 * @returns 建议的保存路径
 */
export function getSuggestedPath(
  result: LocationDetectionResult,
  projectRoot: string = process.cwd()
): string | null {
  if (result.location === 'internal') {
    if (result.contentType === 'source-code') {
      return `${projectRoot}/components/`;
    } else if (result.contentType === 'test-code') {
      return `${projectRoot}/__tests__/`;
    } else if (result.contentType === 'config') {
      return `${projectRoot}/`;
    } else if (result.contentType === 'project-doc') {
      return `${projectRoot}/docs/`;
    }
  }

  if (result.location === 'external') {
    if (result.contentType === 'tutorial') {
      return '~/Desktop/教程/';
    } else if (result.contentType === 'blog') {
      return '~/Desktop/博客文章/';
    } else if (result.contentType === 'note') {
      return '~/Documents/笔记/';
    }
  }

  return null;
}
