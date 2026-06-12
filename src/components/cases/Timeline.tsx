"use client";

import type { EventItem } from "@/types";
import { Badge, AIBadge, ConfidenceBadge } from "@/components/ui/Badge";

interface TimelineProps {
  events: EventItem[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-xl text-text-hint text-body">
        暂无时间线事件，导入素材后 AI 将自动生成
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative pl-6">
      {/* timeline line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#E0E0E0]" />

      <div className="space-y-lg">
        {sorted.map((event) => (
          <div key={event.id} className="relative">
            {/* dot */}
            <div className="absolute left-[-18px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-low" />

            <div className="card">
              <div className="flex items-center gap-sm mb-xs">
                <span className="text-number text-primary">{event.date}</span>
                {!event.isConfirmed && <AIBadge />}
              </div>

              <p className="text-body text-text-primary mb-sm">{event.description}</p>

              <div className="flex flex-wrap items-center gap-sm">
                {event.amount && (
                  <span className="text-caption font-medium text-primary bg-primary-pale px-sm py-0.5 rounded-sm">
                    ¥{event.amount}
                  </span>
                )}
                {event.tags.map((tag) => (
                  <span key={tag} className="text-caption text-text-hint bg-gray-100 px-sm py-0.5 rounded-sm">
                    {tag}
                  </span>
                ))}
                {event.confidence !== "high" && <ConfidenceBadge level={event.confidence} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
