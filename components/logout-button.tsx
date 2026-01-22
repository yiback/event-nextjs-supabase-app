"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: 'default' | 'dropdown';
  className?: string;
}

export function LogoutButton({
  variant = 'default',
  className
}: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (variant === 'dropdown') {
    return (
      <button
        onClick={logout}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-destructive",
          className
        )}
      >
        <LogOut className="mr-2 h-4 w-4" />
        로그아웃
      </button>
    );
  }

  return <Button onClick={logout}>Logout</Button>;
}
