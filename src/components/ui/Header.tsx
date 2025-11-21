import LoginButton from "./LoginButton";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

type HeaderProps = {
  sticky?: boolean;
  title?: string;
};

export default function Header({ sticky = false, title }: HeaderProps) {
  const { user } = useUser();

  return (
    <header
      className={`
    z-10 border-gray-200 dark:border-gray-800 
    bg-white/80 dark:bg-gray-950/80 backdrop-blur
    ${sticky ? "sticky top-0" : ""}
  `}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* ESQUERDA: ícone + título */}
        <div className="flex items-center gap-3 hover:cursor-pointer">
          <Image
            src="/icons/icon-192x192.png"
            alt="Ícone da Bíblia"
            width={32}
            height={32}
            className="w-8 h-8 "
          />
          <h1 className="text-2xl font-bold">Bíblia</h1>
          {/* {title && <h1 className="text-2xl font-bold">{title}</h1>} */}
        </div>

        {/* DIREITA: actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user && <LoginButton />}
        </div>
      </div>
    </header>
  );
}
