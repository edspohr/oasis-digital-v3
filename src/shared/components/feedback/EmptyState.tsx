import React from 'react';
import { FileQuestion, LucideIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;     // Prop agregada
  onAction?: () => void;    // Prop agregada
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileQuestion,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95",
      className
    )}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      
      {description && (
        <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground text-balance">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}