export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-card bg-opacity-75 z-50">
      <div className="text-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-border h-12 w-12 mb-4"></div>
        <h2 className="text-xl font-semibold text-brand-body">Loading...</h2>
      </div>
    </div>
  );
}
