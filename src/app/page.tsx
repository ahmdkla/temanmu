"use client";

import React, { useEffect, useState } from 'react';
import { Undo, Redo, Folder } from 'lucide-react';
import { Auth } from '../components/Auth';
import { useTaskManager } from '../hooks/useTaskManager';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList'; // New component
import { CategoryManager } from '../components/CategoryManager';
import { FilterType } from '../types/task';

function TaskManagerApp() {
  const {
    tasks,
    categories,
    currentFilter,
    editingTaskId,
    stats,
    loading,
    canUndo,
    canRedo,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    addCategory,
    deleteCategory,
    reorderTasks, // New function
    setCurrentFilter,
    setEditingTaskId,
    undo,
    redo
  } = useTaskManager();

  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Dark mode setup
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'high', label: 'High Priority' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-primary dark:bg-primary-dark shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Temanmu</h1>
          <p className="text-purple-100 mt-2">Hadir untuk membantu harimu lebih teratur, jadwalkan kegiatan, dan kelola produktivitasmu dengan mudah dalam satu aplikasi.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Task Form */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <TaskForm categories={categories} onAddTask={addTask} />
        </div>

        {/* Category Manager */}
        {showCategoryManager && (
          <div className="mb-6">
            <CategoryManager
              categories={categories}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            />
          </div>
        )}

        {/* Filter Buttons and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {/* Default Filters */}
            {filterButtons.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCurrentFilter(id)}
                className={`filter-btn px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  currentFilter === id ? 'active' : ''
                }`}
              >
                {label}
              </button>
            ))}
            
            {/* Category Filters */}
            {categories.map(category => (
              <button
                key={`category-${category.id}`}
                onClick={() => setCurrentFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  currentFilter === category.id 
                    ? 'text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={currentFilter === category.id ? { backgroundColor: category.color } : {}}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Folder className="w-4 h-4" />
              Categories
            </button>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Total Tasks</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Completed</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Pending</div>
          </div>
        </div>

        {/* Drag & Drop Instructions */}
        {tasks.length > 1 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span className="text-blue-500">💡</span>
              <strong>Tip:</strong> Drag tasks by the grip handle (⋮⋮) to reorder them. Your custom order will be saved automatically!
            </p>
          </div>
        )}

        {/* Tasks List with Drag & Drop */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Your Tasks
              {tasks.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          
          <TaskList
            tasks={tasks}
            categories={categories}
            editingTaskId={editingTaskId}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onStartEdit={setEditingTaskId}
            onCancelEdit={() => setEditingTaskId(null)}
            onReorder={reorderTasks}
          />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Auth>
      <TaskManagerApp />
    </Auth>
  );
}