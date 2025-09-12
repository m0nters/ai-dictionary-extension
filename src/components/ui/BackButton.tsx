import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(-1);
  };
  return (
    <button
      onClick={handleClick}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-200 ${className || ""}`}
    >
      <ArrowLeft className="h-5 w-4" />
    </button>
  );
}
