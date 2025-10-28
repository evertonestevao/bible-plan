"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Erro ao sair: " + error.message);
    } else {
      toast.success("Logout realizado com sucesso!");
      router.push("/"); // redireciona sem recarregar
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
