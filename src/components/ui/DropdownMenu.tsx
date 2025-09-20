import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownMenuProps {
  value: string;
  options: DropdownOption[];
  pin?: DropdownOption; // Option to pin at the top
  onChange: (value: string) => void;
  callback?: () => void;
  placeholder?: string;
  className?: string;
  focusColor?: string;
  canSearch?: boolean;
  sorted?: boolean;
}

export function DropdownMenu({
  value,
  options,
  pin,
  onChange,
  callback,
  placeholder,
  className = "",
  focusColor = "indigo",
  canSearch = false,
  sorted = true,
}: DropdownMenuProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use i18n fallback if no placeholder provided
  const displayPlaceholder = placeholder || t("dropdown.selectOption");

  // Sort options by label
  const sortedOptions = sorted
    ? [...options].sort((a, b) => a.label.localeCompare(b.label))
    : options;

  // If pin option is provided, place it at the top
  if (pin) {
    // Remove pin from options if it exists to avoid duplication
    const filteredOptions = sortedOptions.filter(
      (option) => option.value !== pin.value,
    );
    // Place pin option at the top
    sortedOptions.splice(0, 0, pin);
    // Append the rest of the options
    sortedOptions.splice(1, sortedOptions.length - 1, ...filteredOptions);
  }

  // Filter options based on search term
  const filteredOptions = sortedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption = sortedOptions.find((option) => option.value === value);

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
    if (callback) {
      callback();
    }
    setIsOpen(false);
    setSearchTerm(""); // Clear search when option is selected
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && canSearch) {
      // Focus search input when opening dropdown
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when closing dropdown
      setSearchTerm("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
          <span
            className="truncate text-gray-900"
            title={selectedOption ? selectedOption.label : displayPlaceholder}
          >
            {selectedOption ? selectedOption.label : displayPlaceholder}
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
        className={`absolute top-full right-0 left-0 z-50 mt-1 min-w-[170px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ease-out ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
        style={{
          transformOrigin: "top center",
        }}
      >
        {/* Search Bar */}
        {canSearch && (
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("dropdown.search")}
                className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        <div
          ref={optionsRef}
          className={`max-h-60 overflow-y-auto transition-all duration-300 ease-out ${
            isOpen ? "animate-slide-down" : "animate-slide-up"
          }`}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-gray-500">
              {t("dropdown.noOptionsFound")}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full truncate px-3 py-2.5 text-left text-sm transition-all duration-150 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                  option.value === value
                    ? `bg-${focusColor}-50 text-${focusColor}-700 font-medium`
                    : "text-gray-900"
                } ${index === 0 && !canSearch ? "rounded-t-xl" : ""} ${
                  index === filteredOptions.length - 1 ? "rounded-b-xl" : ""
                }`}
                title={option.label}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
