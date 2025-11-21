"use client";

import { useState, useEffect, useRef } from "react";
import { VersionSelector } from "@/components/ui/VersionSelector";
// import Lottie from "lottie-react";
// import bookAnimation from "../../../../animations/book.json";
import Footer from "@/components/ui/Footer";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import BookLoader from "@/components/ui/BookAnimation";
import Header from "@/components/ui/Header";
// import BookAnimation from "@/components/ui/BookAnimation";

type Livro = {
  name: string;
  abbrev: string;
  chapters: string[][];
};

type Plano = {
  id: string;
  nome: string;
  descricao?: string;
  publico?: boolean;
  usuario_id?: string;
  usuario: {
    id: string;
    nome: string;
  };
};

type LeituraItem = {
  livro: string;
  abbrev: string;
  versos: number[];
  capitulo: number;
  numero?: number;
  plano_id?: string;
  resumo?: string;
};

type Dia = {
  leitura: LeituraItem[];
  resumo?: string;
  id?: string;
  numero?: number;
  plano_id?: string;
  created_at?: string;
  lido: boolean;
};

type LivroFiltrado = {
  name: string;
  abbrev: string;
  capitulo: number;
  versos: string[];
};

export default function BibliaPage() {
  const params = useParams();
  const router = useRouter();
  const planoId = params?.id_plano;
  const diaNumero = params?.dia;
  const diaAtual = Number(diaNumero);

  const userId = "1809927e-320f-4c2d-a17e-1a945982d172";

  const [plano, setPlano] = useState<Plano | null>(null);
  const [dia, setDia] = useState<Dia | null>(null);

  const [versao, setVersao] = useState("AA");
  const [biblia, setBiblia] = useState<LivroFiltrado[]>([]);
  const [diaFormatado, setDiaFormatado] = useState<Dia | null>(null);
  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(true);

  const headerRef = useRef<HTMLDivElement>(null);
  const alturaHeader = headerRef.current?.offsetHeight || 0;

  // Carrega o plano
  useEffect(() => {
    if (!planoId) return;

    const fetchPlano = async () => {
      const { data: plano, error } = await supabase
        .from("planos_leitura")
        .select(
          `
          *,
          usuario:usuarios(id, nome),
          usuarios_planos!inner(usuario_id)
        `
        )
        .eq("id", planoId)
        .single();

      if (error) console.error("Erro ao carregar o plano:", error.message);
      else setPlano(plano);
    };

    fetchPlano();
  }, [planoId]);

  // Carrega o dia do plano
  useEffect(() => {
    if (!planoId || !diaNumero) return;

    const fetchDia = async () => {
      try {
        const { data: diaAtual, error } = await supabase
          .from("planos_dias")
          .select(
            `
        *,
        dias_lidos!left(usuario_id)
      `
          )
          .eq("plano_id", planoId)
          .eq("numero", diaNumero)
          .eq("dias_lidos.usuario_id", userId)
          .single();

        if (error) {
          console.error("Erro ao carregar o dia:", error.message);
          setDia(null);
          return;
        }

        setDiaFormatado({
          leitura: diaAtual.leitura,
          resumo: diaAtual.resumo,
          id: diaAtual.id,
          numero: diaAtual.numero,
          plano_id: diaAtual.plano_id,
          created_at: diaAtual.created_at,
          lido: diaAtual.dias_lidos?.length > 0,
        });

        setDia(diaFormatado);
      } catch (err) {
        console.error("Erro inesperado ao carregar o dia:", err);
        setDia(null);
      }
    };

    fetchDia();
  }, [planoId, diaNumero, diaFormatado]);

  const carregarVersaoComLeitura = async (
    novaVersao: string,
    leitura: LeituraItem[]
  ) => {
    try {
      const res = await fetch(`/biblias/${novaVersao.toLowerCase()}.json`);
      const data: Livro[] = await res.json();

      const livrosFiltrados: LivroFiltrado[] = leitura
        .map((item) => {
          const livroAtual = data.find((l) => l.abbrev === item.abbrev);
          if (!livroAtual) return null;

          const capIndex = item.capitulo - 1; // <--- ajuste aqui
          if (!livroAtual.chapters[capIndex]) return null;

          return {
            name: livroAtual.name,
            abbrev: livroAtual.abbrev,
            capitulo: item.capitulo, // mantém o número real do plano
            versos: livroAtual.chapters[capIndex],
          };
        })
        .filter(Boolean) as LivroFiltrado[];

      setBiblia(livrosFiltrados);
    } catch (err) {
      console.error("Erro ao carregar a Bíblia:", err);
    }
  };

  // Carrega versão inicial
  useEffect(() => {
    if (dia?.leitura) {
      carregarVersaoComLeitura(versao, dia.leitura).then(() =>
        setPrimeiroCarregamento(false)
      );
    }
  }, [dia, versao]);

  if (primeiroCarregamento)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-64 h-64">
          {/* <Lottie animationData={bookAnimation} loop={true} /> */}
          {/* Carregando... */}
          {/* <BookAnimation name="Carregando..." /> */}
          <BookLoader />
        </div>
      </div>
    );

  const marcarLido = async () => {
    const { data, error } = await supabase
      .from("dias_lidos")
      .insert([
        {
          usuario_id: userId,
          plano_leitura_id: planoId,
          planos_dias_id: dia?.id,
        },
      ])
      .select();

    if (error) {
      alert("Erro ao inscrever no plano");
      return;
    }

    if (data && data.length > 0) {
      toast("😊 Excelente! Mais uma leitura concluída 📖✨ ", {
        duration: 4000,
      });
    }
    setDiaFormatado({ lido: false } as Dia);
  };

  const marcarComoNaoLido = async () => {
    const { error } = await supabase
      .from("dias_lidos")
      .delete()
      .eq("usuario_id", userId)
      .eq("planos_dias_id", dia?.id);
    if (error) {
      alert("Erro ao desmarcar o dia como lido");
      return;
    } else {
      toast("😮‍💨 Dia desmarcado como lido. Continue firme na leitura! 📖💪", {
        duration: 4000,
      });
    }
  };

  const voltarDia = () => {
    const proximoDia = diaAtual - 1;
    router.push(`/biblia/${planoId}/${proximoDia}`);
  };
  const avancarDia = () => {
    const proximoDia = diaAtual + 1;
    router.push(`/biblia/${planoId}/${proximoDia}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f5] dark:bg-gray-950">
      <div
        ref={headerRef}
        className="sticky top-0 z-10 bg-[#f8f8f5] dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
          <div>
            <h1 className="text-2xl font-bold">Bíblia</h1>

            <p className="font-semibold text-gray-700 dark:text-gray-400 mt-1">
              📖 {plano?.nome} | Dia {diaNumero}
            </p>

            <p className="text-gray-600 text-sm dark:text-gray-400 mt-1">
              {dia?.resumo}
            </p>
          </div>
          <VersionSelector versao={versao} setVersao={setVersao} />
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 space-y-6">
        {biblia.map((item) => (
          <div
            key={`${item.abbrev}-${item.capitulo}`}
            className="border rounded p-4 dark:bg-gray-900 space-y-2"
          >
            <h2
              className="sticky bg-[#f8f8f5] dark:bg-gray-950 px-4 py-2 font-bold border-b border-gray-700 z-10"
              style={{ top: alturaHeader }}
            >
              {item.name} - Capítulo {item.capitulo}
            </h2>
            {item.versos.map((verso, i) => (
              <p key={i}>
                <strong>{i + 1} </strong> {verso}
              </p>
            ))}
          </div>
        ))}
        <div className="flex justify-between mt-6 mb-6">
          <button
            onClick={voltarDia}
            className="px-4 py-2 hover:cursor-pointer bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            ← Dia anterior
          </button>

          {diaFormatado ? (
            diaFormatado.lido ? (
              <button
                onClick={() => marcarComoNaoLido()}
                className="px-4 py-2 hover:cursor-pointer text-white bg-red-500 dark:bg-red-800 rounded-lg"
              >
                Marcar como não lido
              </button>
            ) : (
              <button
                onClick={() => marcarLido()}
                className="px-4 py-2 hover:cursor-pointer text-white bg-green-500 dark:bg-green-800 rounded-lg"
              >
                Marcar como lido
              </button>
            )
          ) : null}

          <button
            onClick={avancarDia}
            className="px-4 py-2 hover:cursor-pointer bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            Próximo dia →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
