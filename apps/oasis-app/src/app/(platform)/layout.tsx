"use client";

import { Sidebar } from "@/shared/components/layout/Sidebar";
import { BackgroundWaves } from "@/shared/visuals/BackgroundWaves";
import { OASISChat } from "@/frontend/components/ai/OASISChat";
import { ForumBanner } from "@/frontend/components/participant/ForumBanner";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-gray-50/50 flex overflow-hidden">
          <BackgroundWaves />

          <Sidebar />

          <main className="flex-1 relative z-10 h-screen overflow-y-auto w-full flex flex-col">
              <ForumBanner />
              <div className="p-4 md:p-8 flex-1">
                  <div className="max-w-7xl mx-auto">
                      {children}
                  </div>
              </div>
          </main>

          <OASISChat />
      </div>
    </AuthProvider>
  );
}
