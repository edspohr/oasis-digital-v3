'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Star, Zap, Crown, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

export type UserLevel = 'Explorador' | 'Activo' | 'Embajador';

interface LevelBadgeProps {
  level: UserLevel;
  xp: number;
  maxXp?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelConfig = {
  Explorador: {
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500',
    nextLevel: 'Activo',
    threshold: 500,
  },
  Activo: {
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-500',
    nextLevel: 'Embajador',
    threshold: 1500,
  },
  Embajador: {
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    gradient: 'from-purple-500 to-pink-500',
    nextLevel: null,
    threshold: 3000,
  },
};

export function LevelBadge({
  level,
  xp,
  maxXp,
  showProgress = true,
  size = 'md',
  className,
}: LevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  
  // Calculate progress to next level
  const nextThreshold = config.threshold;
  const progress = maxXp ? (xp / maxXp) * 100 : Math.min((xp / nextThreshold) * 100, 100);
  
  const sizeClasses = {
    sm: {
      container: 'h-7 px-2 gap-1',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
      progressBar: 'h-1 w-10',
    },
    md: {
      container: 'h-8 px-3 gap-1.5',
      icon: 'h-4 w-4',
      text: 'text-sm',
      progressBar: 'h-1.5 w-14',
    },
    lg: {
      container: 'h-10 px-4 gap-2',
      icon: 'h-5 w-5',
      text: 'text-base',
      progressBar: 'h-2 w-20',
    },
  };

  const sizeConfig = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center rounded-full border transition-all duration-200 hover:scale-105 cursor-pointer',
              config.bgColor,
              config.borderColor,
              sizeConfig.container,
              className
            )}
          >
            <Icon className={cn(sizeConfig.icon, config.color)} />
            <span className={cn('font-semibold', config.color, sizeConfig.text)}>
              {level}
            </span>
            
            {showProgress && (
              <div className="flex items-center gap-1 ml-1">
                <div className={cn('bg-gray-200 rounded-full overflow-hidden', sizeConfig.progressBar)}>
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{xp}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">Nivel: {level}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {xp} XP {config.nextLevel && `/ ${nextThreshold} XP para ${config.nextLevel}`}
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
              style={{ width: `${progress}%` }}
            />
          </div>
          {config.nextLevel && (
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              {nextThreshold - xp} XP más para subir a {config.nextLevel}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for tight spaces
export function LevelBadgeCompact({
  level,
  xp,
  className,
}: {
  level: UserLevel;
  xp: number;
  className?: string;
}) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full transition-all hover:scale-105',
              config.bgColor,
              config.borderColor,
              'border cursor-pointer',
              className
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', config.color)} />
            <span className={cn('text-xs font-bold', config.color)}>{xp}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{level}</p>
          <p className="text-xs text-muted-foreground">{xp} XP</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
