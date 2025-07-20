"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Task, Category, FilterType } from '../types/task';

interface DatabaseTask {
  id: string;
  text: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  scheduled_for: string | null;
  estimated_hours: number | null;
  category_id: string | null;
  user_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseCategory {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simple hash function to convert UUID to number for compatibility
  const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Convert database task to app task
  const convertDbTaskToTask = (dbTask: DatabaseTask): Task => {
    return {
      id: hashStringToNumber(dbTask.id),
      dbId: dbTask.id,
      text: dbTask.text,
      description: dbTask.description || '',
      completed: dbTask.completed,
      priority: dbTask.priority,
      scheduledFor: dbTask.scheduled_for,
      estimatedHours: dbTask.estimated_hours,
      category: dbTask.category_id || 'general',
      sortOrder: dbTask.sort_order,
      createdAt: new Date(dbTask.created_at),
    };
  };

  // Convert database category to app category
  const convertDbCategoryToCategory = (dbCategory: DatabaseCategory, taskCount: number): Category => {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      color: dbCategory.color,
      count: taskCount,
    };
  };

  // Create default categories for new users
  const createDefaultCategories = useCallback(async () => {
    if (!user) return;

    try {
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!existingCategories || existingCategories.length === 0) {
        const defaultCategories = [
          { name: 'General', color: '#6B7280', user_id: user.id },
          { name: 'Work', color: '#3B82F6', user_id: user.id },
          { name: 'Personal', color: '#10B981', user_id: user.id },
          { name: 'Urgent', color: '#EF4444', user_id: user.id },
        ];

        const { error } = await supabase
          .from('categories')
          .insert(defaultCategories);

        if (error) {
          console.error('Error creating default categories:', error);
        }
      }
    } catch (error) {
      console.error('Error in createDefaultCategories:', error);
    }
  }, [user]);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!user) return;

    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (categoriesError) throw categoriesError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('category_id')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const categoryCounts: Record<string, number> = {};
      tasksData.forEach(task => {
        const categoryId = task.category_id || 'general';
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });

      const convertedCategories = categoriesData.map(cat => 
        convertDbCategoryToCategory(cat, categoryCounts[cat.id] || 0)
      );

      setCategories(convertedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [user]);

  // Load tasks with proper sorting
  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true }); // Sort by sort_order

      if (error) throw error;

      const convertedTasks = data.map(task => convertDbTaskToTask(task));
      setTasks(convertedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      createDefaultCategories().then(() => {
        loadCategories().then(() => {
          loadTasks();
        });
      });
    } else {
      setTasks([]);
      setCategories([]);
      setLoading(false);
    }
  }, [user, createDefaultCategories, loadCategories, loadTasks]);

  // Find task by ID
  const findTaskById = (id: number): (Task & { dbId: string }) | null => {
    const task = tasks.find(t => t.id === id);
    return task && task.dbId ? task as (Task & { dbId: string }) : null;
  };

  // Get next sort order for new tasks
  const getNextSortOrder = useCallback(() => {
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.sortOrder)) + 1 : 0;
  }, [tasks]);

  // Add task
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'sortOrder'>) => {
    if (!user) return;

    try {
      let categoryId = null;
      if (taskData.category && taskData.category !== 'general') {
        const category = categories.find(c => c.id === taskData.category);
        categoryId = category ? category.id : null;
      } else {
        const generalCategory = categories.find(c => c.name === 'General');
        categoryId = generalCategory ? generalCategory.id : null;
      }

      const nextSortOrder = getNextSortOrder();

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          text: taskData.text,
          description: taskData.description || null,
          completed: false,
          priority: taskData.priority,
          scheduled_for: taskData.scheduledFor,
          estimated_hours: taskData.estimatedHours,
          category_id: categoryId,
          sort_order: nextSortOrder,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = convertDbTaskToTask(data);
      setTasks(prev => [...prev, newTask].sort((a, b) => a.sortOrder - b.sortOrder));
      loadCategories();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    }
  }, [user, categories, loadCategories, getNextSortOrder]);


  // Get filtered tasks
  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;
    
    switch (currentFilter) {
      case 'active':
        filtered = tasks.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = tasks.filter(t => t.completed);
        break;
      case 'high':
        filtered = tasks.filter(t => t.priority === 'high');
        break;
      case 'all':
        filtered = tasks;
        break;
      default:
        filtered = tasks.filter(t => t.category === currentFilter);
        break;
    }
    
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [tasks, currentFilter]);


  // Reorder tasks (drag & drop)
  const reorderTasks = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (!user || sourceIndex === destinationIndex) return;

    try {
      const filteredTasks = getFilteredTasks();
      const reorderedTasks = Array.from(filteredTasks);
      const [removed] = reorderedTasks.splice(sourceIndex, 1);
      reorderedTasks.splice(destinationIndex, 0, removed);

      // Update sort orders
      const updates = reorderedTasks.map((task, index) => ({
        id: (task as Task & { dbId: string }).dbId,
        sort_order: index
      }));

      // Update in database
      for (const update of updates) {
        const { error } = await supabase
          .from('tasks')
          .update({ sort_order: update.sort_order })
          .eq('user_id', user.id)
          .eq('id', update.id);

        if (error) throw error;
      }

      // Update local state
      setTasks(prev => {
        const newTasks = [...prev];
        reorderedTasks.forEach((task, index) => {
          const taskIndex = newTasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], sortOrder: index };
          }
        });
        return newTasks.sort((a, b) => a.sortOrder - b.sortOrder);
      });

    } catch (error) {
      console.error('Error reordering tasks:', error);
      alert('Error reordering tasks. Please try again.');
      // Reload tasks to restore correct order
      loadTasks();
    }
  }, [user, getFilteredTasks, loadTasks]);

  // Toggle task
  const toggleTask = useCallback(async (id: number) => {
    const task = findTaskById(id);
    if (!task || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('user_id', user.id)
        .eq('id', task.dbId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Error updating task. Please try again.');
    }
  }, [tasks, user]);

  // Delete task
  const deleteTask = useCallback(async (id: number) => {
    const task = findTaskById(id);
    if (!task || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('id', task.dbId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
      loadCategories();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    }
  }, [tasks, user, loadCategories]);

  // Edit task
  const editTask = useCallback(async (id: number, newData: Partial<Task>) => {
    const task = findTaskById(id);
    if (!task || !user) return;

    try {
      let categoryId = null;
      if (newData.category && newData.category !== 'general') {
        const category = categories.find(c => c.id === newData.category);
        categoryId = category ? category.id : null;
      } else {
        const generalCategory = categories.find(c => c.name === 'General');
        categoryId = generalCategory ? generalCategory.id : null;
      }

      const updateData = {
        text: newData.text,
        description: newData.description || null,
        priority: newData.priority,
        scheduled_for: newData.scheduledFor,
        estimated_hours: newData.estimatedHours,
        category_id: categoryId,
      };

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('id', task.dbId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, ...newData } : t
      ));
      
      loadCategories();
    } catch (error) {
      console.error('Error editing task:', error);
      alert('Error updating task. Please try again.');
    }
    setEditingTaskId(null);
  }, [tasks, user, loadCategories, categories]);

  // Add category
  const addCategory = useCallback(async (name: string, color: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory = convertDbCategoryToCategory(data, 0);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  }, [user]);

  // Delete category (unchanged from previous implementation)
  const deleteCategory = useCallback(async (categoryId: string, moveTasksToGeneral: boolean = false): Promise<boolean> => {
    if (!user) return false;

    try {
      const generalCategory = categories.find(cat => cat.name === 'General');
      if (!generalCategory) {
        alert('Error: General category not found. Cannot proceed with deletion.');
        return false;
      }

      if (categoryId === generalCategory.id) {
        alert('The General category cannot be deleted.');
        return false;
      }

      const { data: tasksWithCategory, error: countError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_id', categoryId);

      if (countError) throw countError;

      const taskCount = tasksWithCategory?.length || 0;

      if (taskCount > 0 && !moveTasksToGeneral) {
        alert(`Cannot delete category. It has ${taskCount} active task${taskCount !== 1 ? 's' : ''}. Please move or delete these tasks first.`);
        return false;
      }

      if (taskCount > 0 && moveTasksToGeneral) {
        const { error: moveError } = await supabase
          .from('tasks')
          .update({ category_id: generalCategory.id })
          .eq('user_id', user.id)
          .eq('category_id', categoryId);

        if (moveError) {
          console.error('Error moving tasks:', moveError);
          alert('Error moving tasks to General category. Please try again.');
          return false;
        }
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id)
        .eq('id', categoryId);

      if (deleteError) {
        console.error('Error deleting category:', deleteError);
        alert('Error deleting category. Please try again.');
        return false;
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      if (taskCount > 0 && moveTasksToGeneral) {
        setTasks(prev => prev.map(task => 
          task.category === categoryId ? { ...task, category: generalCategory.id } : task
        ));
      }
      
      loadCategories();
      loadTasks();

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      alert('An unexpected error occurred. Please try again.');
      return false;
    }
  }, [user, categories, loadCategories, loadTasks]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  return {
    tasks: getFilteredTasks(),
    allTasks: tasks,
    categories,
    currentFilter,
    editingTaskId,
    stats,
    loading,
    canUndo: false,
    canRedo: false,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    addCategory,
    deleteCategory,
    reorderTasks, // New function
    setCurrentFilter,
    setEditingTaskId,
    undo: () => {},
    redo: () => {},
  };
};