export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-deep nfv-grid-overlay">
      {children}
    </div>
  );
}
