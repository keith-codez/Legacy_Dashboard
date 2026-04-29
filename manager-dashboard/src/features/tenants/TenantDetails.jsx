import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { getTenantDetails } from "../../api/api";

function TenantDetails({ mode = "manager" }) {
  const { id } = useParams();

  const basePath = mode === "owner" ? "/owner" : "/manager";
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("tenant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTenantDetails(id);
        setData(res);
      } catch (err) {
        setError("Failed to load tenant details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!data) return null;

  const { tenant, leases, interactions, invoices, summary } = data;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3">

        {/* SINGLE PANEL */}
        <div className="bg-white rounded-xl shadow">

          {/* Tabs */}
          <div className="flex flex-wrap bg-blue-600 text-white text-sm font-semibold rounded-t-xl overflow-hidden">
            {["tenant", "analytics", "leases", "interactions", "invoices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 transition ${
                  activeTab === tab ? "bg-blue-800" : "hover:bg-blue-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-6">

            {/* TENANT */}
            {activeTab === "tenant" && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 />
                  <h2 className="text-lg font-bold">
                    {tenant.company_name}
                  </h2>
                </div>

                <Row label="Primary Contact">{tenant.primary_contact}</Row>
                <Row label="Email"><Mail size={14} /> {tenant.primary_email}</Row>
                <Row label="Phone"><Phone size={14} /> {tenant.phone}</Row>
                <Row label="Industry"><Briefcase size={14} /> {tenant.industry}</Row>

                <Row label="Status">
                  <span className={`px-2 py-1 rounded text-xs ${
                    summary.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200"
                  }`}>
                    {summary.status}
                  </span>
                </Row>

                <Row label="Date Added">
                  <Calendar size={14} />
                  {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                </Row>
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-lg font-bold mb-4">Analytics</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Stat label="Units" value={summary.unit_count} />
                  <Stat label="Paid" value={`$${summary.total_paid}`} />
                  <Stat label="Balance" value={`$${summary.balance}`} />
                  <Stat label="Credit" value={`$${summary.credit || 0}`} />
                </div>
              </div>
            )}

            {/* LEASES */}
            {activeTab === "leases" && (
              <div>
                <h2 className="font-bold mb-4">Leases</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-500 border-b bg-gray-50">
                      <tr>
                        <th className="py-3 px-2">Unit</th>
                        <th className="px-2">Start</th>
                        <th className="px-2">End</th>
                        <th className="px-2">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {leases.map((l) => (
                        <tr
                          key={l.id}
                          onClick={() => navigate(`${basePath}/leases/${l.id}`)}
                          className="border-b hover:bg-gray-50 cursor-pointer transition"
                        >
                          <td className="py-3 px-2 font-medium">
                            {l.unit_no || l.unit}
                          </td>

                          <td className="px-2">
                            {new Date(l.start_date).toLocaleDateString("en-GB")}
                          </td>

                          <td className="px-2">
                            {new Date(l.end_date).toLocaleDateString("en-GB")}
                          </td>

                          <td className="px-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              l.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200"
                            }`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INTERACTIONS */}
            {activeTab === "interactions" && (
              <div>
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <MessageSquare size={18} /> Interactions
                </h2>

                <div className="space-y-3">
                  {interactions.map((i) => (
                    <div key={i.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between">
                        <p className="font-semibold">{i.type}</p>
                        <p className="text-xs text-gray-500">{i.date}</p>
                      </div>
                      <p className="text-sm">{i.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INVOICES */}
            {activeTab === "invoices" && (
              <div>
                <h2 className="font-bold mb-4">Invoices</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-500 border-b bg-gray-50">
                      <tr>
                        <th className="py-3">Invoice</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoices.map((inv) => {
                        const total = Number(inv.total_amount);
                        const balance = Number(inv.balance);
                        const paid = total - balance;

                        return (
                          <tr
                            key={inv.id}
                            onClick={() => navigate(`${basePath}/invoices/${inv.id}`)}
                            className="border-b hover:bg-gray-50 cursor-pointer transition"
                          >
                            <td className="py-3 font-medium">{inv.invoice_no}</td>
                            <td>${total.toFixed(2)}</td>
                            <td className="text-green-600">${paid.toFixed(2)}</td>
                            <td className="text-red-600">${balance.toFixed(2)}</td>
                            <td>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                inv.status === "Paid"
                                  ? "bg-green-100 text-green-700"
                                  : inv.status === "Partially Paid"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* Helpers */
const Row = ({ label, children }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="flex items-center gap-1 text-right">{children}</span>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-100 p-4 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default TenantDetails;