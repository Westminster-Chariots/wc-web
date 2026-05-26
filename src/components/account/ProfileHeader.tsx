"use client";
import Image from "next/image";
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
    <section className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center">
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
          className="relative h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden group shadow-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed"
          title="Upload profile photo"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
          ) : (
            <User className="h-10 w-10 text-sky-600" />
          )}
          {onAvatarUpload && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Loader2 className="h-6 w-6 text-slate-700 animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-slate-700" />
              )}
            </div>
          )}
        </button>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-slate-900 break-words">{displayName}</h1>
            {/* <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Unverified Member</span> */}
          </div>
          {clientCode && (
            <p className="text-sm text-slate-500">Client ID: {clientCode}</p>
          )}
          <p className="text-sm text-slate-600 max-w-xl">Welcome to your account dashboard. Manage rides, invoices, and profile settings from one refined and consistent experience.</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Email</p>
              <p className="text-sm text-slate-900 mt-1 break-all">{email}</p>
            </div>
            {/* <div className="rounded-3xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Member since</p>
              <p className="text-sm text-slate-900 mt-1">Elite access</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Status</p>
              <p className="text-sm text-slate-900 mt-1">Executive access</p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
