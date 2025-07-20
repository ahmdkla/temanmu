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
      dbId: dbTask.id, // Keep original UUID
      text: dbTask.text,
      description: dbTask.description || '',
      completed: dbTask.completed,
      priority: dbTask.priority,
      scheduledFor: dbTask.scheduled_for,
      estimatedHours: dbTask.estimated_hours,
      category: dbTask.category_id || 'general',
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
      // Check if user already has categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // If no categories exist, create defaults
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

      // Count tasks per category
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

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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

  // Find task by ID (with proper type assertion)
  const findTaskById = (id: number): (Task & { dbId: string }) | null => {
    const task = tasks.find(t => t.id === id);
    return task && task.dbId ? task as (Task & { dbId: string }) : null;
  };

  // Add task
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      // Find category ID
      let categoryId = null;
      if (taskData.category && taskData.category !== 'general') {
        const category = categories.find(c => c.id === taskData.category);
        categoryId = category ? category.id : null;
      } else {
        // Find General category
        const generalCategory = categories.find(c => c.name === 'General');
        categoryId = generalCategory ? generalCategory.id : null;
      }

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
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = convertDbTaskToTask(data);
      setTasks(prev => [newTask, ...prev]);
      loadCategories(); // Refresh category counts
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    }
  }, [user, categories, loadCategories]);

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
      loadCategories(); // Refresh category counts
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
      // Find category ID
      let categoryId = null;
      if (newData.category && newData.category !== 'general') {
        const category = categories.find(c => c.id === newData.category);
        categoryId = category ? category.id : null;
      } else {
        // Find General category
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

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, ...newData } : t
      ));
      
      loadCategories(); // Refresh category counts
      console.log('Task updated successfully'); // Debug log
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

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!user) return;

    try {
      // First update all tasks to use 'General' category
      const generalCategory = categories.find(cat => cat.name === 'General');
      if (generalCategory) {
        await supabase
          .from('tasks')
          .update({ category_id: generalCategory.id })
          .eq('user_id', user.id)
          .eq('category_id', categoryId);
      }

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', user.id)
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }, [user, categories, loadTasks]);

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
    
    return filtered;
  }, [tasks, currentFilter]);

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
    setCurrentFilter,
    setEditingTaskId,
    undo: () => {},
    redo: () => {},
  };
};