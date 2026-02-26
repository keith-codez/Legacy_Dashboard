import { useLocation, useNavigate } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-gray-600 text-sm">
      {pathnames.map((value, index) => {
        const to = "/" + pathnames.slice(0, index + 1).join("/");
        const label =
          value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <span key={to} className="flex items-center space-x-2">
            {index !== 0 && <span>/</span>}
            <button
              onClick={() => navigate(to)}
              className="hover:text-blue-600"
            >
              {label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
