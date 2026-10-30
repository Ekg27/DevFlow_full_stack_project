import React from 'react';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({
  tasks = [],
  onOpenTask,
  onStatusChange,
  onAddTask,
}) {
  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <div className="kanban-board">
      <KanbanColumn
        title="To Do"
        status="To Do"
        tasks={todoTasks}
        onOpenTask={onOpenTask}
        onStatusChange={onStatusChange}
        onAddTask={onAddTask}
      />
      <KanbanColumn
        title="In Progress"
        status="In Progress"
        tasks={inProgressTasks}
        onOpenTask={onOpenTask}
        onStatusChange={onStatusChange}
        onAddTask={onAddTask}
      />
      <KanbanColumn
        title="Done"
        status="Done"
        tasks={doneTasks}
        onOpenTask={onOpenTask}
        onStatusChange={onStatusChange}
        onAddTask={onAddTask}
      />
    </div>
  );
}
