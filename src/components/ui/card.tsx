export function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white shadow">{children}</div>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
