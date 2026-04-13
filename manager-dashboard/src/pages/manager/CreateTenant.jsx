import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TenantForm from "../../components/TenantForm";

import { createTenant } from "../../api/api";

export default function CreateTenant() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- CREATE ---------------- */
  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const newTenant = await createTenant(formData);
      console.log("NEW TENANT RESPONSE:", newTenant);

      // Redirect to newly created tenant
      navigate(`/manager/tenants/${newTenant.id}`);

    } catch (err) {
      console.error(err);
      setError("Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6">

      {error && (
        <div className="mb-4 text-red-600 font-medium">
          {error}
        </div>
      )}

      <TenantForm
        mode="create"
        onSubmit={handleCreate}
        loading={loading}
      />

    </div>
  );
}