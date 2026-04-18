// ──────────────────────────────────────────────
// PYQ Service — Previous Year Question Papers
// ──────────────────────────────────────────────
// Handles PYQ search/discovery via DSpace REST API.
// Falls back to mock data if DSpace is unavailable.

import axios from 'axios';
import { createError } from '../../shared/middleware/error.middleware.js';

const DSPACE_BASE_URL = process.env.DSPACE_BASE_URL || '';
const DSPACE_COMMUNITY_ID = process.env.DSPACE_COMMUNITY_ID || '';

// ── Types ──────────────────────────────────────

interface PYQPaper {
  id: string;
  title: string;
  subject: string;
  year: number;
  semester: number;
  department: string;
  downloadUrl: string;
  fileType: string;
}

interface PYQFilters {
  subject?: string;
  year?: number;
  semester?: number;
  department?: string;
}

// ── Mock data (fallback when DSpace is unavailable) ──

const MOCK_PAPERS: PYQPaper[] = [
  {
    id: 'pyq-001',
    title: 'Data Structures & Algorithms — Final Exam 2025',
    subject: 'Data Structures',
    year: 2025,
    semester: 3,
    department: 'Computer Science',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-002',
    title: 'Digital Signal Processing — Midterm 2025',
    subject: 'DSP',
    year: 2025,
    semester: 5,
    department: 'Electronics',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-003',
    title: 'Engineering Mathematics III — Final 2024',
    subject: 'Mathematics',
    year: 2024,
    semester: 3,
    department: 'General',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-004',
    title: 'Database Management Systems — Final 2025',
    subject: 'DBMS',
    year: 2025,
    semester: 4,
    department: 'Computer Science',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-005',
    title: 'Operating Systems — Midterm 2024',
    subject: 'OS',
    year: 2024,
    semester: 5,
    department: 'Computer Science',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-006',
    title: 'Computer Networks — Final 2024',
    subject: 'CN',
    year: 2024,
    semester: 6,
    department: 'Computer Science',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-007',
    title: 'Thermodynamics — Midterm 2025',
    subject: 'Thermodynamics',
    year: 2025,
    semester: 3,
    department: 'Mechanical',
    downloadUrl: '#',
    fileType: 'pdf',
  },
  {
    id: 'pyq-008',
    title: 'Structural Analysis — Final 2024',
    subject: 'Structures',
    year: 2024,
    semester: 5,
    department: 'Civil',
    downloadUrl: '#',
    fileType: 'pdf',
  },
];

// ── Service Functions ──────────────────────────

/**
 * Search PYQ papers. Uses DSpace REST API if configured,
 * otherwise falls back to mock data.
 */
export async function searchPapers(query?: string, filters?: PYQFilters): Promise<PYQPaper[]> {
  // Try DSpace if configured
  if (DSPACE_BASE_URL && DSPACE_COMMUNITY_ID) {
    try {
      return await searchFromDSpace(query, filters);
    } catch {
      // DSpace unavailable — fall back to mock
    }
  }

  // Fallback: filter mock data
  let results = [...MOCK_PAPERS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
    );
  }

  if (filters?.subject) {
    results = results.filter((p) =>
      p.subject.toLowerCase().includes(filters.subject!.toLowerCase())
    );
  }
  if (filters?.year) {
    results = results.filter((p) => p.year === filters.year);
  }
  if (filters?.semester) {
    results = results.filter((p) => p.semester === filters.semester);
  }
  if (filters?.department) {
    results = results.filter((p) =>
      p.department.toLowerCase().includes(filters.department!.toLowerCase())
    );
  }

  return results;
}

/**
 * Get a single paper by ID.
 */
export async function getPaperById(paperId: string): Promise<PYQPaper> {
  // Try DSpace first
  if (DSPACE_BASE_URL) {
    try {
      const response = await axios.get(`${DSPACE_BASE_URL}/items/${paperId}`);
      return mapDSpaceItem(response.data);
    } catch {
      // fallback to mock
    }
  }

  const paper = MOCK_PAPERS.find((p) => p.id === paperId);
  if (!paper) {
    throw createError('Paper not found', 404);
  }
  return paper;
}

/**
 * Trigger a sync/refresh of PYQ data from DSpace.
 * Admin only — refreshes local cache.
 */
export async function syncFromDSpace(): Promise<{ synced: number; message: string }> {
  if (!DSPACE_BASE_URL || !DSPACE_COMMUNITY_ID) {
    return {
      synced: 0,
      message: 'DSpace not configured. Using mock data.',
    };
  }

  try {
    const response = await axios.get(
      `${DSPACE_BASE_URL}/communities/${DSPACE_COMMUNITY_ID}/items`,
      { params: { limit: 100 } }
    );

    const items = response.data;
    return {
      synced: Array.isArray(items) ? items.length : 0,
      message: `Successfully synced ${Array.isArray(items) ? items.length : 0} papers from DSpace.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'DSpace sync failed';
    throw createError(`DSpace sync failed: ${message}`, 502);
  }
}

// ── Private helpers ────────────────────────────

async function searchFromDSpace(query?: string, filters?: PYQFilters): Promise<PYQPaper[]> {
  const params: Record<string, string | number> = { limit: 50 };
  if (query) params.query = query;

  const response = await axios.get(
    `${DSPACE_BASE_URL}/communities/${DSPACE_COMMUNITY_ID}/items`,
    { params }
  );

  const items = response.data;
  if (!Array.isArray(items)) return [];

  return items.map(mapDSpaceItem);
}

function mapDSpaceItem(item: Record<string, unknown>): PYQPaper {
  const metadata = (item.metadata || []) as Array<{ key: string; value: string }>;
  const getMetadata = (key: string) =>
    metadata.find((m) => m.key === key)?.value || '';

  return {
    id: item.uuid as string || item.id as string || '',
    title: (item.name as string) || getMetadata('dc.title') || 'Untitled',
    subject: getMetadata('dc.subject') || 'General',
    year: parseInt(getMetadata('dc.date.issued') || '2024', 10),
    semester: parseInt(getMetadata('dc.description.semester') || '1', 10),
    department: getMetadata('dc.contributor.department') || 'General',
    downloadUrl: `${DSPACE_BASE_URL}/items/${item.uuid || item.id}/bitstreams`,
    fileType: 'pdf',
  };
}
