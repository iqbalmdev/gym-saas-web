import { AdminStubPage } from "@/components/admin/admin-stub-page";

export default function CrmPage() {
  return (
    <AdminStubPage
      title="Leads"
      panelTitle="Lead pipeline"
      description="Kanban stages New → Contacted → Trial → Converted → Lost will use this CRM-light panel layout."
    />
  );
}
