"use client";

import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Task, Category } from '../types/task';
import { getScheduleOptions, getMinDate, getMinDateTime } from '../utils/scheduleUtils';

interface TaskFormProps {
  categories: Category[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ categories, onAddTask }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [scheduledDate, setScheduledDate] = useState(''); // Date only
  const [scheduledTime, setScheduledTime] = useState(''); // Time only
  const [estimatedHours, setEstimatedHours] = useState('');
  const [category, setCategory] = useState('general');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const scheduleOptions = getScheduleOptions();
  const minDate = getMinDate();
  const minDateTime = getMinDateTime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim()) {
      // Combine date and time if both are provided
      let finalScheduledFor = null;
      if (scheduledDate) {
        if (scheduledTime) {
          finalScheduledFor = `${scheduledDate}T${scheduledTime}`;
        } else {
          // If only date is provided, set default time to 09:00
          finalScheduledFor = `${scheduledDate}T09:00`;
        }
      }

      onAddTask({
        text: text.trim(),
        description: description.trim(),
        completed: false,
        priority,
        scheduledFor: finalScheduledFor,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        category
      });

      // Reset form
      setText('');
      setDescription('');
      setPriority('medium');
      setScheduledDate('');
      setScheduledTime('');
      setEstimatedHours('');
      setCategory('general');
      setShowCustomDate(false);
    }
  };

  const handleQuickSchedule = (dateValue: string) => {
    setScheduledDate(dateValue);
    setShowCustomDate(false);
    // Don't set time - let user choose
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title and Priority */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter task title..." 
            className="flex-1 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        
        {/* Description */}
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add task description (optional)..." 
          rows={3}
          className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Schedule Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Schedule
          </label>
          <div className="space-y-4">
            {/* Quick Date Options */}
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick date selection:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {scheduleOptions.map(option => (
                    <button
                        key={option.label}
                        type="button"
                        onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuickSchedule(option.value);
                        }}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                        scheduledDate === option.value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                    >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                    </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Picker Button */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCustomDate(!showCustomDate);
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors duration-200 flex items-center gap-2 ${
                  showCustomDate
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Pick Custom Date
              </button>
            </div>

            {/* Custom Date Picker */}
            {showCustomDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date:
                </label>
                <input 
                  type="date" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={minDate}
                  className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {/* Time Picker (shows when date is selected) */}
            {scheduledDate && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time (optional - defaults to 9:00 AM if not specified):
                </label>
                <input 
                  type="time" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selected: {scheduledDate} {scheduledTime ? `at ${scheduledTime}` : 'at 9:00 AM (default)'}
                </div>
              </div>
            )}

            {/* Clear Schedule */}
            {scheduledDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setScheduledDate('');
                  setScheduledTime('');
                  setShowCustomDate(false);
                }}
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                ✕ Clear schedule
              </button>
            )}
          </div>
        </div>
        
        {/* Hours and Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Est. Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="number" 
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                min="0"
                max="999"
                step="0.5"
                className="w-full pl-10 pr-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-auto">
            <label className="block text-sm font-medium text-transparent mb-1">Action</label>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Add Task
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};