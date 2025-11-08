"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/ui/Footer";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

type Dia = {
  id: string;
  data: string;
  numero: number;
  leitura: string;
  lido: boolean;
  planos_dias_id?: string;
};

type Dias = Dia[];

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

type DiaLido = {
  id: string;
  usuario_id: string;
  plano_leitura_id: string;
  planos_dias_id: string;
  criado_em?: string;
};

type DiaFinal = {
  numero: number;
  data_lido: string;
  leitura: string;
  lido: boolean;
  planos_dias_id?: string;
  dias_lidos_id?: string;
};

export default function InicioPage() {
  const params = useParams();
  const planoId = params?.id;
  const { user } = useUser();

  const userId = user?.id || "usuário não logado";

  const [percent, setPercent] = useState(0);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [diasPlano, setDiasPlano] = useState<Dias>([]);
  const [diasLidos, setDiasLidos] = useState<DiaLido[]>([]);
  const [diasFormatados, setDiasFormatados] = useState<DiaFinal[]>([]);
  const [proximaLeitura, setProximaLeitura] = useState(0);

  const carregarPlano = async () => {
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

    if (error) {
      toast.success("Plano não encontrado", {
        duration: 4000,
      });
      window.location.href = "/meusplanos";
    } else {
      setPlano(plano);
    }
  };

  const diasLidosFn = async () => {
    const { data: diasLidos, error } = await supabase
      .from("dias_lidos")
      .select(`*`)
      .eq("usuario_id", userId)
      .eq("plano_leitura_id", planoId);

    if (error) {
      console.error("Erro ao carregar os dias:", error.message);
    } else {
      setDiasLidos(diasLidos);
    }
  };

  const diasDoPlano = async () => {
    const { data: diasDoPlano, error } = await supabase
      .from("planos_dias")
      .select(`*`)
      .eq("plano_id", planoId);

    if (error) {
      console.error("Erro ao carregar o plano:", error.message);
    } else {
      setDiasPlano(diasDoPlano);
    }
  };

  const montarDias = (diasPlano: Dias, diasLidos: DiaLido[]): DiaFinal[] => {
    const diasFormatados = diasPlano.map((dia) => {
      const diaLido = diasLidos.find((dl) => dl.planos_dias_id === dia.id);

      return {
        numero: dia.numero,
        planos_dias_id: dia.id,
        dias_lidos_id: diaLido?.id,
        data_lido: diaLido?.criado_em
          ? new Date(diaLido.criado_em).toLocaleDateString("pt-BR")
          : "",
        leitura: Array.isArray(dia.leitura)
          ? dia.leitura
              .map((l) => {
                if (!Array.isArray(l.versos) || l.versos.length === 0) {
                  return `${l.livro} ${l.capitulo}`;
                }

                const versosOrdenados = [...l.versos].sort((a, b) => a - b);
                const intervalos: string[] = [];
                let inicio = versosOrdenados[0];
                let fim = versosOrdenados[0];

                for (let i = 1; i < versosOrdenados.length; i++) {
                  const atual = versosOrdenados[i];
                  if (atual === fim + 1) {
                    fim = atual;
                  } else {
                    intervalos.push(
                      inicio === fim ? `${inicio}` : `${inicio}-${fim}`
                    );
                    inicio = atual;
                    fim = atual;
                  }
                }

                intervalos.push(
                  inicio === fim ? `${inicio}` : `${inicio}-${fim}`
                );

                return `${l.livro} ${l.capitulo} : ${intervalos.join(", ")}`;
              })
              .join("; ")
          : dia.leitura || "",
        lido: !!diaLido,
      };
    });

    return diasFormatados;
  };

  useEffect(() => {
    if (diasFormatados.length > 0) {
      const proximoDiaNaoLidoIndex = diasFormatados.findIndex(
        (dia) => !dia.lido
      );
      setProximaLeitura(
        proximoDiaNaoLidoIndex !== -1 ? proximoDiaNaoLidoIndex : 0
      );
    }
  }, [diasFormatados]);

  useEffect(() => {
    const totalDias = diasFormatados.length;
    const diasLidosCount = diasFormatados.filter((dia) => dia.lido).length;
    const percentual = totalDias
      ? Math.round((diasLidosCount / totalDias) * 100)
      : 0;
    setPercent(percentual);
  }, [diasFormatados]);

  useEffect(() => {
    if (diasPlano.length) {
      const resultado = montarDias(diasPlano, diasLidos);
      setDiasFormatados(resultado);
    }
  }, [diasPlano, diasLidos]);

  useEffect(() => {
    const carregarTudo = async () => {
      await carregarPlano();
      await diasDoPlano();
      await diasLidosFn();
    };

    carregarTudo();
  }, []);

  const marcarLido = async (planos_dias_id: string) => {
    const { data, error } = await supabase
      .from("dias_lidos")
      .insert([
        {
          usuario_id: userId,
          plano_leitura_id: planoId,
          planos_dias_id: planos_dias_id,
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

      const novoId = data[0].id; // pega o id do registro recém-criado

      setDiasFormatados((prevDias) =>
        prevDias.map((dia) =>
          dia.planos_dias_id === planos_dias_id
            ? {
                ...dia,
                lido: true,
                data_lido: new Date().toLocaleDateString("pt-BR"),
                dias_lidos_id: novoId, // aqui garantimos que o ID existe
              }
            : dia
        )
      );
    }
  };

  const desmarcarLido = async (planos_dias_id: string) => {
    const { error } = await supabase
      .from("dias_lidos")
      .delete()
      .eq("id", planos_dias_id);

    if (error) {
      alert("Erro ao desmarcar");
    } else {
      toast("😢 Você desmarcou!", {
        duration: 4000,
      });

      setDiasFormatados((prevDias) =>
        prevDias.map((dia) =>
          dia.dias_lidos_id === planos_dias_id
            ? { ...dia, lido: false, data_lido: "", dias_lidos_id: undefined }
            : dia
        )
      );
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <Card className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 shadow-sm">
        <CardHeader className="-mb-4">
          <CardTitle className="text-2xl font-semibold text-yellow-900 dark:text-yellow-50">
            {plano?.nome || "Carregando..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1 space-y-1">
          <p className="text-muted-foreground text-sm sm:text-base">
            {plano?.descricao || ""}
          </p>
          <div className="border-t border-yellow-200 dark:border-yellow-800 pt-2">
            {plano?.usuario.nome && (
              <p className="text-xs text-yellow-800 dark:text-yellow-200 italic text-right">
                Criado por{" "}
                <span className="font-semibold">
                  {plano?.usuario.nome || ""}
                </span>
              </p>
            )}
          </div>
          {percent != 0 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Progresso: <span className="font-semibold">{percent}%</span>{" "}
                concluído
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle>Dias do Plano</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <ScrollArea className="h-96 pr-3">
            <ul className="flex flex-col gap-2">
              {diasFormatados
                .sort((a, b) => a.numero - b.numero)
                .map((dia, index) => {
                  return (
                    <li
                      key={dia.numero}
                      className={`p-3 border rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700
                        ${
                          index === proximaLeitura &&
                          "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900"
                        }
                        `}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          {dia.lido && (
                            <span className="text-green-600 dark:text-green-400 text-lg shrink-0">
                              ✔
                            </span>
                          )}
                          <div className="truncate">
                            <p className="font-medium text-sm sm:text-base truncate">
                              Dia {dia.numero}
                              {dia.lido && (
                                <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                                  Lido em {dia.data_lido}
                                </span>
                              )}
                            </p>
                            <p className="text-xs sm:text-sm whitespace-normal wrap-break-word">
                              {dia.leitura}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                          <Link
                            href={`/biblia/${planoId}/${dia.numero}`}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              className={`text-white text-xs sm:text-sm w-full ${
                                dia.lido
                                  ? "bg-cyan-700 hover:bg-cyan-900"
                                  : "bg-cyan-500 hover:bg-cyan-600"
                              }`}
                            >
                              {dia.lido ? "Ler novamente" : "Ler"}
                            </Button>
                          </Link>

                          {dia.lido ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 text-xs sm:text-sm"
                              onClick={() => desmarcarLido(dia.dias_lidos_id!)}
                            >
                              Desmarcar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm flex-1"
                              onClick={() => marcarLido(dia.planos_dias_id!)}
                            >
                              Marcar como lido
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
      <Footer />
    </div>
  );
}
