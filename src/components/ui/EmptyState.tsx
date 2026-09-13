import React from "react";
import { LucideIcon, FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-[#D9D5C7] bg-[#FBFAF7] p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[#D9D5C7] bg-white text-[#1B3A5C]">
        <Icon className="h-5 w-5 text-[#1B3A5C]" />
      </div>
      <h3 className="mt-3.5 font-display text-sm font-semibold text-[#1A1915]">{title}</h3>
      <p className="mt-1 text-xs text-[#8A8571] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 bg-[#1B3A5C] px-3.5 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#152e4a] transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

