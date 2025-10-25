"use client";

import { usePathname } from "next/navigation";
import MenuInferior from "@/components/ui/MenuInferior";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MenuWrapper() {
  const pathname = usePathname();
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLogged(!!session);
    };

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogged(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Oculta se estiver na home ou não logado
  if (pathname === "/" || !isLogged) return null;

  return <MenuInferior />;
}
