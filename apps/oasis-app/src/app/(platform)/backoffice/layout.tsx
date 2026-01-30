import { backofficeGuard } from "@/core/auth/guards";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await backofficeGuard();

  return <>{children}</>;
}
