import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTenants, createInteraction } from "../../api/api";

function RecordInteraction() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  const [form, setForm] = useState({
    tenant: "",
    type: "",
    subject: "",
    notes: "",
    priority: "Medium",
    recorded_by: "Admin",
    date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");

  /* ---------------- LOAD TENANTS ---------------- */
  useEffect(() => {
    const loadTenants = async () => {
      try {
        const data = await getTenants();
        setTenants(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tenants");
      } finally {
        setLoadingTenants(false);
      }
    };

    loadTenants();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "tenant" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      tenant: form.tenant,
      type: form.type,
      subject: form.subject.trim(),
      notes: form.notes.trim(),
      priority: form.priority,
      recorded_by: form.recorded_by,
      date: form.date,
    };

    // HARD VALIDATION
    if (
      !payload.tenant ||
      !payload.type ||
      !payload.subject ||
      !payload.notes
    ) {
      setError("Missing required fields");
      return;
    }

    try {
      await createInteraction(payload);
      navigate("/manager/interactions");
    } catch (err) {
      console.error(err);
      setError("Failed to record interaction");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Record New Interaction</h1>
        <button
          onClick={() => navigate("/manager/interactions")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 space-y-4"
      >
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* TENANT */}
          <div>
            <label className="block font-medium mb-1">Tenant</label>
            <select
              name="tenant"
              value={form.tenant}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={loadingTenants}
              required
            >
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div>
            <label className="block font-medium mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select Type</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* SUBJECT */}
        <div>
          <label className="block font-medium mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter subject"
            required
          />
        </div>

        {/* NOTES */}
        <div>
          <label className="block font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={4}
            placeholder="Enter notes/details"
            required
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/manager/interactions")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save Interaction
          </button>
        </div>

      </form>
    </div>
  );
}

export default RecordInteraction;