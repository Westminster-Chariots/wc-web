"use client";
import { useState } from "react";
import { Settings, Edit2, Save, X, Lock, Eye, EyeOff, User, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  email: string;
  displayName: string;
  phone: string;
  isCorporate: boolean;
  corporateName: string;
  clientCode?: string;
}

interface ProfileSettingsProps {
  profile: ProfileData;
  onSave: (data: Omit<ProfileData, 'email' | 'clientCode'>) => Promise<void>;
  onChangePassword: (current: string, newPassword: string) => Promise<void>;
}

export default function ProfileSettings({ profile, onSave, onChangePassword }: ProfileSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    displayName: profile.displayName,
    phone: profile.phone,
    isCorporate: profile.isCorporate,
    corporateName: profile.corporateName,
  });

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editForm);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      return;
    }
    await onChangePassword(passwordForm.current, passwordForm.new);
    setPasswordForm({ current: "", new: "", confirm: "" });
    setChangingPassword(false);
  };

  return (
    <section>
      <div className="rounded-4xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="space-y-2">
            <h2 className="text-xl font-display font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-sky-600" /> Profile Settings
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">Update your account details, company preferences, and password in one secure place.</p>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-2 text-slate-700 hover:text-slate-900">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button variant="cta" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] bg-slate-50 p-6 space-y-6">
          {profile.clientCode && (
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Client ID</p>
              <p className="mt-2 text-3xl font-mono font-semibold text-slate-900">{profile.clientCode}</p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                <User className="h-4 w-4 text-slate-500" /> Full Name
              </Label>
              {editing ? (
                <Input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your full name"
                  className="bg-slate-50 ring-1 ring-slate-200 text-slate-900"
                />
              ) : (
                <p className="text-sm text-slate-900">{profile.displayName || "—"}</p>
              )}
            </div>

            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                <Mail className="h-4 w-4 text-slate-500" /> Email
              </Label>
              <p className="text-sm text-slate-900">{profile.email}</p>
            </div>

            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                <Phone className="h-4 w-4 text-slate-500" /> Phone
              </Label>
              {editing ? (
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="bg-slate-50 ring-1 ring-slate-200 text-slate-900"
                />
              ) : (
                <p className="text-sm text-slate-900">{profile.phone || "—"}</p>
              )}
            </div>

            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                <Building2 className="h-4 w-4 text-slate-500" /> Corporate
              </Label>
              {editing ? (
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.isCorporate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isCorporate: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 bg-white"
                  />
                  Corporate billing enabled
                </label>
              ) : (
                <p className="text-sm text-slate-900">{profile.isCorporate ? "Yes" : "No"}</p>
              )}
            </div>

            {(editing && editForm.isCorporate) || (!editing && profile.isCorporate) ? (
              <div className="lg:col-span-2 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-4 space-y-3">
                <Label className="text-xs uppercase tracking-[0.24em] text-slate-500">Company Name</Label>
                {editing ? (
                  <Input
                    value={editForm.corporateName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, corporateName: e.target.value }))}
                    placeholder="Your company"
                    className="bg-slate-50 ring-1 ring-slate-200 text-slate-900"
                    disabled={!editForm.isCorporate}
                  />
                ) : (
                  <p className="text-sm text-slate-900">{profile.corporateName || "—"}</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Secure account</p>
                <p className="text-sm text-slate-600">Manage your password and review security settings anytime.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-700 hover:text-slate-900"
                onClick={() => setChangingPassword(!changingPassword)}
              >
                <Lock className="h-4 w-4" /> {changingPassword ? "Hide" : "Change"} Password
              </Button>
            </div>

            {changingPassword && (
              <div className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                      placeholder="Current password"
                      className="bg-slate-50 ring-1 ring-slate-200 text-slate-900 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
                        placeholder="New password"
                        className="bg-slate-50 ring-1 ring-slate-200 text-slate-900 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs uppercase tracking-[0.24em] text-slate-400">Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Confirm password"
                      className="bg-slate-50 ring-1 ring-slate-200 text-slate-900"
                    />
                  </div>
                </div>
                <Button variant="cta" size="sm" onClick={handlePasswordChange} className="w-full">
                  Update Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
