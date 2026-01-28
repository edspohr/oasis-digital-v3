"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { authApi } from "@/core/api";

const resetSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Capturar el token de la URL (?token=...)
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Validar que exista el token al montar
  useEffect(() => {
    if (!token) {
      toast.error("Enlace inválido o expirado. Solicita uno nuevo.");
    }
  }, [token]);

  async function onSubmit(values: z.infer<typeof resetSchema>) {
    if (!token) {
      toast.error("Token no encontrado");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.updatePassword({
        token: token,
        new_password: values.password,
      });

      setIsSuccess(true);
      toast.success("Contraseña actualizada correctamente");
      
      // Redirigir al login después de unos segundos
      setTimeout(() => router.push("/login"), 3000);
      
    } catch (error: any) {
      const msg = error.response?.data?.detail || "No se pudo actualizar la contraseña.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>¡Contraseña Restablecida!</CardTitle>
          <CardDescription>
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir al Login ahora
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-700">Enlace Inválido</CardTitle>
          <CardDescription className="text-red-600">
            Este enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full border-red-200 hover:bg-red-100" onClick={() => router.push("/forgot-password")}>
            Solicitar nuevo enlace
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-center">Nueva Contraseña</CardTitle>
        <CardDescription className="text-center">
          Ingresa tu nueva contraseña para recuperar el acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Contraseña
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}