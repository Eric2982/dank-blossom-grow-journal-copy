import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sprout, Flower, BarChart3 } from "lucide-react";
import { differenceInDays } from "date-fns";
import { createPageUrl } from "../../components/utils";
import { useNavigation } from "@/lib/NavigationContext";

const typeColors = {
  indica: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  sativa: "bg-green-500/15 text-green-400 border-green-500/20",
  hybrid: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const statusColors = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  harvested: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  planned: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const plantTypeLabels = {
  photoperiod: "Photo",
  autoflower: "Auto",
  fast_flower: "Fast",
};

export default function StrainCard({ strain }) {
  const { navigateTo } = useNavigation();
  const vegDays = strain.planted_date && strain.flipped_to_flower_date 
    ? differenceInDays(new Date(strain.flipped_to_flower_date), new Date(strain.planted_date))
    : strain.planted_date && !strain.flipped_to_flower_date && strain.status === "active"
    ? differenceInDays(new Date(), new Date(strain.planted_date))
    : null;

  const flowerDays = strain.flipped_to_flower_date && strain.status === "active"
    ? differenceInDays(new Date(), new Date(strain.flipped_to_flower_date))
    : null;

  return (
    <div className="block rounded-2xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all overflow-hidden">
      <button onClick={() => navigateTo(createPageUrl(`StrainDetail?id=${strain.id}`))} aria-label={`View details for ${strain.name}`} className="block p-5 w-full text-left">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-base truncate">{strain.name}</h3>
            {strain.breeder && <p className="text-white/30 text-xs mt-0.5">{strain.breeder}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${typeColors[strain.type]} border text-[10px]`}>
            {strain.type}
          </Badge>
          <Badge className={`${statusColors[strain.status]} border text-[10px]`}>
            {strain.status}
          </Badge>
          <Badge className="bg-white/5 text-white/40 border-white/10 border text-[10px]">
            {plantTypeLabels[strain.plant_type]}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          {vegDays !== null && (
            <div className="flex items-center gap-2 text-white/60">
              <Sprout className="w-3 h-3 text-green-400" />
              <span>Veg: {vegDays} days</span>
            </div>
          )}
          {flowerDays !== null && (
            <div className="flex items-center gap-2 text-white/60">
              <Flower className="w-3 h-3 text-pink-400" />
              <span>Flower: {flowerDays} days</span>
            </div>
          )}
          {(strain.thc_percentage || strain.cbd_percentage) && (
            <div className="flex items-center gap-2 text-white/40">
              <span>THC: {strain.thc_percentage ?? "—"}%</span>
              <span>•</span>
              <span>CBD: {strain.cbd_percentage ?? "—"}%</span>
            </div>
          )}
        </div>
      </Link>

      {/* Summary shortcut */}
      <Link
        to={createPageUrl(`Summary?strain_id=${strain.id}`)}
        className="flex items-center gap-2 px-5 py-2.5 border-t border-white/5 text-white/40 hover:text-emerald-400 hover:bg-white/5 transition-colors text-xs"
      >
        <BarChart3 className="w-3 h-3" />
        <span>View Summary</span>
      </Link>
    </div>
  );
}