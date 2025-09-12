import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownMenuProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  focusColor?: string;
}

export function DropdownMenu({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  focusColor = "indigo",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getFocusColorClasses = (color: string) => {
    switch (color) {
      case "purple":
        return "focus:border-purple-500 focus:ring-purple-100";
      case "indigo":
      default:
        return "focus:border-indigo-500 focus:ring-indigo-100";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full cursor-pointer appearance-none rounded-xl border-2 border-gray-200 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:border-gray-300 focus:ring-4 focus:outline-none ${getFocusColorClasses(focusColor)}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-gray-900">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>

      {/* Dropdown Options */}
      <div
        className={`absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ease-out ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
        style={{
          transformOrigin: "top center",
        }}
      >
        <div
          ref={optionsRef}
          className={`max-h-60 overflow-y-auto transition-all duration-300 ease-out ${
            isOpen ? "animate-slideDown" : "animate-slideUp"
          }`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-3 py-2.5 text-left text-sm transition-all duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                option.value === value
                  ? `bg-${focusColor}-50 text-${focusColor}-700 font-medium`
                  : "text-gray-900"
              } ${index === 0 ? "rounded-t-xl" : ""} ${
                index === options.length - 1 ? "rounded-b-xl" : ""
              }`}
              style={{
                animationDelay: isOpen ? `${index * 20}ms` : "0ms",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
