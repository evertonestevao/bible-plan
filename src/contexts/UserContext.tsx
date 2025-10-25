"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type User = {
  id: string;
  nome?: string;
  email: string;
  tipo?: string | null;
  criado_em?: string | null;
} | null;

type UserContextType = {
  user: User;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do usuário na tabela "usuarios"
  const fetchUserFromDb = async (email: string) => {
    const { data: usuarioDb, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, tipo, criado_em")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Erro ao buscar usuário na tabela usuarios:", error);
      setUser(null);
    } else {
      setUser(usuarioDb);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1️⃣ Carrega usuário inicial
    const loadUser = async () => {
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();

      if (sessionUser?.email) {
        await fetchUserFromDb(sessionUser.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    loadUser();

    // 2️⃣ Atualiza o usuário quando a sessão muda
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        fetchUserFromDb(session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para usar em qualquer componente
export function useUser() {
  return useContext(UserContext);
}
