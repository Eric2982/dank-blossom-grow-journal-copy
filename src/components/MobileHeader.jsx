import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigation } from "@/lib/NavigationContext";
import { useLocation } from "react-router-dom";

const TAB_ROOTS = ['/', '/Chat', '/Summary', '/Challenges', '/Settings'];

export default function MobileHeader({ title }) {
  const { goBack, canGoBack } = useNavigation();
  const location = useLocation();
  const isSubPage = !TAB_ROOTS.includes(location.pathname);

  if (!isSubPage) return null;

  return (
    <div className="md:hidden sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-sm border-b border-white/5 flex items-center gap-2 px-2 h-14">
      <button
        onClick={goBack}
        aria-label="Go back"
        className="flex items-center justify-center w-11 h-11 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {title && <h1 className="text-white font-medium text-base truncate">{title}</h1>}
    </div>
  );
}