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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" /> Profile Settings
        </h2>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-1.5"
          >
            <Edit2 className="h-4 w-4" /> Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              className="gap-1.5"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl glass p-6 space-y-6">
        {profile.clientCode && (
          <div className="p-4 rounded-lg glass-subtle border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Your Client ID</p>
            <p className="text-2xl font-mono font-bold text-primary">
              {profile.clientCode}
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> Full Name
            </Label>
            {editing ? (
              <Input
                value={editForm.displayName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
                placeholder="Your full name"
                className="bg-secondary/50 border-border"
              />
            ) : (
              <p className="text-sm text-foreground py-2">{profile.displayName || "—"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" /> Email
            </Label>
            <p className="text-sm text-foreground py-2">
              {profile.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> Phone
            </Label>
            {editing ? (
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1 (555) 000-0000"
                className="bg-secondary/50 border-border"
              />
            ) : (
              <p className="text-sm text-foreground py-2">{profile.phone || "—"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" /> Corporate
            </Label>
            <div className="py-2">
              {editing ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isCorporate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        isCorporate: e.target.checked
                      }))
                    }
                    className="rounded border-border"
                  />
                  <span className="text-sm">Corporate billing</span>
                </label>
              ) : (
                <p className="text-sm text-foreground">
                  {profile.isCorporate ? "Yes" : "No"}
                </p>
              )}
            </div>
          </div>

          {(editing && editForm.isCorporate || profile.isCorporate) && (
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Company Name
              </Label>
              {editing ? (
                <Input
                  value={editForm.corporateName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      corporateName: e.target.value
                    }))
                  }
                  placeholder="Your company"
                  className="bg-secondary/50 border-border"
                  disabled={!editForm.isCorporate}
                />
              ) : (
                <p className="text-sm text-foreground py-2">
                  {profile.corporateName || "—"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setChangingPassword(!changingPassword)}
          >
            <Lock className="h-4 w-4" /> {changingPassword ? "Hide" : "Change"} Password
          </Button>

          {changingPassword && (
            <div className="mt-4 space-y-3 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="text-xs">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        current: e.target.value
                      }))
                    }
                    placeholder="Current password"
                    className="bg-secondary/50 border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        new: e.target.value
                      }))
                    }
                    placeholder="New password"
                    className="bg-secondary/50 border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Confirm Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirm: e.target.value
                    }))
                  }
                  placeholder="Confirm password"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={handlePasswordChange}
                className="w-full"
              >
                Update Password
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
