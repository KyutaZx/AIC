'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Camera, RefreshCw } from 'lucide-react';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploadProps {
  onPhotoSelected: (base64: string | null) => void;
}

export default function PhotoUpload({ onPhotoSelected }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Format tidak didukung. Gunakan JPG atau PNG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Foto terlalu besar (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onPhotoSelected(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleReplace() {
    setPreview(null);
    setError(null);
    onPhotoSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
          dragging ? 'border-sky-600 bg-sky-50' : 'border-slate-200/80 bg-white hover:border-sky-300 hover:bg-sky-50/40'
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview foto ikan" className="max-h-64 rounded-lg object-contain" />
        ) : (
          <>
            <Camera className="h-9 w-9 text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-slate-900">Ketuk atau seret foto ikan ke sini</p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WEBP &middot; maks 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {preview && (
        <button
          type="button"
          onClick={handleReplace}
          className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Ganti Foto
        </button>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
