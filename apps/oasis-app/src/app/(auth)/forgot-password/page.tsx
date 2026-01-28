import { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | OASIS Platform",
  description: "Solicita el restablecimiento de tu contraseña.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}