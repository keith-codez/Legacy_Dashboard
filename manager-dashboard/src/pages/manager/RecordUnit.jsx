import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecordUnit() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    unit_no: "",
    floor: "",
    size_sqm: "",
    base_rent: "",
    unit_type: "",
    status: "Vacant",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.unit_no || !form.floor || !form.size_sqm || !form.base_rent || !form.unit_type) {
      setError("Please fill in all required fields.");
      return;
    }

    // Normally save to backend or localStorage
    console.log("New Unit Recorded:", form);

    navigate("/manager/units"); // redirect to units list
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add New Unit</h1>
        <button
          onClick={() => navigate("/manager/units")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 space-y-4"
      >
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Unit Number</label>
            <input
              type="text"
              name="unit_no"
              value={form.unit_no}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Floor</label>
            <input
              type="number"
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Size (sqm)</label>
            <input
              type="number"
              name="size_sqm"
              value={form.size_sqm}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Base Rent ($)</label>
            <input
              type="number"
              name="base_rent"
              value={form.base_rent}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Unit Type</label>
            <select
              name="unit_type"
              value={form.unit_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Type</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/manager/units")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save Unit
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecordUnit;