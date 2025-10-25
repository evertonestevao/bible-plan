"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function LoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-500 text-white"
    >
      Entrar com Google
    </Button>
  );
}
