"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

// Tipagem
type Livro = {
  name: string;
  abbrev: string;
  chapters: string[][];
};

type Leitura = {
  livro: string;
  abbrev: string;
  capitulo: number;
  versos: number[];
};

type Dia = {
  id: string;
  plano_id: string;
  numero: number;
  resumo: string;
  leitura: Leitura[];
};

type Plano = {
  id: string;
  nome: string;
  descricao?: string;
};

export default function EditarPlanoPage() {
  const params = useParams();
  const planoId = params?.plano; // id do plano na URL

  const [biblia, setBiblia] = useState<Livro[]>([]);
  const [dias, setDias] = useState<Dia[]>([]);
  const [diaAtual, setDiaAtual] = useState(1);

  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [capituloSelecionado, setCapituloSelecionado] = useState<number | null>(
    null
  );
  const [versosSelecionados, setVersosSelecionados] = useState<number[]>([]);
  const [resumoDia, setResumoDia] = useState("");

  const [plano, setPlano] = useState<Plano | null>(null);

  // Carrega Bíblia
  useEffect(() => {
    const carregarBiblia = async () => {
      const res = await fetch("/biblias/aa.json");
      const data = await res.json();
      setBiblia(data);
    };
    carregarBiblia();
  }, []);

  // Carrega plano e dias do Supabase
  useEffect(() => {
    if (!planoId) return;

    const carregarPlano = async () => {
      const { data: planoData, error: planoError } = await supabase
        .from("planos_leitura")
        .select("*")
        .eq("id", planoId)
        .single();

      if (planoError) {
        console.error(planoError);
        return;
      }
      setPlano(planoData);

      const { data: diasData, error: diasError } = await supabase
        .from("planos_dias")
        .select("*")
        .eq("plano_id", planoId)
        .order("numero", { ascending: true });

      if (diasError) console.error(diasError);
      else setDias(diasData || []);
    };

    carregarPlano();
  }, [planoId]);

  // Adicionar ou atualizar dia
  const adicionarLeitura = async () => {
    if (!planoId) return;
    if (
      !livroSelecionado ||
      capituloSelecionado === null ||
      versosSelecionados.length === 0
    )
      return alert("Selecione livro, capítulo e versículos.");

    const novaLeitura: Leitura = {
      livro: livroSelecionado.name,
      abbrev: livroSelecionado.abbrev,
      capitulo: capituloSelecionado + 1,
      versos: versosSelecionados,
    };

    const diaExistente = dias.find((d) => d.numero === diaAtual);

    if (!diaExistente) {
      // Cria dia no Supabase
      const { data: novoDia, error } = await supabase
        .from("planos_dias")
        .insert([
          {
            plano_id: planoId,
            numero: diaAtual,
            resumo: resumoDia,
            leitura: [novaLeitura],
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error(error);
        return alert("Erro ao criar o dia.");
      }

      setDias((prev) => [...prev, novoDia]);
    } else {
      // Atualiza dia existente
      const { data: diaAtualizado, error } = await supabase
        .from("planos_dias")
        .update({
          resumo: resumoDia,
          leitura: [...diaExistente.leitura, novaLeitura],
        })
        .eq("id", diaExistente.id)
        .select("*")
        .single();

      if (error) {
        console.error(error);
        return alert("Erro ao atualizar o dia.");
      }

      setDias((prev) =>
        prev.map((d) => (d.id === diaExistente.id ? diaAtualizado : d))
      );
    }

    // Limpa seleção
    setLivroSelecionado(null);
    setCapituloSelecionado(null);
    setVersosSelecionados([]);
    setResumoDia("");
  };

  if (!plano) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-t-cyan-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Carregando plano...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Topo do plano */}
      <div className="mb-6 p-4 rounded-lg  from-cyan-400 to-blue-500 text-white shadow-md">
        <h1 className="text-2xl font-bold">{plano.nome}</h1>
        {plano.descricao && <p className="text-sm mt-1">{plano.descricao}</p>}
        <div className="mt-2 flex flex-wrap gap-4">
          <span className="bg-white text-gray-800 px-2 py-1 rounded font-medium text-sm">
            Dias criados: {dias.length}
          </span>
          <span className="bg-white text-gray-800 px-2 py-1 rounded font-medium text-sm">
            Dia atual: {diaAtual}
          </span>
        </div>
      </div>

      {/* Seleção do dia e resumo */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <Label>Dia</Label>
          <input
            type="number"
            min={1}
            value={diaAtual}
            onChange={(e) => setDiaAtual(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 mt-2"
          />
        </div>
        <div className="flex-1">
          <Label>Resumo do dia</Label>
          <input
            type="text"
            value={resumoDia}
            onChange={(e) => setResumoDia(e.target.value)}
            placeholder="Digite um resumo do dia"
            className="w-full border rounded px-2 py-1 mt-2"
          />
        </div>
      </div>

      {/* Seleção do livro e capítulo */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label>Livro</Label>
          <Select
            value={livroSelecionado?.abbrev || ""}
            onValueChange={(v) => {
              const livro = biblia.find((l) => l.abbrev === v);
              setLivroSelecionado(livro || null);
              setCapituloSelecionado(null);
              setVersosSelecionados([]);
            }}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Selecione um livro" />
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

        {livroSelecionado && (
          <div className="w-32">
            <Label>Capítulo</Label>
            <Select
              value={capituloSelecionado?.toString() || ""}
              onValueChange={(v) => {
                setCapituloSelecionado(Number(v));
                setVersosSelecionados([]);
              }}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Selecione um capítulo" />
              </SelectTrigger>
              <SelectContent>
                {livroSelecionado.chapters.map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Seleção dos versículos */}
      {livroSelecionado && capituloSelecionado !== null && (
        <div className="mb-4">
          <Label>Versículos</Label>
          <div className="mb-2 flex gap-2 flex-wrap mt-2">
            <Button
              className="bg-green-500 hover:bg-green-600"
              size="sm"
              onClick={() => {
                const total =
                  livroSelecionado.chapters[capituloSelecionado].length;
                setVersosSelecionados(
                  Array.from({ length: total }, (_, i) => i + 1)
                );
              }}
            >
              Selecionar todos
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVersosSelecionados([])}
            >
              Limpar seleção
            </Button>
          </div>

          <ScrollArea className="h-48 border rounded p-2">
            <div className="flex flex-wrap gap-2">
              {Array.from(
                {
                  length: livroSelecionado.chapters[capituloSelecionado].length,
                },
                (_, i) => i + 1
              ).map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setVersosSelecionados((prev) =>
                      prev.includes(v)
                        ? prev.filter((x) => x !== v)
                        : [...prev, v]
                    )
                  }
                  className={`px-2 py-1 border rounded transition ${
                    versosSelecionados.includes(v)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Botão adicionar */}
      <div className="mb-6">
        <Button
          className="bg-blue-500 hover:bg-blue-600"
          size="lg"
          onClick={adicionarLeitura}
        >
          Adicionar ao dia
        </Button>
      </div>

      {/* Dias já criados */}
      {dias.map((d) => (
        <div
          key={d.id}
          className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-900"
        >
          <h2 className="font-semibold mb-1">
            Dia {d.numero} {d.resumo && `- ${d.resumo}`}
          </h2>
          {d.leitura.map((l, idx) => (
            <p key={idx}>
              {l.livro} {l.capitulo} - Versículos:{" "}
              <span className="font-light "> {l.versos.join(", ")}</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
