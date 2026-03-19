import { useParams, useNavigate } from "react-router-dom";
import unitsData from "../../data/units.json";

function UnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const unit = unitsData.find(u => u.id === Number(id));

  if (!unit) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Unit not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-green-100 text-green-700";
      case "Vacant":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{unit.unit_no}</h1>
          <p className="text-gray-500">{unit.unit_type} | Floor {unit.floor}</p>
        </div>
        <button
          onClick={() => navigate("/manager/units")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Unit Info */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Unit Number</p>
            <p className="font-semibold">{unit.unit_no}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Unit Type</p>
            <p className="font-semibold">{unit.unit_type}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Floor</p>
            <p className="font-semibold">{unit.floor}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Size (sqm)</p>
            <p className="font-semibold">{unit.size_sqm}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Base Rent ($)</p>
            <p className="font-semibold">${unit.base_rent.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusStyles(unit.status)}`}>
              {unit.status}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={() => navigate(`/manager/units/${unit.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Edit Unit
          </button>
        </div>
      </div>

    </div>
  );
}

export default UnitDetail;