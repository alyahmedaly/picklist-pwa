import { logger } from "./logger.ts";

export const emit = (kind: string, data: Record<string, unknown> = {}) => {
    const message = data['message'] ?? '';
    logger.info(`[${kind}] ${message}`);
};