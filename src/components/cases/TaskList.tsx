import type { TaskItem } from "@/types";
import { Badge, AIBadge } from "@/components/ui/Badge";
import { isOverdue, isToday } from "@/lib/utils";

interface TaskListProps {
  tasks: TaskItem[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-xl text-text-hint text-body">
        暂无待办事项
      </div>
    );
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sorted = [...tasks].sort((a, b) => {
    // status first: pending > in_progress > completed
    const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, completed: 2 };
    const statusDiff = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
    if (statusDiff !== 0) return statusDiff;
    // then due date
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    // then priority
    return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 0) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 0);
  });

  return (
    <div className="space-y-md">
      {sorted.map((task) => {
        const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "completed";
        const today = task.dueDate && isToday(task.dueDate) && task.status !== "completed";

        return (
          <div key={task.id} className={`card border-l-2 ${overdue ? "border-error" : today ? "border-warning" : "border-transparent"}`}>
            <div className="flex items-start justify-between mb-xs">
              <div className="flex items-center gap-sm">
                <span className={`text-lg ${task.status === "completed" ? "text-success" : task.status === "in_progress" ? "text-info" : "text-text-hint"}`}>
                  {task.status === "completed" ? "✓" : task.status === "in_progress" ? "◉" : "○"}
                </span>
                <h4 className={`text-body font-medium ${task.status === "completed" ? "text-text-hint line-through" : "text-text-primary"}`}>
                  {task.title}
                </h4>
                {task.isAIGenerated && <AIBadge />}
              </div>
              <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "default"}>
                {task.priority === "high" ? "高优先" : task.priority === "medium" ? "中优先" : "低优先"}
              </Badge>
            </div>

            {task.description && (
              <p className="text-caption text-text-secondary ml-7 mb-sm">{task.description}</p>
            )}

            {task.dueDate && (
              <div className="ml-7">
                <span className={`text-caption ${overdue ? "text-error font-medium" : today ? "text-warning font-medium" : "text-text-hint"}`}>
                  {overdue ? "⚠ 已逾期: " : today ? "● 今天: " : "截止: "}
                  {task.dueDate}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
