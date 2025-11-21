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
      <div className="min-h-screen flex flex-col items-center justify-center from-gray-50 to-white dark:from-gray-950 dark:to-black p-8">
        <main className="flex flex-col items-center gap-8 text-center max-w-md flex-1 justify-center">
          <div className="w-64 h-64">
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
            {/* Linha dos botões */}
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

            <div className="mt-4">
              <ThemeToggle />
            </div>
          </div>
        </main>

        {/* Rodapé */}
        <footer className=" text-sm text-gray-500 dark:text-gray-400">
          Criado com ❤️ para inspirar, compartilhar e fortalecer o hábito da
          leitura da Palavra de Deus.
        </footer>
      </div>
    </>
  );
}
