import { useCallback, useState, type DragEvent } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  maxSizeMB?: number;
}

const DropZone = ({ onFileSelect, accept = "image/*", label = "Drop your visual data here", sublabel = "PNG, JPG, WEBP, or SVG. Up to 25MB.", maxSizeMB = 25 }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSizeMB * 1024 * 1024) onFileSelect(file);
  }, [onFileSelect, maxSizeMB]);

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFileSelect(file);
    };
    input.click();
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg" />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative bg-surface-container-lowest border-2 border-dashed ${
          isDragging ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/40"
        } transition-colors flex flex-col items-center justify-center p-12 lg:p-20 rounded-xl cursor-pointer`}
      >
        <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
        </div>
        <h3 className="text-xl font-headline font-bold mb-2">{label}</h3>
        <p className="text-on-surface-variant font-label text-sm">{sublabel}</p>
        <button className="mt-8 px-8 py-3 bg-surface-container-highest text-foreground font-bold rounded-lg border border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all">
          Browse Files
        </button>
      </div>
    </div>
  );
};

export default DropZone;
