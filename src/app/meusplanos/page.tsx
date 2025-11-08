"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/ui/Footer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import LoginButton from "@/components/ui/LoginButton";

type Plano = {
  id: string;
  nome: string;
  descricao?: string;
  publico?: boolean;
  inscritos?: number;
  usuario: {
    id: string;
    nome: string;
  };
  usuarios_planos?: {
    count: number;
  }[];
};

export default function MeuPlanoPage() {
  const [planosPublicos, setPlanosPublicos] = useState<Plano[]>([]);
  const [meusPlanos, setMeusPlanos] = useState<Plano[]>([]);
  const { user, loading } = useUser();

  const userId = user?.id || null;

  const [carregandoPlanosPublicos, setCarregandoPlanosPublicos] =
    useState(true);
  const [carregandoMeusPlanos, setCarregandoMeusPlanos] = useState(true);

  const inscrever = async (plano_id: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para se inscrever!");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios_planos")
      .insert([
        {
          usuario_id: userId,
          plano_id: plano_id,
        },
      ])
      .select();

    if (error) {
      alert("Erro ao inscrever no plano");
    } else if (data && data.length > 0) {
      toast.success("Inscrição realizada, aproveite seu plano de leitura!", {
        duration: 4000,
      });

      await carregarPlanosInscritos();
      await carregarPlanos();
    }
  };

  const cancelarInscricao = async (plano_id: string) => {
    const { error } = await supabase
      .from("usuarios_planos")
      .delete()
      .eq("usuario_id", userId)
      .eq("plano_id", plano_id);

    if (error) {
      alert("Erro ao cancelar a inscrição");
    } else {
      toast.success("Inscrição cancelada!", {
        duration: 4000,
      });

      // Atualiza os planos
      await carregarPlanosInscritos();
      await carregarPlanos();
    }
  };

  const carregarPlanosInscritos = async () => {
    if (!user) return;

    const { data: planosInscritos, error } = await supabase
      .from("planos_leitura")
      .select(
        `
      *,
      usuario:usuarios(id, nome),
      usuarios_planos!inner(usuario_id)
    `
      )
      .eq("usuarios_planos.usuario_id", user.id); // agora é seguro usar user.id

    if (error) {
      console.error("Erro ao buscar planos inscritos:", error);
    } else {
      setMeusPlanos(planosInscritos || []);
    }
    setCarregandoMeusPlanos(false);
  };

  const carregarPlanos = async () => {
    // 1️⃣ Buscar planos do usuário
    const { data: meusPlanosData } = await supabase
      .from("usuarios_planos")
      .select("plano_id")
      .eq("usuario_id", userId);

    const meusPlanosIds = meusPlanosData?.map((p) => p.plano_id) || [];

    // 2️⃣ Buscar todos os planos públicos
    const { data: planoData, error: planoError } = await supabase
      .from("planos_leitura")
      .select(
        `
      *,
      usuario:usuarios(id, nome),
      usuarios_planos(count)
    `
      )
      .eq("publico", true);

    if (planoError) {
      console.error(planoError);
      setPlanosPublicos([]);
    } else {
      // 3️⃣ Filtrar apenas os planos que o usuário ainda não está inscrito
      const planosNaoInscritos = planoData.filter(
        (plano) => !meusPlanosIds.includes(plano.id)
      );

      setPlanosPublicos(planosNaoInscritos);
    }

    setCarregandoPlanosPublicos(false);
  };

  useEffect(() => {
    if (!user) return; // só executa quando user estiver carregado

    const carregarDados = async () => {
      await carregarPlanosInscritos();
      await carregarPlanos();
    };

    carregarDados();
  }, [user]);

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-10">
      {/* 🔹 Título principal */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Planos de Leitura</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe seus planos de leitura e descubra novos para seguir.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 justify-between ">
          ✅ Meus Planos{" "}
          <Badge
            variant="secondary"
            className="bg-green-500 text-white dark:bg-green-600"
          >
            {meusPlanos.length}
          </Badge>
        </h2>
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}
        {/* Criar um IF caso o usuário não esteja logado */}

        {!userId ? (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div className="text-gray-700">
              <p className="font-medium">Você não está logado</p>
              <p className="text-sm text-gray-500">
                Entre para acessar seus planos
              </p>
            </div>
            <LoginButton />
          </div>
        ) : (
          <>
            {carregandoMeusPlanos ? (
              <p className="text-gray-500">Carregando meus planos</p>
            ) : meusPlanos.length === 0 ? (
              <p className="text-gray-500">
                Você não está inscrito em nenhum plano.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {meusPlanos.map((plano) => (
                  <div
                    key={plano.id}
                    className="relative border rounded-2xl p-5 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition"
                  >
                    {/* Botão de compartilhar */}
                    <button className="absolute top-3 right-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                      <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>

                    {/* Nome e descrição */}
                    <h3 className="font-semibold text-lg">{plano.nome}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {plano.descricao}
                    </p>

                    {/* Barra de progresso */}
                    {/* <div className="mt-4">
                  <Progress
                    value={plano.progresso ?? 34}
                    className="h-2 rounded-full "
                  />
                  <p className="text-xs text-gray-500 mt-1 ">
                    {plano.progresso ?? 34}% concluído
                  </p>
                </div> */}

                    {/* Informações e ação */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Informações do plano */}
                      <div className="flex flex-col gap-1 text-gray-500 text-sm">
                        {(plano.usuarios_planos?.length ?? 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />{" "}
                            {plano.usuarios_planos?.[0]?.count} inscritos
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          Criado por{" "}
                          <span className="text-accent-foreground font-medium">
                            {plano.usuario.nome}
                          </span>
                        </div>
                      </div>

                      <div className="items-end gap-2 flex ">
                        <Link href={`/meusplanos/${plano.id}`}>
                          <Button className="text-sm bg-green-600 hover:bg-green-700">
                            Abrir
                          </Button>
                        </Link>

                        <Button
                          onClick={() => cancelarInscricao(plano.id)}
                          variant="outline"
                          className="text-sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 🔹 Planos Públicos */}
      {planosPublicos.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            📖 Planos Disponíveis{" "}
            <Badge
              variant="secondary"
              className="bg-blue-500 text-white dark:bg-blue-600"
            >
              {planosPublicos.length}
            </Badge>
          </h2>
          {carregandoPlanosPublicos ? (
            <p className="text-gray-500">Carregando planos</p>
          ) : planosPublicos.length === 0 ? (
            <p className="text-gray-500">Nenhum plano público disponível.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {planosPublicos.map((plano) => (
                <div
                  key={plano.id}
                  className="relative border rounded-2xl p-5 shadow-sm hover:shadow-md bg-gray-50 dark:bg-gray-900 transition"
                >
                  <button className="absolute hover:cursor-pointer top-3 right-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                    <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <h3 className="font-semibold text-lg">{plano.nome}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {plano.descricao}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    {/* Informações do plano */}
                    <div className="flex flex-col gap-1 text-gray-500 text-sm">
                      {(plano.usuarios_planos?.[0]?.count ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />{" "}
                          {plano.usuarios_planos?.[0]?.count} inscritos
                        </div>
                      )}
                      <div className="flex items-center gap-1 ">
                        Criado por{" "}
                        <span className="text-accent-foreground font-medium">
                          {plano.usuario.nome}
                        </span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <Button
                      onClick={() => inscrever(plano.id)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
                    >
                      Inscrever-se
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
      <Footer />
    </div>
  );
}
