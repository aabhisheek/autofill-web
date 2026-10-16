import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const styles: Record<ApplicationStatus, string> = {
  saved: "bg-slate-100 text-slate-700 border-slate-200",
  applied: "bg-blue-100 text-blue-700 border-blue-200",
  interview: "bg-amber-100 text-amber-700 border-amber-200",
  offer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200"
};

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? styles.saved,
        className
      )}
    >
      {status}
    </span>
  );
}
