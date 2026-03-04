"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateUserProfile, changeUserRole } from "@/app/actions/admin/users";
import { Edit2, X, Check } from "lucide-react";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  role: string;
}

interface UserEditFormProps {
  user: User;
}

export function UserEditForm({ user }: UserEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    display_name: user.display_name || "",
    username: user.username || "",
    bio: user.bio || "",
    role: user.role,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      // Update profile fields (without role)
      const profileResult = await updateUserProfile(user.id, {
        display_name: formData.display_name,
        username: formData.username,
        bio: formData.bio,
      });

      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }

      // If role changed, update it separately
      if (formData.role !== user.role) {
        const roleResult = await changeUserRole(user.id, formData.role);
        if (roleResult.error) {
          setError(roleResult.error);
          return;
        }
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  if (!isEditing) {
    return (
      <Card className="bg-surface-raised border-subtle p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30">
            <p className="text-sm text-green-300">Profile updated successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-ink-secondary mb-1">Username</div>
            <div className="text-white">{user.username || "\u2014"}</div>
          </div>
          <div>
            <div className="text-sm text-ink-secondary mb-1">Display Name</div>
            <div className="text-white">{user.display_name || "\u2014"}</div>
          </div>
          <div>
            <div className="text-sm text-ink-secondary mb-1">Email</div>
            <div className="text-white">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-ink-secondary mb-1">Role</div>
            <div className="text-white capitalize">{user.role}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-ink-secondary mb-1">User ID</div>
            <div className="text-white/80 text-xs font-mono">{user.id}</div>
          </div>
        </div>
        {user.bio && (
          <div className="mt-4">
            <div className="text-sm text-ink-secondary mb-1">Bio</div>
            <div className="text-white">{user.bio}</div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-surface-raised border-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        <Button
          onClick={() => {
            setIsEditing(false);
            setError(null);
            setFormData({
              display_name: user.display_name || "",
              username: user.username || "",
              bio: user.bio || "",
              role: user.role,
            });
          }}
          size="sm"
          variant="outline"
          className="bg-white/5 border-subtle text-white hover:bg-white/10"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username" className="text-white/80 mb-2 block">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="bg-white/5 border-subtle text-white"
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label htmlFor="display_name" className="text-white/80 mb-2 block">
              Display Name
            </Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
              className="bg-white/5 border-subtle text-white"
              placeholder="Enter display name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role" className="text-white/80 mb-2 block">
            Role
          </Label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-subtle rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <Label htmlFor="bio" className="text-white/80 mb-2 block">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="bg-white/5 border-subtle text-white min-h-[100px]"
            placeholder="Enter bio"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
