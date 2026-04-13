import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TenantForm from "../../components/TenantForm";

import { fetchTenant, updateTenant } from "../../api/api";

export default function EditTenant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- FETCH TENANT ---------------- */
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const data = await fetchTenant(id);
        setTenant(data);
      } catch (err) {
        setError("Failed to load tenant");
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [id]);

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async (formData) => {
    try {
      await updateTenant(id, formData);

      // Redirect after success
      navigate(`/manager/tenants/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update tenant");
    }
  };

  /* ---------------- STATES ---------------- */
  if (loading) return <div className="p-6">Loading tenant...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!tenant) return <div className="p-6">Tenant not found.</div>;

  /* ---------------- UI ---------------- */
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