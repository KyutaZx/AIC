'use client';

import { useState } from 'react';
import { FileUploadCard, type UploadedFile } from '@/components/ui/file-upload-card';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploadProps {
 onPhotoSelected: (base64: string | null) => void;
}

export default function PhotoUpload({ onPhotoSelected }: PhotoUploadProps) {
 const [files, setFiles] = useState<UploadedFile[]>([]);

 const handleFilesChange = (newFiles: File[]) => {
 // Only process the first file (single upload)
 const file = newFiles[0];
 if (!file) return;

 if (!ACCEPTED_TYPES.includes(file.type)) {
 // Create error state file
 setFiles([{
 id:`error-${Date.now()}`,
 file,
 progress: 0,
 status: 'error'
 }]);
 onPhotoSelected(null);
 return;
 }
 if (file.size > MAX_SIZE_BYTES) {
 setFiles([{
 id:`error-${Date.now()}`,
 file,
 progress: 0,
 status: 'error'
 }]);
 onPhotoSelected(null);
 return;
 }

 // Read the file and show as completed
 const reader = new FileReader();
 reader.onload = () => {
 const base64 = reader.result as string;
 onPhotoSelected(base64);
 
 const uploadedFile: UploadedFile = {
 id:`${file.name}-${Date.now()}`,
 file,
 previewUrl: base64,
 progress: 100, // Insta-complete for client-side local read
 status: 'completed',
 };
 
 setFiles([uploadedFile]); // Replace existing file
 };
 reader.readAsDataURL(file);
 };

 const handleFileRemove = () => {
 setFiles([]);
 onPhotoSelected(null);
 };

 return (
 <FileUploadCard
 files={files}
 onFilesChange={handleFilesChange}
 onFileRemove={handleFileRemove}
 />
 );
}
