export default function Dashboard() {
  return (
    <div className="p-3">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Total Tenants</p>
          <p className="text-2xl font-bold">24</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold">$12,450</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Payments This Month</p>
          <p className="text-2xl font-bold">$8,200</p>
        </div>
      </div>
    </div>
  );
}
