"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Erro ao sair: " + error.message);
    } else {
      toast.success("Logout realizado com sucesso!");
      // opcional: redirecionar para a home
      window.location.href = "/";
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white"
    >
      Sair
    </Button>
  );
}
