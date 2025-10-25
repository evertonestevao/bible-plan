"use client";

import { useUser } from "@/contexts/UserContext";

export default function UserGreeting() {
  const { user, loading } = useUser();

  if (loading)
    return (
      <p className="text-gray-600 dark:text-gray-400">Carregando usuário...</p>
    );

  if (!user) return null;

  return (
    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
      Olá, {user.nome ?? user.email}!
    </p>
  );
}
