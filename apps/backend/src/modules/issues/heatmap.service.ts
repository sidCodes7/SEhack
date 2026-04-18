// ──────────────────────────────────────────────
// Heatmap Service — Location-based Issue Aggregation
// ──────────────────────────────────────────────
// Aggregates issues by (locationX, locationY) for
// rendering a campus issue heatmap on the frontend.

import { db } from '../../shared/db/neon.client.js';
import { issues } from '../../shared/db/schema.js';
import { sql, isNotNull, and } from 'drizzle-orm';

export interface HeatmapPoint {
  x: number;
  y: number;
  count: number;
  category: string | null;
}

/**
 * Get aggregated heatmap data.
 * Groups issues by rounded (locationX, locationY) coordinates and category.
 * Only includes issues that have location data.
 */
export async function getHeatmapData(): Promise<HeatmapPoint[]> {
  const results = await db
    .select({
      x: issues.locationX,
      y: issues.locationY,
      category: issues.category,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(issues)
    .where(
      and(
        isNotNull(issues.locationX),
        isNotNull(issues.locationY)
      )
    )
    .groupBy(issues.locationX, issues.locationY, issues.category);

  return results.map((row) => ({
    x: parseFloat(row.x as string),
    y: parseFloat(row.y as string),
    count: row.count,
    category: row.category,
  }));
}
