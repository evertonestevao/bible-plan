"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";

type Plano = {
  id: string;
  nome: string;
  descricao?: string;
};

export default function PlanosLeituraPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user.tipo !== "admin") {
      router.push("/");
    }

    if (!user.id) {
      router.push("/");
    }
  }, [user]);

  const userId = user?.id || null;

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [novoPlanoAtivo, setNovoPlanoAtivo] = useState(false);
  const [nomeNovoPlano, setNomeNovoPlano] = useState("");
  const [descricaoNovoPlano, setDescricaoNovoPlano] = useState("");
  const [publicoNovoPlano, setPublicoNovoPlano] = useState(false);
  const [planosPublicos, setPlanosPublicos] = useState<Plano[]>([]);
  const [carregandoPlanosPublicos, setCarregandoPlanosPublicos] =
    useState(true);
  const [carregando, setCarregando] = useState(true);

  const carregarPlanos = async () => {
    const { data, error } = await supabase
      .from("planos_leitura")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setPlanos(data || []);
  };

  useEffect(() => {
    if (!userId) return;
    carregarPlanos();
  }, [userId]);

  const criarPlano = async () => {
    if (!nomeNovoPlano.trim()) return alert("Digite o nome do plano");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return alert("Usuário não autenticado");

    const { data, error } = await supabase
      .from("planos_leitura")
      .insert([
        {
          nome: nomeNovoPlano,
          descricao: descricaoNovoPlano,
          usuario_id: user.id,
          publico: publicoNovoPlano,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      alert("Erro ao criar plano");
    } else if (data && data.length > 0) {
      setPlanos((prev) => [...prev, data[0]]);
      setNomeNovoPlano("");
      setDescricaoNovoPlano("");
      setNovoPlanoAtivo(false);
    }
  };

  const excluirPlano = async (id: string) => {
    if (!confirm("Deseja realmente excluir este plano?")) return;

    const { error } = await supabase
      .from("planos_leitura")
      .delete()
      .eq("id", id);

    if (error) console.error(error);
    else setPlanos((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    const carregarPlanosPublicos = async () => {
      const { data, error } = await supabase
        .from("planos_leitura")
        .select("*")
        .eq("publico", true);

      if (error) console.error(error);
      else setPlanosPublicos(data || []);

      setCarregandoPlanosPublicos(false);
    };

    carregarPlanosPublicos();
  }, []);

  return (
    <>
      <Header />
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Planos de Leitura</h1>
          <Button
            onClick={() => setNovoPlanoAtivo((prev) => !prev)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Criar novo plano
          </Button>
        </div>

        {novoPlanoAtivo && (
          <div className="mb-6 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nome do plano"
              value={nomeNovoPlano}
              onChange={(e) => setNomeNovoPlano(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={descricaoNovoPlano}
              onChange={(e) => setDescricaoNovoPlano(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={publicoNovoPlano}
                onChange={(e) => setPublicoNovoPlano(e.target.checked)}
                id="publico"
                className="w-4 h-4"
              />
              <label htmlFor="publico" className="text-sm">
                Plano público (Qualquer pessoa poderá ver este plano)
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={criarPlano}>Salvar Plano</Button>
              <Button
                variant="outline"
                onClick={() => setNovoPlanoAtivo(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {planos.length === 0 ? (
          <p className="text-gray-500">Nenhum plano criado ainda.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {planos.map((plano) => (
              <div
                key={plano.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <h2 className="font-semibold text-lg">{plano.nome}</h2>
                  {plano.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                      {plano.descricao}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/planosleitura/${plano.id}`}>
                    <Button
                      size="sm"
                      className="flex items-center gap-1 bg-amber-500"
                    >
                      <Edit className="w-4 h-4" /> Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => excluirPlano(plano.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
