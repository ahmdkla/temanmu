export interface Task {
  id: number;
  dbId?: string;
  text: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  scheduledFor: string | null;
  estimatedHours: number | null;
  category: string;
  sortOrder: number; // Add this
  createdAt: Date;
}

export interface HistoryAction {
  type: 'add' | 'edit' | 'delete' | 'toggle' | 'reorder'; // Add reorder
  task?: Task;
  taskId?: number;
  position?: number;
  previousState?: boolean;
  newState?: boolean;
  previousData?: Partial<Task>;
  newData?: Partial<Task>;
  previousOrder?: number; // For reorder actions
  newOrder?: number;
}

export type FilterType = 'all' | 'active' | 'completed' | 'high' | string;

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}