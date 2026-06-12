import type { TaskItem } from "@/types";
import { Badge, AIBadge } from "@/components/ui/Badge";
import { isOverdue, isToday } from "@/lib/utils";

interface TaskListProps {
  tasks: TaskItem[];
  onToggle?: (taskId: string, newStatus: string) => void;
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-xl text-text-hint text-body">
        暂无待办事项，点击"+ 添加待办"手动创建，或导入素材让 AI 自动生成
      </div>
    );
  }

  const sorted = [...tasks].sort((a, b) => {
    const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, completed: 2 };
    const statusDiff = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
    if (statusDiff !== 0) return statusDiff;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] ?? 0) - (priorityOrder[b.priority] ?? 0);
  });

  return (
    <div className="space-y-md">
      {sorted.map((task) => {
        const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== "completed";
        const today = task.dueDate && isToday(task.dueDate) && task.status !== "completed";
        const isCompleted = task.status === "completed";

        return (
          <div
            key={task.id}
            className={`card border-l-2 transition-all ${
              overdue ? "border-error" : today ? "border-warning" : isCompleted ? "border-success opacity-70" : "border-transparent"
            }`}
          >
            <div className="flex items-start justify-between mb-xs">
              <div className="flex items-center gap-sm flex-1 min-w-0">
                <button
                  onClick={() => onToggle?.(task.id, isCompleted ? "pending" : "completed")}
                  className={`text-lg flex-shrink-0 hover:scale-110 transition-transform ${
                    isCompleted ? "text-success" : task.status === "in_progress" ? "text-info" : "text-text-hint"
                  }`}
                  title={isCompleted ? "标记为未完成" : "标记为已完成"}
                >
                  {isCompleted ? "✓" : task.status === "in_progress" ? "◉" : "○"}
                </button>
                <h4 className={`text-body font-medium truncate ${isCompleted ? "text-text-hint line-through" : "text-text-primary"}`}>
                  {task.title}
                </h4>
                {task.isAIGenerated && <AIBadge />}
              </div>
              <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "default"}>
                {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
              </Badge>
            </div>
            {task.description && (
              <p className={`text-caption ml-7 mb-sm ${isCompleted ? "text-text-hint" : "text-text-secondary"}`}>
                {task.description}
              </p>
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
