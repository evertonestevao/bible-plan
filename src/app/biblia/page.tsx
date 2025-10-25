"use client";

import { useState, useEffect } from "react";
import { VersionSelector } from "@/components/ui/VersionSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Lottie from "lottie-react";
import bookAnimation from "../../../public/animations/book.json";
import Footer from "@/components/ui/Footer";
import LoginButton from "@/components/ui/LoginButton";
import { useUser } from "@/contexts/UserContext";

type Livro = {
  name: string;
  abbrev: string;
  chapters: string[][];
};

export default function BibliaPage() {
  const [versao, setVersao] = useState("AA");
  const [biblia, setBiblia] = useState<Livro[]>([]);
  const [livroAbrev, setLivroAbrev] = useState<string | null>(null);
  const [capituloIndex, setCapituloIndex] = useState<number>(0);
  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(true);
  const [carregandoNovaVersao, setCarregandoNovaVersao] = useState(false);
  const { user } = useUser();

  const carregarVersao = async (
    novaVersao: string,
    livro?: string,
    cap?: number
  ) => {
    try {
      const res = await fetch(`/biblias/${novaVersao.toLowerCase()}.json`);
      const data = await res.json();

      const livroAtual = livro
        ? data.find((l: Livro) => l.abbrev === livro)
        : data[0];
      const capituloValido =
        cap && livroAtual && cap < livroAtual.chapters.length ? cap : 0;

      setBiblia(data);
      setLivroAbrev(livroAtual ? livroAtual.abbrev : data[0].abbrev);
      setCapituloIndex(capituloValido);
    } catch (err) {
      console.error("Erro ao carregar a Bíblia:", err);
    }
  };

  useEffect(() => {
    carregarVersao(versao).then(() => setPrimeiroCarregamento(false));
  }, []);

  useEffect(() => {
    if (!primeiroCarregamento) {
      setCarregandoNovaVersao(true);
      carregarVersao(versao, livroAbrev ?? undefined, capituloIndex).finally(
        () => setTimeout(() => setCarregandoNovaVersao(false), 300)
      );
    }
  }, [capituloIndex, livroAbrev, primeiroCarregamento, versao]);

  if (primeiroCarregamento)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          <Lottie animationData={bookAnimation} loop={true} />
        </div>
      </div>
    );

  const livro = livroAbrev ? biblia.find((l) => l.abbrev === livroAbrev) : null;
  const versos = livro ? livro.chapters[capituloIndex] : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f5] dark:bg-gray-950">
      {/* Cabeçalho fixo */}
      <div className="sticky top-0 z-10 bg-[#f8f8f5] dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center p-4">
          <div>
            <h1 className="text-2xl font-bold">Bíblia</h1>
            {livro && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                📖 {livro.name} — Capítulo {capituloIndex + 1}
              </p>
            )}
          </div>

          {/* Container à direita para VersionSelector e LoginButton */}
          <div className="flex items-center gap-4">
            <VersionSelector versao={versao} setVersao={setVersao} />
            {!user && <LoginButton />}
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4">
        {/* Livro + Capítulo */}
        {livro && (
          <div className="flex gap-4 mb-4 flex-wrap sm:flex-nowrap items-center">
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor="livro" className="mb-2">
                Livro
              </Label>
              <Select
                value={livroAbrev || ""}
                onValueChange={(v) => {
                  setLivroAbrev(v);
                  setCapituloIndex(0);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o livro" />
                </SelectTrigger>
                <SelectContent>
                  {biblia.map((l) => (
                    <SelectItem key={l.abbrev} value={l.abbrev}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-32">
              <Label htmlFor="capitulo" className="mb-2">
                Capítulo
              </Label>
              <Select
                value={capituloIndex.toString()}
                onValueChange={(v) => setCapituloIndex(parseInt(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Capítulo" />
                </SelectTrigger>
                <SelectContent>
                  {livro.chapters.map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Área de leitura (scroll natural da página) */}
        {livro && (
          <div className="border rounded p-4 dark:bg-gray-900 space-y-2">
            {versos.map((v, i) => (
              <p key={i}>
                <strong>{i + 1} </strong> {v}
              </p>
            ))}
          </div>
        )}

        {/* Botões de navegação */}
        {livro && (
          <div className="flex justify-between mt-6 mb-6">
            <button
              onClick={() => {
                if (capituloIndex > 0) setCapituloIndex((prev) => prev - 1);
              }}
              disabled={capituloIndex === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              ← Anterior
            </button>

            <button
              onClick={() => {
                if (livro && capituloIndex < livro.chapters.length - 1)
                  setCapituloIndex((prev) => prev + 1);
              }}
              disabled={!livro || capituloIndex >= livro.chapters.length - 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              Próximo →
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
