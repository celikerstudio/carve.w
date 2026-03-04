"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { changeUserRole } from "@/app/actions/admin/users";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  displayName: string;
}

export function UserActions({
  userId,
  currentRole,
  displayName,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRoleChange(newRole: string) {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await changeUserRole(userId, newRole);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
          <p className="text-sm text-green-300">Role updated successfully!</p>
        </div>
      )}

      <div className="flex gap-2">
        {currentRole !== "admin" && (
          <Button
            onClick={() => handleRoleChange("admin")}
            disabled={isPending}
            size="sm"
            className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
          >
            {isPending ? "Processing..." : "Make Admin"}
          </Button>
        )}
        {currentRole !== "moderator" && (
          <Button
            onClick={() => handleRoleChange("moderator")}
            disabled={isPending}
            size="sm"
            className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
          >
            {isPending ? "Processing..." : "Make Moderator"}
          </Button>
        )}
        {currentRole !== "user" && (
          <Button
            onClick={() => handleRoleChange("user")}
            disabled={isPending}
            size="sm"
            className="bg-white/10 border border-subtle text-white/80 hover:bg-white/20"
          >
            {isPending ? "Processing..." : "Make User"}
          </Button>
        )}
      </div>
    </div>
  );
}
