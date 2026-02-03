'use client';

import React, { useState } from 'react';
import { Contact } from '@/frontend/actions/crm.actions';
import { Button } from '@/frontend/components/ui/button';
import { Mail, Phone, ChevronRight, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/frontend/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';

interface ContactTableProps {
    contacts: Contact[];
}

// Risk Level Badge Component
const RiskBadge = ({ level }: { level: Contact['riskLevel'] }) => {
  const config = {
    bajo: { label: 'Bajo', className: 'bg-green-100 text-green-700 border-green-200' },
    medio: { label: 'Medio', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    alto: { label: 'Alto', className: 'bg-red-100 text-red-700 border-red-200' },
  };
  const { label, className } = config[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {level === 'alto' && <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => {
  const color = progress >= 80 ? 'bg-green-500' : progress >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{progress}%</span>
    </div>
  );
};

// Certification Badge Component
const CertificationBadge = ({ status }: { status: Contact['certificationStatus'] }) => {
  const config = {
    emitido: { label: 'Emitido', icon: CheckCircle, className: 'text-green-600' },
    pendiente: { label: 'Pendiente', icon: Clock, className: 'text-yellow-600' },
    expirado: { label: 'Expirado', icon: AlertTriangle, className: 'text-red-600' },
    no_aplica: { label: 'N/A', icon: X, className: 'text-gray-400' },
  };
  const { label, icon: Icon, className } = config[status];
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
};

export const ContactTable: React.FC<ContactTableProps> = ({ contacts }) => {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    return (
        <>
            <div className="w-full overflow-hidden rounded-xl border shadow-sm bg-white dark:bg-zinc-950">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-900 border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Participante</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Cohorte</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Nivel de Riesgo</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Progreso</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Certificación</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No se encontraron participantes.
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr 
                                    key={contact.id} 
                                    className="group hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    {/* Participant Name + Avatar */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                               {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                                    {contact.firstName} {contact.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{contact.organization || 'Sin organización'}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Cohort */}
                                    <td className="px-6 py-4">
                                        {contact.cohort ? (
                                            <Badge variant="outline" className="font-normal">
                                                {contact.cohort}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Sin asignar</span>
                                        )}
                                    </td>

                                    {/* Risk Level */}
                                    <td className="px-6 py-4">
                                        <RiskBadge level={contact.riskLevel} />
                                    </td>

                                    {/* Progress */}
                                    <td className="px-6 py-4">
                                        <ProgressBar progress={contact.progress} />
                                    </td>

                                    {/* Certification */}
                                    <td className="px-6 py-4">
                                        <CertificationBadge status={contact.certificationStatus} />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Enviar email">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Llamar">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" title="Ver detalle">
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slide-over Drawer for Contact Details */}
            <Sheet open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {selectedContact && (
                        <>
                            <SheetHeader className="pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl uppercase">
                                        {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-xl">
                                            {selectedContact.firstName} {selectedContact.lastName}
                                        </SheetTitle>
                                        <SheetDescription>
                                            {selectedContact.organization || 'Sin organización'}
                                        </SheetDescription>
                                        <div className="mt-1">
                                            <RiskBadge level={selectedContact.riskLevel} />
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="py-6 space-y-6">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Progreso en Journey</p>
                                        <ProgressBar progress={selectedContact.progress} />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Certificación</p>
                                        <CertificationBadge status={selectedContact.certificationStatus} />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Información de Contacto</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <a href={`mailto:${selectedContact.email}`} className="hover:text-blue-600">
                                                {selectedContact.email}
                                            </a>
                                        </div>
                                        {selectedContact.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <span>{selectedContact.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cohort & Journey */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Programa</h4>
                                    <div className="text-sm text-gray-600">
                                        <p><span className="font-medium">Cohorte:</span> {selectedContact.cohort || 'Sin asignar'}</p>
                                        <p><span className="font-medium">Nivel OASIS:</span> {selectedContact.level}</p>
                                        <p><span className="font-medium">XP Acumulados:</span> {selectedContact.xp}</p>
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedContact.tags.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Etiquetas</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedContact.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 border-t">
                                    <div className="flex gap-2">
                                        <Button className="flex-1" variant="outline" asChild>
                                            <Link href={`/admin/crm/contacts/${selectedContact.id}`}>
                                                Ver Perfil Completo
                                            </Link>
                                        </Button>
                                        <Button className="flex-1">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Contactar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
