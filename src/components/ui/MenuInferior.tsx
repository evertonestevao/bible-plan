"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ListChecks, Settings, LogOut } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function MenuInferior() {
  const pathname = usePathname();
  const { user } = useUser();

  const userAdmin = user?.tipo || null;

  const menus = [
    { href: "/biblia", label: "Bíblia", icon: BookOpen },
    { href: "/meusplanos", label: "Meus Planos", icon: ListChecks },
  ];

  if (userAdmin === "admin") {
    menus.push({
      href: "/planosleitura",
      label: "Gerenciar Planos",
      icon: Settings,
    });
  }

  // Botão de logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair: " + error.message);
    } else {
      toast.success("Logout realizado!");
      window.location.href = "/";
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <ul className="flex justify-around py-2">
        {menus.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center text-sm ${
                  ativo
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${ativo ? "scale-110" : ""}`} />
                {label}
              </Link>
            </li>
          );
        })}

        {user && (
          <li>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-sm text-red-600 dark:text-red-400"
            >
              <LogOut className="h-6 w-6 mb-1" />
              Sair
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
