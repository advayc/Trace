import { useEffect, useState } from "react";

import type { User } from "@/lib/auth/types";
import { authService } from "@/lib/auth/auth-service";
import { supabase } from "@/lib/supabase/client";

/** Current signed-in user, or null when signed out. Live-updates on auth changes. */
export function useAuthUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authService.getCurrentUser().then((current) => {
      if (mounted) {
        setUser(current);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      authService.getCurrentUser().then((current) => {
        if (mounted) setUser(current);
      });
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
