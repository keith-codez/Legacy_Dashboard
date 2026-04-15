import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUnit } from "../../api/api";

function RecordUnit() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    unit_no: "",
    floor: "",
    size_sqm: "",
    base_rent: "",
    unit_type: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "floor" || name === "size_sqm" || name === "base_rent"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const unitNo = form.unit_no?.trim()?.toUpperCase();

  const payload = {
    unit_no: unitNo,
    floor: Number(form.floor),
    size_sqm: Number(form.size_sqm),
    base_rent: Number(form.base_rent),
    unit_type: form.unit_type?.trim(),
  };

  const invalid =
    !payload.unit_no ||
    !payload.floor ||
    !payload.size_sqm ||
    !payload.base_rent ||
    !payload.unit_type;

  if (invalid) {
    setError("Invalid payload: missing required fields");
    return;
  }

  try {
    await createUnit(payload);
    navigate("/manager/units");
  } catch (err) {
    console.error(err?.response?.data || err);
    setError("Unit creation failed");
  }
};


  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Unit</h1>
        <button onClick={() => navigate("/manager/units")}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 space-y-4">

        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            label="Unit Number"
            name="unit_no"
            value={form.unit_no}
            onChange={handleChange}
          />

          <Input
            label="Floor"
            name="floor"
            type="number"
            value={form.floor}
            onChange={handleChange}
          />

          <Input
            label="Size (sqm)"
            name="size_sqm"
            type="number"
            value={form.size_sqm}
            onChange={handleChange}
          />

          <Input
            label="Base Rent"
            name="base_rent"
            type="number"
            value={form.base_rent}
            onChange={handleChange}
          />

          <Select
            label="Unit Type"
            name="unit_type"
            value={form.unit_type}
            onChange={handleChange}
            options={["Office", "Retail", "Warehouse", "Other"]}
          />
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Save Unit
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

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <select {...props} className="w-full border p-2 rounded">
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default RecordUnit;