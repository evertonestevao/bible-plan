"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandList, CommandItem } from "@/components/ui/command";

interface VersaoSelectorProps {
  versao: string;
  setVersao: (v: string) => void;
}

const VERSOES = ["AA", "ACF", "NVI"];

export function VersionSelector({ versao, setVersao }: VersaoSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:cursor-pointer">
          {versao}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command>
          <CommandList>
            {VERSOES.map((v) => (
              <CommandItem
                className="hover:cursor-pointer"
                key={v}
                onSelect={() => {
                  setVersao(v);
                  setOpen(false); // fecha o popover ao selecionar
                }}
              >
                {v}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
