import Link from "next/link";
import type { CaseSummary } from "@/types";
import { formatDateTime, statusLabel, riskColorClass, caseTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface CaseCardProps {
  case_: CaseSummary;
}

export function CaseCard({ case_ }: CaseCardProps) {
  return (
    <Link href={`/cases/${case_.id}`} className="card block no-underline hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between mb-sm">
        <div className="flex items-center gap-sm min-w-0">
          <Badge
            variant={case_.status === "active" ? "success" : case_.status === "closed" ? "default" : "default"}
          >
            {statusLabel(case_.status)}
          </Badge>
          <h3 className="text-heading text-text-primary truncate">{case_.name}</h3>
        </div>
        <span className={riskColorClass(case_.riskLevel)}>
          <Badge
            variant={case_.riskLevel === "high" ? "error" : case_.riskLevel === "medium" ? "warning" : "success"}
          >
            {case_.riskLevel === "high" ? "高风险" : case_.riskLevel === "medium" ? "中风险" : "低风险"}
          </Badge>
        </span>
      </div>

      <p className="text-body text-text-secondary mb-sm line-clamp-2">{case_.summary}</p>

      <div className="flex items-center gap-md text-caption text-text-hint">
        <span>{caseTypeLabel(case_.caseType)}</span>
        {case_.stage && <span>· {case_.stage}</span>}
      </div>

      <div className="flex items-center justify-between mt-md pt-sm border-t border-[#E0E0E0]">
        <div className="flex items-center gap-md text-caption">
          {case_.taskCount > 0 && (
            <span className="text-text-secondary">📋 {case_.taskCount} 待办</span>
          )}
          {case_.pendingDeadlineCount > 0 && (
            <span className="text-warning">⚠ {case_.pendingDeadlineCount} 即将到期</span>
          )}
        </div>
        <span className="text-caption text-text-hint">
          更新于 {formatDateTime(case_.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
