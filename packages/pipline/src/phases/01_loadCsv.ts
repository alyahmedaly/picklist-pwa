import { calculateSparsity } from '@picklist/core';
import { transformCSV } from '@picklist/parser';
import { emit } from '../utils/emit.ts';
import { stats } from '../utils/stats.ts';
import { join } from 'node:path';
import { writeSchemaDoc } from '../../../../src/data/transform/writer.ts';

export function loadCsv(inputPath: string, outDir: string) {
    const { headers, matrix, rows } = transformCSV(inputPath);

    const sparsity = calculateSparsity(rows as Record<string, string>[]);
    emit('sparsity-scan', {
        excluded: sparsity.emptyColumns.length,
        message: `Analyzed ${headers.length} columns, excluding ${sparsity.emptyColumns.length} sparse columns`,
    });
    stats.noteExcludedColumns(sparsity.emptyColumns);

    emit('writing-schema', { message: 'Writing schema.md documentation' });

    const schemaDocPath = join(outDir, 'schema.md');
    writeSchemaDoc(schemaDocPath, {
        excludedColumns: sparsity.emptyColumns,
        ordering: 'id_then_name',
    });

    emit('processing-start', {
        rows: matrix.length,
        message: `Processing ${matrix.length} product rows`,
    });

    return {
        headers,
        matrix,
        rows
    }
}