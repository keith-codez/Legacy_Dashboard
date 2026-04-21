import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTenantStatement, exportStatements } from "../../api/api";

function TenantStatement() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const downloadPDF = (data, filename) => {
  const blob = new Blob([data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await exportStatements(id);
      downloadPDF(res.data, `statement_${id}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTenantStatement(id);
        setData(res);
      } catch (err) {
        console.error("Statement load failed", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading statement...</div>;
  if (!data) return <div className="p-6">Statement not found</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold">Tenant Statement</h1>
          <p className="text-gray-500">{data.tenant.company_name}</p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export Statement"}
        </button>

      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Reference</th>
              <th className="p-4 text-left">Debit</th>
              <th className="p-4 text-left">Credit</th>
              <th className="p-4 text-left">Balance</th>
            </tr>
          </thead>

          <tbody>
            {data.ledger.map((l, i) => (
              <tr key={i} className="border-t">

                <td className="p-4">
                  {new Date(l.date).toLocaleDateString("en-GB")}
                </td>

                <td className="p-4">{l.type}</td>

                <td className="p-4">{l.ref}</td>

                <td className="p-4 text-red-600">
                  {l.debit ? `$${l.debit}` : "-"}
                </td>

                <td className="p-4 text-green-600">
                  {l.credit ? `$${l.credit}` : "-"}
                </td>

                <td className="p-4 font-semibold">
                  ${l.balance}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}

export default TenantStatement;