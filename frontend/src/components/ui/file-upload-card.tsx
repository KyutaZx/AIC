'use client';

import * as React from"react";
import { Camera, X, CheckCircle2, Trash2, Image as ImageIcon } from"lucide-react";
import { motion, AnimatePresence } from"framer-motion";

import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { Progress } from"@/components/ui/progress";

export interface UploadedFile {
 id: string;
 file: File;
 previewUrl?: string;
 progress: number;
 status:"uploading" |"completed" |"error";
}

import { HTMLMotionProps } from"framer-motion";

interface FileUploadCardProps extends Omit<HTMLMotionProps<"div">, 'onDrop' | 'onDragEnter' | 'onDragLeave' | 'onDragOver'> {
 files: UploadedFile[];
 onFilesChange: (files: File[]) => void;
 onFileRemove: (id: string) => void;
 onClose?: () => void;
}

export const FileUploadCard = React.forwardRef<HTMLDivElement, FileUploadCardProps>(
 ({ className, files = [], onFilesChange, onFileRemove, onClose, ...props }, ref) => {
 const [isDragging, setIsDragging] = React.useState(false);
 const fileInputRef = React.useRef<HTMLInputElement>(null);

 const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 };

 const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 };

 const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
 if (droppedFiles && droppedFiles.length > 0) {
 onFilesChange(droppedFiles);
 }
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const selectedFiles = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
 if (selectedFiles.length > 0) {
 onFilesChange(selectedFiles);
 }
 };

 const triggerFileSelect = () => fileInputRef.current?.click();

 const formatFileSize = (bytes: number) => {
 if (bytes === 0) return"0 KB";
 const k = 1024;
 const sizes = ["Bytes","KB","MB","GB","TB"];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +"" + sizes[i];
 };
 
 const cardVariants = {
 hidden: { opacity: 0, y: 10 },
 visible: { opacity: 1, y: 0 },
 };
 
 const fileItemVariants = {
 hidden: { opacity: 0, x: -20 },
 visible: { opacity: 1, x: 0 },
 };

 return (
 <motion.div
 ref={ref}
 variants={cardVariants}
 initial="hidden"
 animate="visible"
 transition={{ duration: 0.3 }}
 className={cn(
"w-full bg-white rounded-2xl border border-[#E0E6FF]",
 className
 )}
 {...props}
 >
 <div className="p-5">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F7FF]">
 <Camera className="w-5 h-5 text-[#0000FF]" />
 </div>
 <div>
 <h3 className="text-base font-bold text-[#0A0A1A]">Upload Foto</h3>
 <p className="text-xs text-[#4B5563]">
 Pilih atau seret foto ikan ke sini
 </p>
 </div>
 </div>
 {onClose && (
 <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-[#4B5563]" onClick={onClose}>
 <X className="w-4 h-4" />
 </Button>
 )}
 </div>

 <div
 onDragEnter={handleDragEnter}
 onDragLeave={handleDragLeave}
 onDragOver={handleDragOver}
 onDrop={handleDrop}
 onClick={triggerFileSelect}
 className={cn(
"mt-5 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]",
 isDragging
 ?"border-[#0000FF] bg-blue-50"
 :"border-[#E0E6FF] hover:border-[#0000FF]/50 bg-[#F5F7FF] hover:bg-blue-50/40"
 )}
 >
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 capture="environment"
 className="hidden"
 onChange={handleFileSelect}
 />
 <ImageIcon className="w-8 h-8 text-[#0000FF]/40 mb-3" />
 <p className="font-semibold text-sm text-[#0A0A1A]">Ketuk atau seret foto ke sini</p>
 <p className="text-xs text-[#4B5563] mt-1">
 Format JPG, PNG, WEBP maks 5MB.
 </p>
 <Button variant="outline" size="sm" className="mt-4 pointer-events-none text-xs h-8">
 Pilih File
 </Button>
 </div>
 </div>
 
 {files.length > 0 && (
 <div className="p-5 pt-3 border-t border-[#E0E6FF]">
 <ul className="space-y-3">
 <AnimatePresence>
 {files.map((file) => (
 <motion.li
 key={file.id}
 variants={fileItemVariants}
 initial="hidden"
 animate="visible"
 exit="hidden"
 layout
 className="flex items-center justify-between gap-4"
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 {/* Image Preview Thumbnail */}
 <div className="w-12 h-12 flex shrink-0 items-center justify-center rounded-lg bg-[#F5F7FF] overflow-hidden border border-[#E0E6FF]">
 {file.previewUrl ? (
 <img src={file.previewUrl} alt={file.file.name} className="w-full h-full object-cover" />
 ) : (
 <ImageIcon className="w-5 h-5 text-[#4B5563]" />
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-[#0A0A1A] truncate">{file.file.name}</p>
 <div className="text-[11px] text-[#4B5563]">
 {file.status ==="uploading" && (
 <span>{formatFileSize((file.file.size * file.progress) / 100)} of {formatFileSize(file.file.size)}</span>
 )}
 {file.status ==="completed" && (
 <span>{formatFileSize(file.file.size)}</span>
 )}
 <span className="mx-1">•</span>
 <span className={cn(
 {"text-[#0000FF]": file.status === 'uploading'},
 {"text-green-600": file.status === 'completed'},
 {"text-red-500": file.status === 'error'}
 )}>
 {file.status === 'uploading' ?`Memproses...` : file.status === 'error' ? 'Gagal' : 'Selesai'}
 </span>
 </div>
 {file.status === 'uploading' && <Progress value={file.progress} className="h-1.5 mt-1" />}
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 {file.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
 <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => onFileRemove(file.id)}>
 {file.status === 'completed' ? <Trash2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
 </Button>
 </div>
 </motion.li>
 ))}
 </AnimatePresence>
 </ul>
 </div>
 )}
 </motion.div>
 );
 }
);
FileUploadCard.displayName ="FileUploadCard";
