"use client";

import { useState, useCallback, useEffect } from 'react';
import { Task, HistoryAction, FilterType, Category } from '../types/task';

const defaultCategories: Category[] = [
  { id: 'general', name: 'General', color: '#6B7280', count: 0 },
  { id: 'work', name: 'Work', color: '#3B82F6', count: 0 },
  { id: 'personal', name: 'Personal', color: '#10B981', count: 0 },
  { id: 'urgent', name: 'Urgent', color: '#EF4444', count: 0 },
];

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [nextId, setNextId] = useState(1);
  const maxHistorySize = 50;

  // Update category counts
  const updateCategoryCount = useCallback((taskList: Task[]) => {
    setCategories(prev => prev.map(category => ({
      ...category,
      count: taskList.filter(task => task.category === category.id).length
    })));
  }, []);

  // Add to history
  const addToHistory = useCallback((action: HistoryAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(action);
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
      }
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Add category
  const addCategory = useCallback((name: string, color: string) => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      count: 0
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  // Delete category
  const deleteCategory = useCallback((categoryId: string) => {
    setTasks(prev => prev.map(task => 
      task.category === categoryId ? { ...task, category: 'general' } : task
    ));
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // Add task
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...taskData,
      id: nextId,
      createdAt: new Date()
    };

    setTasks(prev => {
      const newTasks = [task, ...prev];
      updateCategoryCount(newTasks);
      return newTasks;
    });
    setNextId(prev => prev + 1);
    addToHistory({ type: 'add', task: { ...task } });
  }, [nextId, addToHistory, updateCategoryCount]);

  // Toggle task
  const toggleTask = useCallback((id: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const previousState = task.completed;
        const newState = !task.completed;
        addToHistory({
          type: 'toggle',
          taskId: id,
          previousState,
          newState
        });
        return { ...task, completed: newState };
      }
      return task;
    }));
  }, [addToHistory]);

  // Delete task
  const deleteTask = useCallback((id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const position = tasks.indexOf(task);
      addToHistory({
        type: 'delete',
        task: { ...task },
        position
      });
      
      setTimeout(() => {
        setTasks(prev => {
          const newTasks = prev.filter(t => t.id !== id);
          updateCategoryCount(newTasks);
          return newTasks;
        });
      }, 300);
    }
  }, [tasks, addToHistory, updateCategoryCount]);

  // Edit task
  const editTask = useCallback((id: number, newData: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const previousData = {
        text: task.text,
        description: task.description,
        priority: task.priority,
        scheduledFor: task.scheduledFor,
        estimatedHours: task.estimatedHours,
        category: task.category
      };

      const hasChanges = 
        previousData.text !== newData.text ||
        previousData.description !== newData.description ||
        previousData.priority !== newData.priority ||
        previousData.scheduledFor !== newData.scheduledFor ||
        previousData.estimatedHours !== newData.estimatedHours ||
        previousData.category !== newData.category;

      if (hasChanges) {
        addToHistory({
          type: 'edit',
          taskId: id,
          previousData,
          newData
        });

        setTasks(prev => {
          const newTasks = prev.map(t => 
            t.id === id ? { ...t, ...newData } : t
          );
          updateCategoryCount(newTasks);
          return newTasks;
        });
      }
    }
    setEditingTaskId(null);
  }, [tasks, addToHistory, updateCategoryCount]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      
      switch (action.type) {
        case 'add':
          if (action.task) {
            setTasks(prev => {
              const newTasks = prev.filter(t => t.id !== action.task!.id);
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
        case 'delete':
          if (action.task && action.position !== undefined) {
            setTasks(prev => {
              const newTasks = [...prev];
              newTasks.splice(action.position!, 0, { ...action.task! });
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
        case 'toggle':
          if (action.taskId && action.previousState !== undefined) {
            setTasks(prev => prev.map(t => 
              t.id === action.taskId ? { ...t, completed: action.previousState! } : t
            ));
          }
          break;
        case 'edit':
          if (action.taskId && action.previousData) {
            setTasks(prev => {
              const newTasks = prev.map(t => 
                t.id === action.taskId ? { ...t, ...action.previousData } : t
              );
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
      }
      
      setEditingTaskId(null);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, updateCategoryCount]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const action = history[newIndex];
      
      switch (action.type) {
        case 'add':
          if (action.task) {
            setTasks(prev => {
              const newTasks = [{ ...action.task! }, ...prev];
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
        case 'delete':
          if (action.task) {
            setTasks(prev => {
              const newTasks = prev.filter(t => t.id !== action.task!.id);
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
        case 'toggle':
          if (action.taskId && action.newState !== undefined) {
            setTasks(prev => prev.map(t => 
              t.id === action.taskId ? { ...t, completed: action.newState! } : t
            ));
          }
          break;
        case 'edit':
          if (action.taskId && action.newData) {
            setTasks(prev => {
              const newTasks = prev.map(t => 
                t.id === action.taskId ? { ...t, ...action.newData } : t
              );
              updateCategoryCount(newTasks);
              return newTasks;
            });
          }
          break;
      }
      
      setEditingTaskId(null);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex, updateCategoryCount]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
                 ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    updateCategoryCount(tasks);
  }, [tasks, updateCategoryCount]);

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
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < history.length - 1,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    addCategory,
    deleteCategory,
    setCurrentFilter,
    setEditingTaskId,
    undo,
    redo
  };
};