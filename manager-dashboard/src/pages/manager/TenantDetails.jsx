import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MessageSquare,
} from "lucide-react";

import {
  getTenantById,
  getTenantLeases,
  getTenantUnits,
  getTenantInteractions,
  getTenantBalance,
} from "../../utils/tenantSelectors";

function TenantDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("tenant");

  const tenant = useMemo(() => getTenantById(id), [id]);
  const leases = useMemo(() => getTenantLeases(id), [id]);
  const units = useMemo(() => getTenantUnits(id), [id]);
  const interactions = useMemo(
    () => getTenantInteractions(id),
    [id]
  );
  const balance = useMemo(() => getTenantBalance(id), [id]);

  const totalRentPaid = leases.reduce(
    (sum, l) => sum + (l.monthly_rent || 0),
    0
  );

  if (!tenant) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-semibold">
          Tenant not found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div
        className="container mx-auto p-1 flex flex-col md:flex-row gap-6"
        style={{ minHeight: "calc(100vh - 100px)" }}
      >
        {/* LEFT PANEL */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div className="w-full max-w-lg mx-auto">
            {/* Tabs */}
            <div className="flex justify-between bg-blue-600 text-white font-semibold text-lg p-2 rounded-t-md">
              {["tenant", "billing", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center py-2 ${
                    activeTab === tab
                      ? "bg-blue-800"
                      : "bg-blue-600"
                  } transition-colors duration-200 rounded-md`}
                >
                  {tab === "tenant"
                    ? "Tenant"
                    : tab === "billing"
                    ? "Billing"
                    : "Documents"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 bg-white rounded-b-lg shadow-md">
              {activeTab === "tenant" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold">
                      {tenant.company_name}
                    </h2>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <Row label="Primary Contact">
                      {tenant.primary_contact}
                    </Row>

                    <Row
                      label="Email"
                      icon={<Mail className="w-4 h-4" />}
                    >
                      {tenant.primary_email}
                    </Row>

                    <Row
                      label="Phone"
                      icon={<Phone className="w-4 h-4" />}
                    >
                      {tenant.phone}
                    </Row>

                    <Row
                      label="Industry"
                      icon={<Briefcase className="w-4 h-4" />}
                    >
                      {tenant.industry}
                    </Row>

                    <Row label="Status">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tenant.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </Row>

                    <Row
                      label="Date Added"
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      {new Date(
                        tenant.created_at
                      ).toLocaleDateString("en-GB")}
                    </Row>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="text-gray-600">
                  Billing module coming soon.
                </div>
              )}

              {activeTab === "documents" && (
                <div className="text-gray-600">
                  Documents module coming soon.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-2/3 flex flex-col gap-6">
          {/* Analytics */}
          <div className="p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
              Tenant Analytics
            </h2>

            <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
              <Stat
                label="Total Units"
                value={units.length}
                bg="bg-blue-100"
              />
              <Stat
                label="Total Rent Paid"
                value={`$${totalRentPaid.toLocaleString()}`}
                bg="bg-green-100"
              />
              <Stat
                label="Outstanding Balance"
                value={`$${balance.toLocaleString()}`}
                bg="bg-yellow-100"
              />
            </div>
          </div>

          {/* Lease History */}
          <div className="bg-white p-6 rounded-xl shadow-md hidden md:block">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Lease History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leases.map((l) => (
                    <tr
                      key={l.id}
                      className="even:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        {l.unit_id || "—"}
                      </td>
                      <td className="px-4 py-2">
                        {l.start_date}
                      </td>
                      <td className="px-4 py-2">
                        {l.end_date}
                      </td>
                      <td className="px-4 py-2 font-semibold text-green-600">
                        {l.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactions – Desktop */}
          <div className="bg-white p-6 rounded-xl shadow-md hidden md:block">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interaction History
            </h2>

            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left">
                    Summary
                  </th>
                  <th className="px-4 py-3 text-left">
                    Logged By
                  </th>
                </tr>
              </thead>
              <tbody>
                {interactions.map((i) => (
                  <tr
                    key={i.id}
                    className="even:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {i.date}
                    </td>
                    <td className="px-4 py-2">
                      {i.type}
                    </td>
                    <td className="px-4 py-2">
                      {i.subject}
                    </td>
                    <td className="px-4 py-2">
                      {i.recorded_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Interactions */}
          <div className="md:hidden bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-bold mb-3 text-gray-800">
              Interaction History
            </h2>

            <div className="flex space-x-4 overflow-x-auto pb-2">
              {interactions.map((item) => (
                <div
                  key={item.id}
                  className="min-w-[260px] bg-gray-50 border rounded-lg p-4 flex-shrink-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 mb-3">
                    {item.summary}
                  </p>

                  <div className="text-xs text-gray-500">
                    Logged by: {item.logged_by}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Swipe to view more →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small helpers */

const Row = ({ label, icon, children }) => (
  <div className="flex justify-between">
    <span className="font-semibold flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span>{children}</span>
  </div>
);

const Stat = ({ label, value, bg }) => (
  <div className={`${bg} p-4 rounded-xl shadow`}>
    <h3 className="text-sm font-medium text-gray-700">
      {label}
    </h3>
    <p className="text-3xl font-bold text-gray-800">
      {value}
    </p>
  </div>
);

export default TenantDetails;