import { useParams, useNavigate } from "react-router-dom";
import TenantForm from "../../components/TenantForm";
import tenants from "../../data/tenants.json";

export default function EditTenant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tenant = tenants.find((t) => t.id === Number(id));

  const handleUpdate = (data) => {
    const updatedTenant = {
      ...tenant,
      ...data,
    };

    console.log("Updated Tenant:", updatedTenant);

    // Later: PUT to API
    navigate(`/manager/tenants/${id}`);
  };

  if (!tenant) {
    return <div className="p-6">Tenant not found.</div>;
  }

  return (
    <div className="p-6">
      <TenantForm
        mode="edit"
        initialData={tenant}
        onSubmit={handleUpdate}
      />
    </div>
  );
}