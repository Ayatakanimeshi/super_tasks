import React from "react";

export default function Section(props: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { title, actions, children, className } = props;
  return (
    <section className={`border rounded p-4 space-y-3 ${className || ""}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title ? <h2 className="font-semibold">{title}</h2> : <div />}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
