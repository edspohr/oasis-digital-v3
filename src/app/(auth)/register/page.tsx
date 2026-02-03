import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Registro | OASIS Platform",
  description: "Crea una nueva cuenta en OASIS Platform.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}