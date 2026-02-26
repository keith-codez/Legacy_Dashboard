import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import Breadcrumbs from "./Breadcrumbs";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter(Boolean);
  const showBackButton = pathnames.length > 0;

  const isTenantDetails =
    location.pathname.startsWith("/manager/tenants/") &&
    pathnames.length === 3;

  const tenantId = isTenantDetails ? pathnames[2] : null;

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="text-gray-700 text-xl"
        >
          ☰
        </button>

        <span className="font-semibold">
          Manager Dashboard
        </span>

        {isTenantDetails && (
          <button
            onClick={() =>
              navigate(`/manager/tenants/${tenantId}/edit`)
            }
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
          >
            Edit
          </button>
        )}
      </header>

      {/* Mobile Breadcrumb Row */}
      <div className="md:hidden bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton visible={showBackButton} />
          <Breadcrumbs />
        </div>
      </div>

      {/* Desktop Topbar */}
      <div className="hidden md:flex bg-white border-b px-8 py-4 items-center justify-between">
        <div className="flex items-center space-x-6">
          <BackButton visible={showBackButton} />
          <Breadcrumbs />
        </div>

        {isTenantDetails && (
          <button
            onClick={() =>
              navigate(`/manager/tenants/${tenantId}/edit`)
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Edit Tenant
          </button>
        )}
      </div>
    </>
  );
}