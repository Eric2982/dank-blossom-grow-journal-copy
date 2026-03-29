import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Check } from "lucide-react";

export default function MobileSelect({ value, onValueChange, options, placeholder, label, className }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = (optionValue) => {
    onValueChange(optionValue);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring ${className ?? ""}`}
      >
        <span className={selectedLabel ? "text-white" : "text-white/40"}>
          {selectedLabel ?? placeholder ?? "Select..."}
        </span>
        <svg className="w-4 h-4 text-white/40 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-zinc-900 border-white/10 max-h-[85vh]">
          {label && (
            <DrawerHeader className="border-b border-white/10 pb-3">
              <DrawerTitle className="text-white text-base">{label}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="overflow-y-auto py-2" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm text-white hover:bg-white/5 active:bg-white/10 transition-colors min-h-[52px]"
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}