import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TenantForm from "../../components/TenantForm";

import { fetchTenant, updateTenant } from "../../api/api";

export default function EditTenant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState(null);
  const [originalTenant, setOriginalTenant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingData, setPendingData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ---------------- FETCH TENANT ---------------- */
  useEffect(() => {
    const loadTenant = async () => {
      try {
        const data = await fetchTenant(id);
        setTenant(data);
        setOriginalTenant(data); // baseline for comparison
      } catch (err) {
        setError("Failed to load tenant");
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [id]);

  /* ---------------- CHANGE DETECTION ---------------- */
  const hasChanges = (newData) => {
    if (!originalTenant) return false;

    return Object.keys(newData).some((key) => {
      return String(newData[key] ?? "") !== String(originalTenant[key] ?? "");
    });
  };

  /* ---------------- INTERCEPT SUBMIT ---------------- */
  const handleSubmitIntercept = (formData) => {
    if (!hasChanges(formData)) {
      alert("No changes detected");
      return;
    }

    setPendingData(formData);
    setShowModal(true);
  };

  /* ---------------- CONFIRM UPDATE ---------------- */
  const confirmUpdate = async () => {
    try {
      await updateTenant(id, pendingData);
      navigate(`/manager/tenants/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update tenant");
    } finally {
      setShowModal(false);
      setPendingData(null);
    }
  };

  /* ---------------- CANCEL MODAL ---------------- */
  const cancelUpdate = () => {
    setShowModal(false);
    setPendingData(null);
  };

  /* ---------------- STATES ---------------- */
  if (loading) return <div className="p-6">Loading tenant...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!tenant) return <div className="p-6">Tenant not found.</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 relative">

      {/* FORM */}
      <TenantForm
        mode="edit"
        initialData={tenant}
        onSubmit={handleSubmitIntercept}
      />

      {/* ---------------- CONFIRMATION MODAL ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <h2 className="text-lg font-semibold mb-4">
              Confirm Update
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              You have made changes to this tenant. Are you sure you want to save these updates?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelUpdate}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
              >
                Confirm Update
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}