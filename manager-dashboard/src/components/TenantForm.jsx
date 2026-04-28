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

    // Basic phone sanitization (numbers + + only)
    if (name === "phone") {
      const sanitized = value.replace(/[^\d+]/g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isDisabled =
    !formData.company_name ||
    !formData.primary_contact ||
    !formData.primary_email;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border p-8">
      <h2 className="text-2xl font-semibold mb-8">
        {mode === "edit" ? "Edit Tenant" : "Create New Tenant"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <InputField
          label="Company Name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="e.g. Lantern Intelligence Solutions"
        />

        {/* Primary Contact */}
        <InputField
          label="Primary Contact Full Name"
          name="primary_contact"
          value={formData.primary_contact}
          onChange={handleChange}
          placeholder="e.g. John Doe"
        />

        {/* Email */}
        <InputField
          label="Primary Email"
          name="primary_email"
          type="email"
          value={formData.primary_email}
          onChange={handleChange}
          placeholder="e.g. john@company.com"
        />

        {/* Phone (Improved UX) */}
        <PhoneField
          value={formData.phone}
          onChange={handleChange}
        />

        {/* Industry */}
        <InputField
          label="Industry"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          placeholder="e.g. Real Estate, Logistics"
        />

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isDisabled}
            className={`px-6 py-2 rounded-lg text-white transition ${
              isDisabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {mode === "edit" ? "Update Tenant" : "Create Tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================
   Reusable Input Component
========================= */
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        required
      />
    </div>
  );
}

/* =========================
   Phone Field (Key Upgrade)
========================= */
function PhoneField({ value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>

      <div className="flex">
        {/* Country Code */}
        <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-sm">
          +263
        </div>

        {/* Phone Input */}
        <input
          type="tel"
          name="phone"
          value={value.replace("+263", "")}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            onChange({
              target: {
                name: "phone",
                value: "+263" + raw,
              },
            });
          }}
          placeholder="7XXXXXXXX"
          className="w-full border border-gray-300 rounded-r-lg px-4 py-2.5 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <p className="text-xs text-gray-500">
        Enter number without leading 0. Format: +2637XXXXXXXX
      </p>
    </div>
  );
}