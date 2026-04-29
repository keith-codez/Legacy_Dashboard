import { NavLink, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { logout } from "../api/auth";

export default function OwnerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const base = "block px-4 py-2 rounded";
  const active = "bg-gray-200 font-semibold";

  const linkClasses = ({ isActive }) =>
    `${base} ${isActive ? active : "hover:bg-gray-100"}`;

  const links = [
    { to: "/owner", label: "Dashboard", end: true },
    { to: "/owner/tenants", label: "Tenants" },
    { to: "/owner/reports", label: "Reports" },
  ];

  return (
    <>
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
          transform transition-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          h-screen
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 font-bold border-b flex justify-between">
            Owner Panel
            <button onClick={onClose} className="lg:hidden">
              <X />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClasses}
                onClick={onClose}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}