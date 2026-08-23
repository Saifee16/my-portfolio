import { AdminShell } from "@/components/admin/admin-shell";
import { AdminEditor } from "@/components/admin/admin-editor";
export const dynamic = "force-dynamic";
export default function Page() { return <AdminShell><AdminEditor section="projects" /></AdminShell>; }
