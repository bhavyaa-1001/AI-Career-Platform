import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { RESUME_SECTIONS } from '@/features/resume/constants';
import { cn } from '@/lib/utils';

function SortableItem({ id, label, icon, isActive, isVisible, onSelect, onToggleVisibility }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
        isActive ? 'border-primary bg-primary/5' : 'border-border bg-card',
        isDragging && 'opacity-60 shadow-md',
        !isVisible && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${label}`}
        {...attributes}
        {...listeners}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 11-.001 4.001A2 2 0 017 2zm0 6a2 2 0 11-.001 4.001A2 2 0 017 8zm0 6a2 2 0 11-.001 4.001A2 2 0 017 14zm6-8a2 2 0 11-.001-4.001A2 2 0 0113 6zm0 2a2 2 0 11-.001 4.001A2 2 0 0113 8zm0 6a2 2 0 11-.001 4.001A2 2 0 0113 14z" />
        </svg>
      </button>
      <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={() => onSelect(id)}>
        <span>{icon}</span>
        <span className={cn('font-medium', isActive && 'text-primary')}>{label}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggleVisibility(id)}
        className="text-muted-foreground hover:text-foreground"
        aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
      >
        {isVisible ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function SortableSectionList({ sectionOrder, sectionVisibility, activeSection, onReorder, onSelect, onToggleVisibility }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sectionMap = Object.fromEntries(RESUME_SECTIONS.map((s) => [s.id, s]));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id);
    const newIndex = sectionOrder.indexOf(over.id);
    onReorder(arrayMove(sectionOrder, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sectionOrder.map((id) => {
            const section = sectionMap[id];
            if (!section) return null;
            return (
              <SortableItem
                key={id}
                id={id}
                label={section.label}
                icon={section.icon}
                isActive={activeSection === id}
                isVisible={sectionVisibility[id] !== false}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
