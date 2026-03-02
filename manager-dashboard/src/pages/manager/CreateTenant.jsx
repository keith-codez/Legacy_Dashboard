import { useNavigate } from "react-router-dom";
import TenantForm from "../../components/TenantForm";
import tenants from "../../data/tenants.json";

export default function CreateTenant() {
  const navigate = useNavigate();

  const handleCreate = (data) => {
    const newTenant = {
      id: Date.now(),
      created_at: new Date().toISOString().split("T")[0],
      ...data,
    };

    console.log("New Tenant:", newTenant);

    // Later: POST to API
    // For now: simulate success
    navigate("/manager/tenants");
  };

  return (
    <div className="p-6">
      <TenantForm mode="create" onSubmit={handleCreate} />
    </div>
  );
}