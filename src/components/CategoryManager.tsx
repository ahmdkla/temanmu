"use client";

import React, { useState } from 'react';
import { Plus, X, Folder, AlertTriangle } from 'lucide-react';
import { Category } from '../types/task';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string, moveTasksToGeneral?: boolean) => Promise<boolean>;
}

const predefinedColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280',
];

// Custom Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  category: Category | null;
  onConfirm: (moveToGeneral: boolean) => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  category,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !category) return null;

  const hasActiveTasks = category.count > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Delete Category
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            You&apos;re about to delete the category &quot;<strong>{category.name}</strong>&quot;.
          </p>
          
          {hasActiveTasks ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ This category has <strong>{category.count} active task{category.count !== 1 ? 's' : ''}</strong>.
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                What would you like to do with these tasks?
              </p>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                ✅ This category has no active tasks and can be safely deleted.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {hasActiveTasks ? (
            <>
              <button
                onClick={() => onConfirm(true)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Move {category.count} task{category.count !== 1 ? 's' : ''} to &quot;General&quot; and delete category
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onConfirm(false)}
                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Delete Category
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), selectedColor);
      setNewCategoryName('');
      setSelectedColor(predefinedColors[0]);
      setIsOpen(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    // Prevent deletion of General category
    if (category.name === 'General') {
      alert('The "General" category cannot be deleted as it\'s the default category.');
      return;
    }

    setConfirmationModal({
      isOpen: true,
      category
    });
  };

  const handleConfirmDelete = async (moveToGeneral: boolean) => {
    if (!confirmationModal.category) return;

    setIsDeleting(true);
    try {
      const success = await onDeleteCategory(confirmationModal.category.id, moveToGeneral);
      if (success) {
        setConfirmationModal({ isOpen: false, category: null });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmationModal({ isOpen: false, category: null });
  };

  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Set Category
        </button>
        
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          category={confirmationModal.category}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Manage Categories
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {categories.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Categories</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.name} ({category.count})
                    </span>
                    {category.name === 'General' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        (Default)
                      </span>
                    )}
                  </div>
                  {category.name !== 'General' && (
                    <button
                      onClick={() => handleDeleteClick(category)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`Delete ${category.name} category`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color 
                      ? 'border-gray-800 dark:border-white scale-110' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add Category
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        category={confirmationModal.category}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};