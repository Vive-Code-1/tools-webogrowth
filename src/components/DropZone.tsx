import { useCallback, useState, type DragEvent } from "react";
import { toast } from "@/hooks/use-toast";

interface DropZoneProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  processing?: boolean;
  hasFiles?: boolean;
}

const DropZone = ({
  onFileSelect,
  onFilesSelect,
  accept = "image/*",
  label = "Drop your visual data here",
  sublabel = "PNG, JPG, WEBP, or SVG. Up to 25MB.",
  maxSizeMB = 25,
  multiple = false,
  processing = false,
  hasFiles = false,
}: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const acceptList = accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);

  const matchesAccept = (file: File) => {
    if (!acceptList.length || acceptList.includes("*/*")) return true;
    const type = file.type.toLowerCase();
    return acceptList.some((a) => {
      if (a.endsWith("/*")) return type.startsWith(a.slice(0, -1));
      return type === a;
    });
  };

  const deliver = useCallback(
    (files: File[]) => {
      const oversize = files.filter((f) => f.size > maxSizeMB * 1024 * 1024);
      const wrongType = files.filter((f) => !matchesAccept(f));
      const valid = files.filter(
        (f) => f.size <= maxSizeMB * 1024 * 1024 && matchesAccept(f),
      );

      if (oversize.length) {
        toast({
          title: `${oversize.length} file${oversize.length > 1 ? "s" : ""} skipped`,
          description: `Each file must be under ${maxSizeMB}MB.`,
          variant: "destructive",
        });
      }
      if (wrongType.length) {
        toast({
          title: `${wrongType.length} file${wrongType.length > 1 ? "s" : ""} skipped`,
          description: "Unsupported file type.",
          variant: "destructive",
        });
      }

      if (!valid.length) return;
      if (multiple && onFilesSelect) onFilesSelect(valid);
      else if (onFilesSelect) onFilesSelect([valid[0]]);
      if (onFileSelect) onFileSelect(valid[0]);
    },
    [maxSizeMB, multiple, onFileSelect, onFilesSelect, acceptList],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (processing) return;
      // Inspect dataTransfer items to flag invalid drops early
      const items = Array.from(e.dataTransfer.items || []);
      const invalid = items.some((it) => {
        if (it.kind !== "file") return false;
        const type = it.type.toLowerCase();
        if (!acceptList.length || acceptList.includes("*/*")) return false;
        return !acceptList.some((a) =>
          a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a,
        );
      });
      setIsInvalid(invalid);
      setIsDragging(true);
      e.dataTransfer.dropEffect = invalid || processing ? "none" : "copy";
    },
    [acceptList, processing],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
    setIsInvalid(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setIsInvalid(false);
      if (processing) return;
      deliver(Array.from(e.dataTransfer.files));
    },
    [deliver, processing],
  );

  const handleClick = () => {
    if (processing) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = (e) => {
      const list = (e.target as HTMLInputElement).files;
      if (list && list.length) deliver(Array.from(list));
    };
    input.click();
  };

  const borderClass = processing
    ? "border-outline-variant/30 opacity-70 cursor-not-allowed"
    : isInvalid
      ? "border-destructive bg-destructive/10 cursor-not-allowed"
      : isDragging
        ? "border-primary bg-primary/10 ring-4 ring-primary/30 scale-[1.01]"
        : hasFiles
          ? "border-primary/40 hover:border-primary/70"
          : "border-outline-variant/30 hover:border-primary/40";

  return (
    <div className="relative group h-full flex">
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-xl transition duration-500 blur-lg ${
          isDragging && !isInvalid ? "opacity-60" : "opacity-20 group-hover:opacity-40"
        }`}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        aria-disabled={processing}
        className={`relative flex-1 bg-surface-container-lowest border-2 border-dashed ${borderClass} transition-all flex flex-col items-center justify-center p-12 lg:p-16 rounded-xl cursor-pointer min-h-[420px]`}
      >
        {processing ? (
          <>
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-primary text-3xl animate-spin">
                progress_activity
              </span>
            </div>
            <h3 className="text-xl font-headline font-bold mb-2">Conversion in progress…</h3>
            <p className="text-on-surface-variant font-label text-sm">
              Please wait while we process your files
            </p>
          </>
        ) : isInvalid ? (
          <>
            <div className="w-16 h-16 bg-destructive/20 flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-destructive text-3xl">block</span>
            </div>
            <h3 className="text-xl font-headline font-bold mb-2 text-destructive">
              Unsupported file type
            </h3>
            <p className="text-on-surface-variant font-label text-sm">
              Drop only the formats listed below
            </p>
          </>
        ) : isDragging ? (
          <>
            <div className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">download</span>
            </div>
            <h3 className="text-xl font-headline font-bold mb-2 text-primary">
              Release to upload
            </h3>
            <p className="text-on-surface-variant font-label text-sm">{sublabel}</p>
          </>
        ) : hasFiles ? (
          <>
            <div className="w-16 h-16 bg-primary/15 flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">add_photo_alternate</span>
            </div>
            <h3 className="text-xl font-headline font-bold mb-2">Add more files</h3>
            <p className="text-on-surface-variant font-label text-sm">{sublabel}</p>
            <button className="mt-8 px-8 py-3 bg-surface-container-highest text-foreground font-bold rounded-lg border border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all">
              Browse More
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
            </div>
            <h3 className="text-xl font-headline font-bold mb-2">{label}</h3>
            <p className="text-on-surface-variant font-label text-sm">{sublabel}</p>
            <button className="mt-8 px-8 py-3 bg-surface-container-highest text-foreground font-bold rounded-lg border border-outline-variant/20 hover:bg-primary hover:text-on-primary transition-all">
              Browse Files
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DropZone;
