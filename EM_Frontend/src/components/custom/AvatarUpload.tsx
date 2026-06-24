"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useUploadProfilePictureMutation } from "@/src/store/action/upload/upload";
import { Toast } from "./Toast";

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  firstName?: string;
  lastName?: string;
}

export function AvatarUpload({ value, onChange, firstName, lastName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPicture] = useUploadProfilePictureMutation();

  const initials = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      Toast({ message: "Only JPEG, PNG, GIF, and WebP images are allowed" }, "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Toast({ message: "File size must not exceed 5 MB" }, "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadPicture(formData).unwrap();
      onChange(res.url);
      Toast({ message: "Profile picture updated" }, "success");
    } catch (err: any) {
      Toast({ error: err }, "error");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Avatar clickable area */}
      <div
        className="relative size-24 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 transition-colors shrink-0"
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        aria-label="Upload profile picture"
      >
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="size-full object-cover"
            onError={() => onChange("")}
          />
        ) : (
          <div className="size-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-2xl">
            {initials || <UploadCloud className="size-7 text-violet-400" />}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="size-6 text-white animate-spin" />
          ) : (
            <Camera className="size-6 text-white" />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {/* Side text */}
      <div className="text-sm text-muted-foreground space-y-0.5">
        <p className="font-medium text-foreground">
          {uploading ? "Uploading…" : value ? "Change photo" : "Upload profile photo"}
        </p>
        <p>PNG, JPG, GIF or WebP</p>
        <p>Max 5 MB · Auto-cropped to 400×400</p>
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-1 transition-colors"
          >
            <Trash2 className="size-3" />
            Remove photo
          </button>
        )}
      </div>
    </div>
  );
}
