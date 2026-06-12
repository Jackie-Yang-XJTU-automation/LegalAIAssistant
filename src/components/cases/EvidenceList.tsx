import type { EvidenceItem } from "@/types";
import { AIBadge } from "@/components/ui/Badge";

interface EvidenceListProps {
  evidences: EvidenceItem[];
}

export function EvidenceList({ evidences }: EvidenceListProps) {
  if (evidences.length === 0) {
    return (
      <div className="text-center py-xl text-text-hint text-body">
        暂无证据，导入素材后 AI 将自动识别
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {evidences.map((evidence, idx) => (
        <div key={evidence.id} className="card">
          <div className="flex items-start justify-between mb-xs">
            <h4 className="text-body font-medium text-text-primary">
              <span className="text-caption text-text-hint mr-sm">证据 {idx + 1}</span>
              {evidence.name}
            </h4>
            {evidence.isAIGenerated && !evidence.isConfirmed && <AIBadge />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm text-caption">
            <div>
              <span className="text-text-hint">类型：</span>
              <span className="text-text-secondary">{evidence.type}</span>
            </div>
            <div>
              <span className="text-text-hint">来源：</span>
              <span className="text-text-secondary">{evidence.source}</span>
            </div>
          </div>

          {evidence.purpose && (
            <div className="mt-sm pt-sm border-t border-[#E0E0E0]">
              <span className="text-caption text-text-hint">证明目的：</span>
              <span className="text-body text-text-secondary">{evidence.purpose}</span>
            </div>
          )}

          <div className="mt-sm">
            {evidence.isConfirmed ? (
              <span className="text-caption text-success">✓ 已确认</span>
            ) : (
              <span className="badge-warning badge-status">⚠ 待确认</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
