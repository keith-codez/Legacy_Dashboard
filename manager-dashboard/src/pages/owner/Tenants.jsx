import TenantList from "../../features/tenants/Tenants";
import { useNavigate } from "react-router-dom";

export default function OwnerTenants() {
  const navigate = useNavigate();

  return (
    <TenantList
      mode="owner"
      onViewTenant={(id) => navigate(`/owner/tenants/${id}`)}
      onEditTenant={(id) => navigate(`/owner/tenants/${id}/edit`)}
    />
  );
}