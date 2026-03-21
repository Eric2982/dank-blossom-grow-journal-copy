import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MobileSelect({ value, onValueChange, options, placeholder, label, className }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`bg-white/5 border-white/10 text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-white/10">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-white">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}