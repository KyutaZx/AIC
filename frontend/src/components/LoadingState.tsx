export default function LoadingState() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      <p className="text-sm font-medium text-slate-900">Menganalisis kondisi ikan...</p>
    </div>
  );
}
