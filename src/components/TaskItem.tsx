"use client";

import React, { useState } from 'react';
import { Pencil, Trash2, Check, X, Calendar, Clock } from 'lucide-react';
import { Task, Category } from '../types/task';
import { formatDate, formatScheduledDate } from '../utils/dateUtils';
import { getScheduleOptions, getMinDateTime } from '../utils/scheduleUtils';

interface TaskItemProps {
  task: Task;
  categories: Category[];
  isEditing: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<Task>) => void;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  categories,
  isEditing,
  onToggle,
  onDelete,
  onEdit,
  onStartEdit,
  onCancelEdit
}) => {
  const [editText, setEditText] = useState(task.text);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editScheduledFor, setEditScheduledFor] = useState(task.scheduledFor || '');
  const [editEstimatedHours, setEditEstimatedHours] = useState(task.estimatedHours?.toString() || '');
  const [editCategory, setEditCategory] = useState(task.category);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const scheduleOptions = getScheduleOptions();
  const minDateTime = getMinDateTime();
  const currentCategory = categories.find(cat => cat.id === task.category);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, {
        text: editText.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        scheduledFor: editScheduledFor || null,
        estimatedHours: editEstimatedHours ? parseFloat(editEstimatedHours) : null,
        category: editCategory
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  const handleQuickSchedule = (value: string) => {
    setEditScheduledFor(value);
    setShowCustomDate(false);
  };

  if (isEditing) {
    return (
      <div className="task-item p-4 bg-blue-50 dark:bg-blue-900/20 transition-colors duration-200 animate-slideIn">
        <div className="flex items-start gap-4">
          <input 
            type="checkbox" 
            className="checkbox-custom mt-1" 
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
          <div className="flex-1 space-y-3">
            {/* Title and Priority */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Task title..."
                className="flex-1 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <select 
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            {/* Description */}
            <textarea 
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task description (optional)..."
              rows={2}
              className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />

            {/* Category */}
            <select 
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Quick Schedule */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {scheduleOptions.map(option => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleQuickSchedule(option.value)}
                    className={`px-2 py-1 text-xs rounded border transition-colors duration-200 ${
                      editScheduledFor === option.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomDate(!showCustomDate)}
                  className={`px-2 py-1 text-xs rounded border transition-colors duration-200 flex items-center gap-1 ${
                    showCustomDate
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  Custom
                </button>
              </div>

              {showCustomDate && (
                <input 
                  type="datetime-local" 
                  value={editScheduledFor}
                  onChange={(e) => setEditScheduledFor(e.target.value)}
                  min={minDateTime}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>
            
            {/* Hours */}
            <input 
              type="number" 
              value={editEstimatedHours}
              onChange={(e) => setEditEstimatedHours(e.target.value)}
              placeholder="Hours"
              min="0"
              max="999"
              step="0.5"
              className="w-full sm:w-32 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDate(task.createdAt)} • Press Enter to save, Escape to cancel
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleSave}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 p-2"
              title="Save changes"
            >
              <Check className="w-5 h-5" />
            </button>
            <button 
              onClick={onCancelEdit}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 p-2"
              title="Cancel editing"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-item p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 animate-slideIn">
      <div className="flex items-start gap-4">
        <input 
          type="checkbox" 
          className="checkbox-custom mt-1" 
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-gray-800 dark:text-gray-200 font-medium ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.text}
            </span>
            <span className={`priority-badge priority-${task.priority} px-2 py-1 text-xs font-medium rounded-full shrink-0`}>
              {task.priority.toUpperCase()}
            </span>
            {currentCategory && (
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full shrink-0 text-white"
                style={{ backgroundColor: currentCategory.color }}
              >
                {currentCategory.name}
              </span>
            )}
            {task.estimatedHours && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 text-xs rounded-full shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedHours}h
              </span>
            )}
          </div>
          {task.description && (
            <div className={`text-gray-600 dark:text-gray-400 text-sm mb-2 ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.description}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Created {formatDate(task.createdAt)}</span>
            {task.scheduledFor && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due {formatScheduledDate(task.scheduledFor)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => onStartEdit(task.id)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-2"
            title="Edit task"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-2"
            title="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};