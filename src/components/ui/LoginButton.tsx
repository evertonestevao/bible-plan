"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { FcGoogle } from "react-icons/fc"; // ícone do Google

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
    <div className="p-4 sm:p-0">
      {" "}
      {/* Espaçamento nas bordas */}
      <Button
        onClick={handleLogin}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-yellow border hover:bg-yellow-500 text-white"
      >
        <FcGoogle size={24} />
        <span className="text-gray-600">Entrar</span>
      </Button>
    </div>
  );
}
