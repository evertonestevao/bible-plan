"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// import Lottie from "lottie-react";
// import bookAnimation from "../../../animations/book.json";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Usuário não encontrado:", userError);
        router.push("/login");
        return;
      }

      const nome =
        user.user_metadata?.full_name || user.user_metadata?.name || "";
      const email = user.email;

      const { error } = await supabase
        .from("usuarios")
        .upsert([{ id: user.id, nome, email }], {
          onConflict: "email",
          ignoreDuplicates: true,
        });

      if (error) {
        console.error("Erro ao salvar usuário:", error);
      }

      router.push("/meusplanos");
    };

    syncUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      <div className="w-64 h-64 -mb-12 -mt-8">
        {/* <Lottie animationData={bookAnimation} loop={true} /> */}
        Carregando
      </div>
    </div>
  );
}
