import { useState, useEffect } from "react";

export default function TenantForm({
  initialData = {},
  onSubmit,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    company_name: "",
    primary_contact: "",
    primary_email: "",
    phone: "",
    industry: "",
    status: "Active",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        company_name: initialData.company_name || "",
        primary_contact: initialData.primary_contact || "",
        primary_email: initialData.primary_email || "",
        phone: initialData.phone || "",
        industry: initialData.industry || "",
        status: initialData.status || "Active",
      });
    }
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
      <h2 className="text-2xl font-semibold mb-6">
        {mode === "edit" ? "Edit Tenant" : "Create New Tenant"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <InputField
          label="Company Name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
        />

        {/* Primary Contact */}
        <InputField
          label="Primary Contact"
          name="primary_contact"
          value={formData.primary_contact}
          onChange={handleChange}
        />

        {/* Email */}
        <InputField
          label="Primary Email"
          name="primary_email"
          type="email"
          value={formData.primary_email}
          onChange={handleChange}
        />

        {/* Phone */}
        <InputField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        {/* Industry */}
        <InputField
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
            <button
            type=""
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {mode === "edit" ? "Update Tenant" : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        required
      />
    </div>
  );
}