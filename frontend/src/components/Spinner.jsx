export default function Spinner({ label = 'Loading…', full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${full ? 'min-h-[50vh]' : 'py-10'}`}
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-saffron-200 border-t-saffron-600" />
      <p className="text-sm font-medium text-stone-500">{label}</p>
    </div>
  );
}
