"use client";
import { User, Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  clientCode?: string;
  avatarUrl?: string;
  onAvatarUpload?: (file: File) => Promise<void>;
}

export default function ProfileHeader({ displayName, email, clientCode, avatarUrl, onAvatarUpload }: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAvatarUpload) return;

    setUploadingAvatar(true);
    try {
      await onAvatarUpload(file);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <button
          onClick={() => avatarInputRef.current?.click()}
          disabled={uploadingAvatar || !onAvatarUpload}
          className="relative h-16 w-16 rounded-full glass flex items-center justify-center overflow-hidden group hover:ring-2 hover:ring-primary/50 transition-all disabled:opacity-70 flex-shrink-0"
          title="Upload profile photo"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-primary" />
          )}
          {onAvatarUpload && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          )}
        </button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {displayName}
          </h1>
          {clientCode && (
            <p className="text-sm text-primary font-mono font-medium mt-0.5">
              {clientCode}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  );
}
