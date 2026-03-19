import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import unitsData from "../../data/units.json";

function EditUnit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const unit = unitsData.find((u) => u.id === Number(id));

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (unit) setForm({ ...unit });
  }, [unit]);

  if (!unit || !form) return <div className="p-6">Loading...</div>;

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.unit_no || !form.unit_type) {
      setError("Missing required fields");
      return;
    }

    console.log("Updated:", form);

    navigate(`/manager/units/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Edit {unit.unit_no}</h1>
        <button onClick={() => navigate(-1)}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-4">

        {error && <p className="text-red-500 col-span-2">{error}</p>}

        <Input name="unit_no" label="Unit Number" value={form.unit_no} onChange={handleChange} />
        <Input name="floor" label="Floor" type="number" value={form.floor} onChange={handleChange} />
        <Input name="size_sqm" label="Size" type="number" value={form.size_sqm} onChange={handleChange} />
        <Input name="base_rent" label="Rent" type="number" value={form.base_rent} onChange={handleChange} />

        <Select name="unit_type" value={form.unit_type} onChange={handleChange} options={["Office","Retail","Warehouse","Other"]} />
        <Select name="status" value={form.status} onChange={handleChange} options={["Vacant","Occupied"]} />

        <div className="col-span-2 flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
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