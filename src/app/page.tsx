"use client";

import BookLoader from "@/components/ui/BookAnimation";
import { Button } from "@/components/ui/button";
// import Lottie from "lottie-react";
// import bookAnimation from "../animations/book.json";
import LoginButton from "@/components/ui/LoginButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col from-gray-50 to-white dark:from-gray-950 dark:to-black p-8">
        <main className="flex-1 flex flex-col items-center gap-8 text-center max-w-md mx-auto mt-8">
          <div className="w-32 h-32 sm:w-64 sm:h-64">
            <BookLoader />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Planos de Leitura da Bíblia
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Um espaço para se conectar com Deus através da leitura diária da
            Bíblia. Planos simples, progresso visível e uma caminhada de fé
            constante.
          </p>

          <div className="w-full flex flex-col items-center mt-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <LoginButton />
              <Link href="/biblia">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center gap-3 justify-center
            border-gray-300 dark:border-gray-700"
                >
                  Bíblia online
                </Button>
              </Link>
            </div>

            <div className="mt-8">
              <ThemeToggle />
            </div>
          </div>
        </main>

        <footer className="text-sm text-gray-500 text-center dark:text-gray-400">
          Criado com ❤️ para inspirar, compartilhar e fortalecer o hábito da
          leitura da Palavra de Deus.
        </footer>
      </div>
    </>
  );
}
