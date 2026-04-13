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

function TenantDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("tenant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /* ---------------- FETCH ---------------- */
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
      <div className="container mx-auto p-3 flex flex-col md:flex-row gap-6">

        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow">

            {/* Tabs */}
            <div className="flex bg-blue-600 text-white font-semibold">
              {["tenant", "billing", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 ${
                    activeTab === tab ? "bg-blue-800" : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">

              {activeTab === "tenant" && (
                <>
                  <div className="flex items-center gap-2">
                    <Building2 />
                    <h2 className="text-xl font-bold">
                      {tenant.company_name}
                    </h2>
                  </div>

                  <Row label="Primary Contact">{tenant.primary_contact}</Row>
                  <Row label="Email" icon={<Mail />}>{tenant.primary_email}</Row>
                  <Row label="Phone" icon={<Phone />}>{tenant.phone}</Row>
                  <Row label="Industry" icon={<Briefcase />}>{tenant.industry}</Row>

                  <Row label="Status">
                    <span className={`px-2 py-1 rounded text-xs ${
                      summary.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200"
                    }`}>
                      {summary.status}
                    </span>
                  </Row>

                  <Row label="Date Added" icon={<Calendar />}>
                    {new Date(tenant.created_at).toLocaleDateString("en-GB")}
                  </Row>
                </>
              )}

              {activeTab === "billing" && (
                <div>Billing module coming soon</div>
              )}

              {activeTab === "documents" && (
                <div>Documents module coming soon</div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 space-y-6">

          {/* Analytics */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Analytics</h2>

            <div className="grid grid-cols-4 gap-4">
              <Stat label="Units" value={summary.unit_count} />
              <Stat label="Paid" value={`$${summary.total_paid}`} />
              <Stat label="Balance" value={`$${summary.balance}`} />
              <Stat label="Credit" value={`$${summary.credit || 0}`} />
            </div>
          </div>

          {/* Leases */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4">Leases</h2>

            <table className="w-full">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leases.map((l) => (
                  <tr key={l.id}>
                    <td>{l.unit}</td>
                    <td>{l.start_date}</td>
                    <td>{l.end_date}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactions */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare /> Interactions
            </h2>

            {interactions.map((i) => (
              <div key={i.id} className="border-b py-2">
                <p className="font-semibold">{i.type}</p>
                <p>{i.subject}</p>
                <p className="text-sm text-gray-500">{i.date}</p>
              </div>
            ))}
          </div>

          {/* Invoices */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4">Invoices</h2>

            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2">Invoice</th>
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
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="border-b hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="py-3 font-medium">{inv.invoice_no}</td>

                      <td>${total.toFixed(2)}</td>

                      <td className="text-green-600">
                        ${paid.toFixed(2)}
                      </td>

                      <td className="text-red-600">
                        ${balance.toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            inv.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "Partially Paid"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
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
      </div>
    </div>
  );
}

/* Helpers */
const Row = ({ label, children }) => (
  <div className="flex justify-between">
    <span className="font-semibold">{label}</span>
    <span>{children}</span>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-100 p-4 rounded">
    <p className="text-sm">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default TenantDetails;