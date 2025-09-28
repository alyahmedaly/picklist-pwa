import type { ConsolaInstance } from 'consola';

export async function cleanupOutputDirectory(cleanOutput: boolean, outDir: string, logMode: string, logger: ConsolaInstance) {
  if (cleanOutput !== false) {
    const { rmSync, readdirSync } = await import('node:fs');
    try {
      const files = readdirSync(outDir);
      const filesToClean = files.filter(file => file.endsWith('.jsonl') ||
        file.endsWith('.json') ||
        file.endsWith('.md') ||
        file.endsWith('.db') ||
        file.endsWith('.sqlite') ||
        file.endsWith('.sqlite3')
      );

      if (filesToClean.length > 0) {
        for (const file of filesToClean) {
          rmSync(`${outDir}/${file}`, { force: true });
        }
        if (logMode === 'human') {
          logger.info(`[clean-output] Cleaned ${filesToClean.length} files from output directory`);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore errors during cleanup - directory might be empty or files might not exist
    }
  }
}
