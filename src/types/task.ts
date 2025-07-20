export interface Task {
  id: number;
  dbId?: string; // Add this for Supabase UUID
  text: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  scheduledFor: string | null;
  estimatedHours: number | null;
  category: string;
  createdAt: Date;
}

export interface HistoryAction {
  type: 'add' | 'edit' | 'delete' | 'toggle';
  task?: Task;
  taskId?: number;
  position?: number;
  previousState?: boolean;
  newState?: boolean;
  previousData?: Partial<Task>;
  newData?: Partial<Task>;
}

export type FilterType = 'all' | 'active' | 'completed' | 'high' | string;

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}