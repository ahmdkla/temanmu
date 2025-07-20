"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { TaskItem } from './TaskItem';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Task, Category } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  editingTaskId: number | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<Task>) => void;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  editingTaskId,
  onToggle,
  onDelete,
  onEdit,
  onStartEdit,
  onCancelEdit,
  onReorder,
}) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({ isOpen: false, task: null });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id.toString() === active.id);
      const newIndex = tasks.findIndex(task => task.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const handleDeleteClick = (task: Task) => {
    setDeleteModal({
      isOpen: true,
      task
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.task) {
      onDelete(deleteModal.task.id);
      setDeleteModal({ isOpen: false, task: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, task: null });
  };

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-lg">No tasks yet</p>
        <p className="text-sm">Add your first task above to get started!</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={tasks.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                categories={categories}
                isEditing={editingTaskId === task.id}
                onToggle={onToggle}
                onDelete={handleDeleteClick} // Use confirmation handler
                onEdit={onEdit}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                isDraggable={true} // Enable dragging
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        task={deleteModal.task}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};