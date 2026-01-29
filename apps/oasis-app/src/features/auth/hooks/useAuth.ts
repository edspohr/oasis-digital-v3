import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

// 1. Hook Principal
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// 2. Hook Auxiliar: Organización (CORREGIDO)
// Debe devolver el contexto completo porque los componentes destructuran múltiples propiedades de él.
export const useCurrentOrganization = () => {
  return useAuth();
};

// 3. Hook Auxiliar: Perfil (Opcional, devuelve el dato directo)
export const useProfile = () => {
  const context = useAuth();
  return context.profile;
};