export default function LoadingState() {
 return (
 <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
 <div className="relative h-12 w-12">
 <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#E0E6FF] border-t-[#0000FF]" />
 </div>
 <p className="text-sm font-semibold text-[#0A0A1A]">Menganalisis kondisi ikan...</p>
 <p className="text-xs text-[#4B5563]">Mohon tunggu sebentar</p>
 </div>
 );
}
