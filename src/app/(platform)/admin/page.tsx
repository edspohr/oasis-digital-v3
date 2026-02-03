import { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { RoleGuard } from "@/shared/components/guards/RoleGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard | OASIS Platform",
  description: "Centro de control y administración.",
};

export default function AdminPage() {
  return (
    // Protegemos la ruta para que solo 'owner' o 'admin' puedan verla.
    // (RoleGuard debe manejar la redirección si falla)
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AdminDashboard />
      </div>
    </RoleGuard>
  );
}