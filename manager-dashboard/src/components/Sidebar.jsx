import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const baseClasses =
    "block px-4 py-2 rounded transition-colors";

  const activeClasses =
    "bg-gray-200 font-semibold";

  const linkClasses = ({ isActive }) =>
    `${baseClasses} ${isActive ? activeClasses : "hover:bg-gray-100"}`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative
          inset-y-0 left-0
          w-64 bg-white border-r
          z-40
          transform transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 font-bold text-lg border-b">
            Property Manager
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
            <NavLink to="/manager" end className={linkClasses}>
              Dashboard
            </NavLink>

            <NavLink to="/manager/tenants" className={linkClasses}>
              Tenants
            </NavLink>

            <NavLink to="/manager/payments" className={linkClasses}>
              Payments
            </NavLink>

            <NavLink to="/manager/invoices" className={linkClasses}>
              Invoices
            </NavLink>

            <NavLink to="/manager/leases" className={linkClasses}>
              Leases
            </NavLink>

            <NavLink to="/manager/units" className={linkClasses}>
              Units
            </NavLink>

            <NavLink to="/manager/interactions" className={linkClasses}>
              Interactions
            </NavLink>

            <NavLink to="/manager/reports" className={linkClasses}>
              Statements & Reports
            </NavLink>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
