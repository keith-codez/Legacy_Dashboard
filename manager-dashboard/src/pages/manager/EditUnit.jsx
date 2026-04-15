import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUnit, updateUnit } from "../../api/api";

function EditUnit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUnit(id);
        setForm(data);
      } catch {
        setError("Failed to load unit");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading || !form) return <div className="p-6">Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "floor" || name === "size_sqm" || name === "base_rent"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { status, unit_no, ...payload } = form; // enforce immutability

      await updateUnit(id, payload);

      navigate(`/manager/units/${id}`);
    } catch {
      setError("Update failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Edit Unit {form.unit_no}
        </h1>

        <button onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-4"
      >
        {error && (
          <p className="text-red-500 col-span-2">{error}</p>
        )}

        {/* READ ONLY IDENTITY */}
        <div className="col-span-2">
          <label className="text-sm">Unit Number</label>
          <div className="p-2 border rounded bg-gray-100 text-gray-600">
            {form.unit_no}
          </div>
        </div>

        <Input
          name="floor"
          label="Floor"
          type="number"
          value={form.floor}
          onChange={handleChange}
        />

        <Input
          name="size_sqm"
          label="Size (sqm)"
          type="number"
          value={form.size_sqm}
          onChange={handleChange}
        />

        <Input
          name="base_rent"
          label="Base Rent"
          type="number"
          value={form.base_rent}
          onChange={handleChange}
        />

        <Select
          name="unit_type"
          value={form.unit_type}
          onChange={handleChange}
          options={["Office", "Retail", "Warehouse", "Other"]}
        />

        {/* STATUS DISPLAY ONLY */}
        <div>
          <label className="block text-sm mb-1">Status</label>
          <div className="p-2 border rounded bg-gray-100 text-gray-600">
            {form.status}
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <input {...props} className="w-full border p-2 rounded" />
  </div>
);

const Select = ({ options, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{props.name}</label>
    <select {...props} className="w-full border p-2 rounded">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default EditUnit;