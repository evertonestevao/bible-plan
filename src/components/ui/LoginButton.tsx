"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export default function LoginButton() {
  const handleLogin = async () => {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <div className="">
      <Button
        onClick={handleLogin}
        className="
      w-full sm:w-auto flex items-center gap-3 justify-center
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-100
      dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
      dark:hover:bg-gray-700
      transition-colors
    "
      >
        <FcGoogle size={24} />
        <span className="font-medium">Entrar</span>
      </Button>
    </div>
  );
}
