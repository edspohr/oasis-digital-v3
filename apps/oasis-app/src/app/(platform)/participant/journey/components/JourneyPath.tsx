'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Award 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

// Mock data types until we integrate real step data
export interface MapStep {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'quiz' | 'content' | 'task';
  status: 'completed' | 'current' | 'locked';
  duration?: string;
}

interface JourneyPathProps {
  journeyTitle: string;
  steps: MapStep[];
  onStepClick: (stepId: string) => void;
}

export function JourneyPath({ journeyTitle, steps, onStepClick }: JourneyPathProps) {
  return (
    <div className="relative space-y-8 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Badge variant="outline" className="mb-2 border-indigo-200 bg-indigo-50 text-indigo-700">
            En Progreso
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900">{journeyTitle}</h2>
          <p className="text-sm text-gray-500">Tu ruta de aprendizaje</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
                {steps.filter(s => s.status === 'completed').length}/{steps.length} Pasos
            </p>
            <p className="text-xs text-gray-500">completados</p>
        </div>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200" />

        <div className="space-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isLocked = step.status === 'locked';

            return (
              <div 
                key={step.id} 
                className={cn(
                  "relative pl-16 py-6 transition-all duration-300 group",
                  isCurrent ? "scale-100 opacity-100" : "opacity-80 hover:opacity-100"
                )}
              >
                {/* Connector Nodes */}
                <div 
                  className={cn(
                    "absolute left-[1.15rem] top-8 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all duration-500",
                    isCompleted ? "bg-green-500 border-green-100 text-white" : 
                    isCurrent ? "bg-white border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.2)]" :
                    "bg-gray-100 border-gray-50 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>

                {/* Line Coloring for Completed */}
                {isCompleted && !isLast && (
                  <div className="absolute left-6 top-16 bottom-[-24px] w-0.5 bg-green-500 z-0 transition-all delay-300 duration-500" />
                )}

                {/* Card Content */}
                <div 
                  className={cn(
                    "relative rounded-xl border p-5 transition-all duration-300",
                    isCurrent 
                      ? "bg-white border-indigo-200 shadow-lg ring-1 ring-indigo-100" 
                      : isCompleted
                        ? "bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-white"
                        : "bg-gray-50 border-gray-100 grayscale-[0.5]"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isCurrent ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"
                      )}>
                        {getStepIcon(step.type)}
                      </div>
                      <div>
                        {isCurrent && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 animate-pulse">
                            Siguiente Paso
                          </span>
                        )}
                        <h3 className={cn(
                          "font-bold text-base",
                          isLocked ? "text-gray-500" : "text-gray-900"
                        )}>
                          {step.title}
                        </h3>
                        {step.description && (
                          <p className="text-sm text-gray-500 mt-1 max-w-lg line-clamp-2">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        {step.duration && (
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                {step.duration}
                            </span>
                        )}
                        {isCurrent ? (
                            <Button 
                                onClick={() => onStepClick(step.id)} 
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                            >
                                Continuar
                                <Play className="ml-2 h-3 w-3 fill-white" />
                            </Button>
                        ) : isCompleted ? (
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onStepClick(step.id)}
                                className="w-full sm:w-auto text-gray-500 hover:text-indigo-600"
                            >
                                Repasar
                            </Button>
                        ) : (
                             <Button variant="outline" size="sm" disabled className="w-full sm:w-auto opacity-50">
                                Bloqueado
                            </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* End Node */}
        <div className="pl-16 pt-0 opacity-40">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-300">
                    <Award className="h-5 w-5" />
                </div>
                <div className="text-sm text-gray-400 font-medium italic">
                    Certificación al completar
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function getStepIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="h-5 w-5" />;
    case 'quiz': return <FileText className="h-5 w-5" />;
    case 'task': return <BookOpen className="h-5 w-5" />;
    default: return <LinkIcon className="h-5 w-5" />;
  }
}
