import LoginButton from "./LoginButton";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "./theme-toggle";

type HeaderProps = {
  sticky?: boolean;
};

export default function Header({ sticky = false }: HeaderProps) {
  const { user } = useUser();

  return (
    <header
      className={`
        z-10 border-gray-200 dark:border-gray-800 
        bg-white/80 dark:bg-gray-950/80 backdrop-blur
        ${sticky ? "sticky top-0" : ""}
      `}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="text-3xl font-bold">Bíblia</h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user && <LoginButton />}
        </div>
      </div>
    </header>
  );
}
