import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  onClick: () => void;
}

export function BackButton({ className, onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-200 ${className || ""}`}
    >
      <ArrowLeft className="h-5 w-4" />
    </button>
  );
}
