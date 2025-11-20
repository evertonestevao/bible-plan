import { useState } from "react";

type Props = {
  numero: number;
  textoPadrao: string;
  livroAbrev: string;
  capitulo: number;
  versaoAtual: string;
};

type Livro = {
  name: string;
  abbrev: string;
  chapters: string[][];
};

export default function VersiculoCollapse({
  numero,
  textoPadrao,
  livroAbrev,
  capitulo,
  versaoAtual,
}: Props) {
  const [open, setOpen] = useState(false);
  const [outrasVersoes, setOutrasVersoes] = useState<Record<
    string,
    string
  > | null>(null);
  const [loading, setLoading] = useState(false);

  const versoesDisponiveis = ["aa", "acf", "nvi"];

  const carregarOutrasVersoes = async () => {
    if (outrasVersoes) return;

    setLoading(true);
    const resultado: Record<string, string> = {};

    const versoesParaBuscar = versoesDisponiveis.filter(
      (v) => v.toLowerCase() !== versaoAtual.toLowerCase()
    );

    for (const v of versoesParaBuscar) {
      try {
        const res = await fetch(`/biblias/${v}.json`);
        const data: Livro[] = await res.json();

        const livro = data.find((l) => l.abbrev === livroAbrev);
        const verso = livro?.chapters?.[capitulo]?.[numero - 1];

        if (verso) resultado[v.toUpperCase()] = verso;
      } catch (err) {
        console.error(`Erro ao carregar versão ${v}`, err);
      }
    }

    setOutrasVersoes(resultado);
    setLoading(false);
  };

  const abrir = () => {
    setOpen(!open);
    if (!open) carregarOutrasVersoes();
  };

  return (
    <div
      className={`border-gray-300 dark:border-gray-700 ${
        open ? "bg-gray-200 dark:bg-gray-700" : ""
      }`}
    >
      <p
        className={`
          cursor-pointer p-1 rounded
          hover:bg-gray-100 dark:hover:bg-gray-800
          
        `}
        onClick={abrir}
      >
        <strong>{numero} </strong> {textoPadrao}
      </p>

      {open && (
        <div className="mt-2 mb-4 ml-2 rounded text-sm space-y-1 border-b">
          {loading && <p>Carregando versões...</p>}

          {!loading &&
            outrasVersoes &&
            Object.entries(outrasVersoes).map(([versao, texto]) => (
              <p key={versao}>
                <strong>{versao}: </strong>
                {texto}
              </p>
            ))}

          {!loading &&
            outrasVersoes &&
            Object.keys(outrasVersoes).length === 0 && (
              <p>Nenhuma outra versão disponível.</p>
            )}
        </div>
      )}
    </div>
  );
}
