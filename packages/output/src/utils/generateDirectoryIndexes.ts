import type { CategoryDirectoryGroup, DirectoryIndex } from '@picklist/types';
import * as fs from 'node:fs';
import * as path from 'path';
import { formatDisplayName } from './formatDisplayName.ts';

/**
 * Generates directory-level indexes for nested category navigation.
 * Creates index.json files at each directory level to support hierarchical browsing.
 *
 * @param groups - Category directory groups
 * @param baseCategoryDir - Base category directory path
 */


export async function generateDirectoryIndexes(
  groups: CategoryDirectoryGroup[],
  baseCategoryDir: string
): Promise<void> {
  // Group by directory path to create directory-level indexes
  const directoryMap = new Map<string, {
    subdirectories: Set<string>;
    files: CategoryDirectoryGroup[];
    categoryPath: string;
  }>();

  // Build directory structure map
  for (const group of groups) {
    const dirPath = group.directoryPath;

    if (!directoryMap.has(dirPath)) {
      directoryMap.set(dirPath, {
        subdirectories: new Set(),
        files: [],
        categoryPath: group.categoryPath.split(' > ').slice(0, -1).join(' > '),
      });
    }

    directoryMap.get(dirPath)!.files.push(group);

    // Track parent directories and their subdirectories
    const pathParts = dirPath.split('/').filter(part => part.length > 0);
    for (let i = 0; i < pathParts.length; i++) {
      const parentPath = pathParts.slice(0, i).join('/');
      const childDir = pathParts[i];

      if (!directoryMap.has(parentPath)) {
        directoryMap.set(parentPath, {
          subdirectories: new Set(),
          files: [],
          categoryPath: '',
        });
      }

      if (i > 0) {
        directoryMap.get(parentPath)!.subdirectories.add(childDir);
      }
    }
  }

  // Generate index files for each directory
  for (const [dirPath, dirInfo] of Array.from(directoryMap.entries())) {
    if (dirInfo.files.length === 0 && dirInfo.subdirectories.size === 0) continue;

    const indexPath = path.join(baseCategoryDir, dirPath, 'index.json');
    const indexDir = path.dirname(indexPath);

    fs.mkdirSync(indexDir, { recursive: true });

    const subdirectories = Array.from(dirInfo.subdirectories).map(name => {
      const subdirGroups = groups.filter(g => g.directoryPath.startsWith(dirPath + '/' + name));
      const productCount = subdirGroups.reduce((sum, g) => sum + g.productCount, 0);
      const hasSubdirectories = subdirGroups.some(g => g.directoryPath !== dirPath + '/' + name);

      return {
        name,
        displayName: formatDisplayName(name),
        productCount,
        hasSubdirectories,
        indexPath: `${name}/index.json`,
      };
    }).sort((a, b) => b.productCount - a.productCount);

    const files = dirInfo.files.map(group => ({
      name: group.fileName,
      displayName: formatDisplayName(group.fileName),
      productCount: group.productCount,
      filePath: `${group.fileName}.jsonl`,
      indexPath: `${group.fileName}-index.json`,
      statsPath: `${group.fileName}-stats.json`,
      averageProtein: Math.round((group.products.reduce((sum, p) => sum + (p.nutrition?.protein || 0), 0) / group.products.length) * 10) / 10,
      halalCompliance: Math.round((group.products.filter(p => p.halalCheck?.status === 'halal').length / group.products.length) * 100),
    })).sort((a, b) => b.productCount - a.productCount);

    const totalProducts = dirInfo.files.reduce((sum, g) => sum + g.productCount, 0) +
      subdirectories.reduce((sum, s) => sum + s.productCount, 0);

    // Check if aggregated file exists for this directory
    const aggregatedFilePath = path.join(baseCategoryDir, dirPath, 'complete-collection.jsonl');
    const hasAggregatedFile = fs.existsSync(aggregatedFilePath);
    const hasMultipleItems = dirInfo.files.length > 1 || subdirectories.length > 0;

    // Generate navigation breadcrumbs
    const pathParts = dirPath.split('/').filter(p => p.length > 0);
    const breadcrumbLinks = [];

    // Add breadcrumb for each parent level
    for (let i = 0; i < pathParts.length; i++) {
      const partName = formatDisplayName(pathParts[i]);
      const relativePath = '../'.repeat(pathParts.length - i - 1) + 'index.json';
      breadcrumbLinks.push({ name: partName, path: relativePath });
    }

    const directoryIndex: DirectoryIndex = {
      categoryPath: dirInfo.categoryPath,
      breadcrumbs: dirInfo.categoryPath,
      subdirectories,
      files,
      totalProducts,
      aggregatedFile: hasAggregatedFile && hasMultipleItems ? {
        name: 'complete-collection',
        filePath: 'complete-collection.jsonl',
        productCount: totalProducts,
        displayName: 'Complete Collection'
      } : undefined,
      navigation: {
        parentPath: dirPath.includes('/') ? '../index.json' : undefined,
        rootPath: '../'.repeat(pathParts.length) + 'index.json',
        breadcrumbLinks,
      },
      metadata: {
        depth: pathParts.length,
        parentPath: dirPath.includes('/') ? path.dirname(dirPath) : undefined,
      },
    };

    fs.writeFileSync(indexPath, JSON.stringify(directoryIndex, null, 2));
  }
}
