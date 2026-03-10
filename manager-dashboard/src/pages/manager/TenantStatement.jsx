import { useParams } from "react-router-dom";
import tenants from "../../data/tenants.json";
import invoices from "../../data/invoices.json";
import allocations from "../../data/payment_allocations.json";
import payments from "../../data/payments.json";

function TenantStatement() {

  const { id } = useParams();

  const tenant = tenants.find(t => t.id === Number(id));

  const tenantInvoices = invoices.filter(
    i => i.tenant_id === Number(id)
  );

  const ledger = [];

  tenantInvoices.forEach(inv => {

    ledger.push({
      date: inv.issue_date,
      type: "Invoice",
      ref: inv.invoice_no,
      debit: inv.total_amount,
      credit: 0
    });

    const invAllocations = allocations.filter(
      a => a.invoice_id === inv.id
    );

    invAllocations.forEach(a => {

      const payment = payments.find(
        p => p.id === a.payment_id
      );

      ledger.push({
        date: payment.date,
        type: "Payment",
        ref: `PAY-${payment.id}`,
        debit: 0,
        credit: a.allocation_amount
      });

    });

  });

  ledger.sort((a,b)=> new Date(a.date)-new Date(b.date));

  let runningBalance = 0;

  const ledgerWithBalance = ledger.map(entry => {

    runningBalance += entry.debit;
    runningBalance -= entry.credit;

    return {
      ...entry,
      balance: runningBalance
    };

  });

  return (

    <div className="p-4 md:p-8 space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Tenant Statement
        </h1>

        <p className="text-gray-500">
          {tenant.company_name}
        </p>
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

            {ledgerWithBalance.map((l,i)=>(

              <tr key={i} className="border-t">

                <td className="p-4">
                  {new Date(l.date).toLocaleDateString("en-GB")}
                </td>

                <td className="p-4">
                  {l.type}
                </td>

                <td className="p-4">
                  {l.ref}
                </td>

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