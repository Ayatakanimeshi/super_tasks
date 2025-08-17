import React from "react";

export default function StatCard(props: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
}) {
  const { label, value, hint, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left border rounded p-4 hover:bg-gray-50 transition w-full"
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
    </button>
  );
}
