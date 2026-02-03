import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Restablecer Contraseña | OASIS Platform",
  description: "Crea una nueva contraseña para tu cuenta.",
};

export default function ResetPasswordPage() {
  return (
    // Suspense es necesario porque usamos useSearchParams
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Cargando...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}