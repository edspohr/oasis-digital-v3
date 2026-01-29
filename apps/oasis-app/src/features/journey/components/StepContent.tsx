import React from 'react';
import { PlayCircle, FileText, HelpCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

// Asumimos tipos básicos si no están en @/core/types/journey
interface StepData {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'milestone';
  content: string; // URL o HTML/Markdown
  duration_minutes?: number;
}

interface StepContentProps {
  step: StepData;
}

export function StepContent({ step }: StepContentProps) {
  switch (step.type) {
    case 'video':
      return (
        <div className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
            {/* Aquí iría un reproductor real (YouTube/Vimeo/Mux) */}
            <div className="flex h-full w-full flex-col items-center justify-center text-white/80">
              <PlayCircle className="mb-2 h-16 w-16 opacity-80" />
              <p className="text-sm font-medium">Reproductor de Video Placeholder</p>
              <p className="text-xs text-white/50">{step.content}</p>
            </div>
          </div>
          <div className="prose max-w-none dark:prose-invert">
            <h3>Sobre este video</h3>
            <p>Descripción del contenido educativo y puntos clave a aprender.</p>
          </div>
        </div>
      );

    case 'article':
      return (
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" /> Artículo
              </Badge>
              <span className="text-xs text-muted-foreground">{step.duration_minutes || 5} min de lectura</span>
            </div>
            {/* Renderizado seguro de HTML (en prod usar DOMPurify) */}
            <div 
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: step.content || '<p>Contenido del artículo...</p>' }}
            />
          </CardContent>
        </Card>
      );

    case 'quiz':
      return (
        <Card className="border-l-4 border-l-primary shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Evaluación de Conocimiento</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Completa este cuestionario para validar lo aprendido en este módulo.
            </p>
            {/* Aquí se integraría el componente de Quiz interactivo */}
            <div className="w-full rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
              El componente de Quiz Interactivo se cargará aquí (WIP)
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-10 text-muted-foreground">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Tipo de contenido no soportado: {step.type}
        </div>
      );
  }
}