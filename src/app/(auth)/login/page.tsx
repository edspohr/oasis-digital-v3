import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión | OASIS Platform",
  description: "Accede a tu cuenta de OASIS para gestionar tus experiencias.",
};

export default function LoginPage() {
  return <LoginForm />;
}