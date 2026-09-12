import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200/80 shadow-2xs">
        <Icon className="h-5 w-5 text-zinc-500" />
      </div>
      <h3 className="mt-3.5 text-sm font-bold text-zinc-900">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
