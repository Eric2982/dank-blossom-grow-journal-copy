import React from "react";
import { Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  lighting: "Lighting",
  nutrients: "Nutrients",
  growing_media: "Growing Media",
  climate_control: "Climate Control",
  tents_rooms: "Tents & Rooms",
  irrigation: "Irrigation",
  monitoring: "Monitoring",
  accessories: "Accessories",
};

const categoryColors = {
  lighting: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  nutrients: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  growing_media: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  climate_control: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  tents_rooms: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  irrigation: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  monitoring: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  accessories: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

export default function StoreCard({ item }) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all duration-300">
      {item.image_url && (
        <div className="aspect-[4/3] overflow-hidden bg-zinc-800/50">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-medium text-sm leading-tight">{item.name}</h3>
          <span className="text-emerald-400 font-semibold text-lg whitespace-nowrap">${item.price}</span>
        </div>
        <Badge className={`${categoryColors[item.category]} border text-[10px] mb-3`}>
          {categoryLabels[item.category]}
        </Badge>
        {item.description && (
          <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          {item.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10"}`} />
              ))}
            </div>
          )}
          {item.affiliate_url && (
            <a href={item.affiliate_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 text-xs hover:text-emerald-300 transition-colors">
              Shop <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}