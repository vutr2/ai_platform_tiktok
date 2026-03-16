export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
