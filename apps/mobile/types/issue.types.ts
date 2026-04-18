export interface Issue {
  id: string;
  title: string;
  description?: string;
  category: string;
  building: string;
  status: 'open' | 'in_progress' | 'resolved';
  imageUrl?: string;
  reportedBy: string;
  createdAt: string;
}

export interface HeatmapDot {
  id: string;
  x: number;
  y: number;
  category: string;
  count: number;
}
