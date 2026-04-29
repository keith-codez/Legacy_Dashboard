import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import Breadcrumbs from "./Breadcrumbs";

export default function Topbar({ onMenuClick, role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter(Boolean);
  const showBackButton = pathnames.length > 1;

  const isTenantDetails =
    pathnames.includes("tenants") &&
    pathnames.length >= 3;

  const tenantId = isTenantDetails ? pathnames[pathnames.length - 1] : null;

  const labels = {
    owner: {
      title: "Owner Dashboard",
      action: "View",
      actionColor: "bg-green-600",
      context: "Portfolio Intelligence",
    },
    manager: {
      title: "Manager Dashboard",
      action: "Edit",
      actionColor: "bg-blue-600",
      context: "Operations Console",
    },
  };

  const cfg = labels[role] || labels.manager;

  const tenantRoute = role === "owner"
    ? `/owner/tenants/${tenantId}`
    : `/manager/tenants/${tenantId}/edit`;

  return (
    <>
      {/* Mobile */}
      <header className="lg:hidden bg-white border-b p-4 flex justify-between items-center">
        <button onClick={onMenuClick} className="text-xl">☰</button>

        <span className="font-semibold">{cfg.title}</span>

        {isTenantDetails && tenantId && (
          <button
            onClick={() => navigate(tenantRoute)}
            className={`text-sm px-3 py-1 rounded text-white ${cfg.actionColor}`}
          >
            {cfg.action}
          </button>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="md:hidden bg-white border-b px-6 py-3 flex justify-between">
        <div className="flex items-center space-x-4">
          <BackButton visible={showBackButton} />
          <Breadcrumbs />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex bg-white border-b px-8 py-4 justify-between items-center">
        <div className="flex items-center space-x-6">
          <BackButton visible={showBackButton} />
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            {cfg.context}
          </div>

          {isTenantDetails && tenantId && (
            <button
              onClick={() => navigate(tenantRoute)}
              className={`px-4 py-2 rounded text-white ${cfg.actionColor}`}
            >
              {cfg.action} Tenant
            </button>
          )}
        </div>
      </div>
    </>
  );
}