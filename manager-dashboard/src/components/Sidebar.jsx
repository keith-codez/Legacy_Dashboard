import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const baseClasses = "block px-4 py-2 rounded transition-colors";
  const activeClasses = "bg-gray-200 font-semibold";

  const linkClasses = ({ isActive }) =>
    `${baseClasses} ${isActive ? activeClasses : "hover:bg-gray-100"}`;

  // Links array to avoid repetition
  const links = [
    { to: "/manager", label: "Dashboard", end: true },
    { to: "/manager/tenants", label: "Tenants" },
    { to: "/manager/payments", label: "Payments" },
    { to: "/manager/invoices", label: "Invoices" },
    { to: "/manager/leases", label: "Leases" },
    { to: "/manager/units", label: "Units" },
    { to: "/manager/interactions", label: "Interactions" },
    { to: "/manager/reports", label: "Statements & Reports" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:relative
          inset-y-0 left-0
          w-64 bg-white border-r
          z-40
          transform transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 font-bold text-lg border-b flex justify-between items-center">
            Property Manager
            {/* Close icon for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClasses}
                onClick={onClose} // auto-close sidebar on click
              >
                {link.label}
              </NavLink>
            ))}
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