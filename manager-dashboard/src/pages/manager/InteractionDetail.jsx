import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getInteraction } from "../../api/api";

function InteractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interaction, setInteraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInteraction(id);
        setInteraction(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load interaction");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* ---------------- STATES ---------------- */
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !interaction) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Interaction not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ---------------- HELPERS ---------------- */
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{interaction.subject}</h1>
          <p className="text-gray-500">{interaction.tenant_name}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
      </div>

      {/* Priority + Type */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityStyles(
            interaction.priority
          )}`}
        >
          {interaction.priority} Priority
        </span>

        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
          {interaction.type}
        </span>
      </div>

      {/* Meta Info */}
      <div className="bg-white border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {interaction.date
              ? new Date(interaction.date).toLocaleDateString("en-GB")
              : "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Recorded By</p>
          <p className="font-semibold">
            {interaction.recorded_by || "-"}
          </p>
        </div>

      </div>

      {/* Notes */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-3">Notes</h2>
        <p className="text-gray-700 leading-relaxed">
          {interaction.notes || "No notes recorded."}
        </p>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Activity Snapshot</h2>

        <div className="flex items-start gap-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>

          <div>
            <p className="font-medium">Interaction Recorded</p>
            <p className="text-sm text-gray-500">
              {interaction.date
                ? new Date(interaction.date).toLocaleDateString("en-GB")
                : "-"}{" "}
              by {interaction.recorded_by || "-"}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default InteractionDetail;