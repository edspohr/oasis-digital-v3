import React from "react";
import { BackgroundWaves } from "@/shared/visuals/BackgroundWaves";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      {/* Elemento visual de fondo (reutilizado) */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <BackgroundWaves />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  );
}