import React from "react";

type Props = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
}: Props) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      {label && (
        <label className="block text-sm text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex-1">{children}</div>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
