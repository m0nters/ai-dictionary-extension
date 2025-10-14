import React from "react";

interface TextWithLinksProps {
  text: string;
  className?: string;
  linkClassName?: string;
}

/**
 * Component that parses text and automatically converts URLs into clickable links
 * Supports both http/https URLs
 */
export function TextWithLinks({
  text,
  className = "",
  linkClassName = "font-semibold text-indigo-600 underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors hover:text-indigo-700 hover:decoration-indigo-400",
}: TextWithLinksProps) {
  // Regex to match URLs (http/https)
  const urlRegex = /(http(?:s)?:\/\/[^\s]+)/g;

  // Split text by URLs and create array of text parts and links
  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {part}
            </a>
          );
        }
        // Return regular text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
