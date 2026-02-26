import { useNavigate } from "react-router-dom";

export default function BackButton({ visible }) {
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="text-blue-600 font-medium hover:underline"
    >
      ← Back
    </button>
  );
}
