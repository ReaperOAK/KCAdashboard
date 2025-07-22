import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers';
import DraggableQuestionCard from './DraggableQuestionCard';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

/**
 * SortableQuestionsList - A drag-and-drop enabled questions list for quiz creation
 * Allows teachers to reorder questions by dragging them around like a PDF editor
 */
const SortableQuestionsList = React.memo(function SortableQuestionsList({
  questions,
  onQuestionsReorder,
  onSaveQuestionOrder,
  children, // Function that renders each question card
  isDragDisabled = false,
  showSaveButton = true
}) {
  const [activeId, setActiveId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = questions.findIndex(q => (q.id || q.tempId) === active.id);
      const newIndex = questions.findIndex(q => (q.id || q.tempId) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
        onQuestionsReorder(reorderedQuestions);
        setHasUnsavedChanges(true);
        toast.success(`Question ${oldIndex + 1} moved to position ${newIndex + 1}`);
      }
    }

    setActiveId(null);
  }, [questions, onQuestionsReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleSaveOrder = useCallback(async () => {
    if (onSaveQuestionOrder) {
      try {
        await onSaveQuestionOrder();
        setHasUnsavedChanges(false);
        toast.success('Question order saved successfully!');
      } catch (error) {
        toast.error('Failed to save question order');
      }
    }
  }, [onSaveQuestionOrder]);

  const getDraggedQuestion = useCallback(() => {
    return questions.find(q => (q.id || q.tempId) === activeId);
  }, [questions, activeId]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <FaSort className="text-gray-400 text-2xl" />
        </div>
        <p className="text-gray-500 text-lg mb-2">No questions added yet</p>
        <p className="text-gray-400 text-sm">Add questions to start building your quiz</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reorder Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FaSort className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-blue-800 font-medium text-sm">Drag & Drop to Reorder</p>
          <p className="text-blue-600 text-xs mt-1">
            Click and drag the grip handle (⋮) on the left of any question to reorder them. 
            Changes will be automatically applied to your quiz.
          </p>
        </div>
        {hasUnsavedChanges && showSaveButton && (
          <button
            onClick={handleSaveOrder}
            className="ml-auto px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Order
          </button>
        )}
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        <SortableContext
          items={questions.map(q => q.id || q.tempId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question, index) =>
              children(question, index, isDragDisabled)
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay adjustScale={false}>
          {activeId ? (
            <div className="bg-white rounded-xl shadow-2xl border border-accent/30 opacity-90 transform rotate-3 scale-105">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Moving...
                  </div>
                  <span className="text-gray-600 text-sm">
                    {getDraggedQuestion()?.question?.substring(0, 50) || 'Question'}
                    {getDraggedQuestion()?.question?.length > 50 ? '...' : ''}
                  </span>
                </div>
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Status Bar */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaSortUp className="text-yellow-600" />
            <span className="text-yellow-800 text-sm font-medium">
              Question order has been changed
            </span>
          </div>
          {showSaveButton && (
            <button
              onClick={handleSaveOrder}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default SortableQuestionsList;
