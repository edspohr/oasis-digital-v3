"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";
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
import { Separator } from "@/shared/components/ui/separator";
import { createClient } from "@/backend/supabase/client";

// Schema de validacion
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electronico valido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

type LoginValues = z.infer<typeof loginSchema>;

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const supabase = createClient();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login con email/password via Supabase
  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Error en login:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Credenciales incorrectas");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor confirma tu email antes de iniciar sesion");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.session) {
        // Log audit event
        try {
          await supabase.rpc('log_login', {
            p_provider: 'email',
            p_user_agent: navigator.userAgent
          });
        } catch (auditError) {
          // Silent fail for audit - don't block login
          console.warn("Audit log failed:", auditError);
        }

        toast.success("Bienvenido de vuelta!");

        // Refresh para cargar el AuthProvider con la nueva sesion
        window.location.href = "/";
      }
    } catch (error: unknown) {
      console.error("Error en login:", error);
      toast.error("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  // Login con Google via Supabase OAuth
  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Error Google login:", error);
        toast.error("Error al iniciar sesion con Google");
      }
      // Si no hay error, Supabase redirige automaticamente a Google
    } catch (error) {
      console.error("Error Google login:", error);
      toast.error("Error de conexion con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  // --- DEV MOCK LOGIN UI ---
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

  if (isMockMode) {
    const handleDevLogin = (userId: string) => {
        setIsLoading(true);
        // Persist choice for mock handler
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('MOCK_USER_ID', userId);
        }
        // Redirect home to force re-fetch of auth/me
        setTimeout(() => {
            window.location.href = "/";
        }, 500);
    };

    return (
      <Card className="w-full max-w-2xl border-amber-200 bg-amber-50/30 shadow-xl">
        <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Lock className="h-6 w-6 text-amber-600" />
            </div>
          <CardTitle className="text-2xl font-bold text-amber-900">DEV MODE LOGIN</CardTitle>
          <CardDescription className="text-amber-700/80">
            Escoge un perfil para simular la sesión (Sin contraseña)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            
            <DevProfileCard 
                title="Super Admin"
                role="Fundación Summer"
                desc="Acceso total a la plataforma"
                icon="👑"
                color="bg-purple-100 border-purple-200 text-purple-900"
                onClick={() => handleDevLogin('usr-super-001')}
            />

            <DevProfileCard 
                title="Admin Organización"
                role="Tech Corp"
                desc="Gestión de Journey y equipo"
                icon="🏢"
                color="bg-blue-100 border-blue-200 text-blue-900"
                onClick={() => handleDevLogin('usr-admin-002')}
            />

            <DevProfileCard 
                title="Participante"
                role="Tech Corp"
                desc="Usuario final en Journey activo"
                icon="🚀"
                color="bg-green-100 border-green-200 text-green-900"
                onClick={() => handleDevLogin('usr-part-003')}
            />

            <DevProfileCard 
                title="Suscriptor"
                role="Edu Global"
                desc="Usuario curioso auto-registrado"
                icon="👀"
                color="bg-gray-100 border-gray-200 text-gray-900"
                onClick={() => handleDevLogin('usr-part-004')}
            />

        </CardContent>
        <CardFooter className="justify-center border-t border-amber-200 p-4">
            <p className="text-xs text-amber-600 font-mono">
                NEXT_PUBLIC_USE_MOCK_DATA=true
            </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-muted/40 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">OASIS Platform</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Continuar con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              O continua con email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electronico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="usuario@empresa.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Contrasena
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Olvidaste tu contrasena?
                    </Link>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="********"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                  "Iniciar Sesion"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          No tienes una cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrate aqui
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

interface DevProfileCardProps {
    title: string;
    role: string;
    desc: string;
    icon: string;
    color: string;
    onClick: () => void;
}

function DevProfileCard({ title, role, desc, icon, color, onClick }: DevProfileCardProps) {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-md text-left ${color}`}
        >
            <div className="flex w-full justify-between items-start mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 bg-white/50 px-2 py-1 rounded">
                    {role}
                </span>
            </div>
            <div className="font-bold text-lg mb-1">{title}</div>
            <div className="text-xs opacity-80 leading-tight">
                {desc}
            </div>
        </button>
    );
}
