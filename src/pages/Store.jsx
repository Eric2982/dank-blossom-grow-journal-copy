import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Search, Loader2 } from "lucide-react";
import StoreCard from "../components/grow/StoreCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PullToRefresh from "../components/PullToRefresh";

const categories = [
  { value: "all", label: "All" }, { value: "lighting", label: "Lighting" }, { value: "nutrients", label: "Nutrients" },
  { value: "climate_control", label: "Climate" }, { value: "monitoring", label: "Monitoring" },
  { value: "tents_rooms", label: "Tents" }, { value: "growing_media", label: "Media" },
  { value: "irrigation", label: "Irrigation" }, { value: "accessories", label: "Accessories" },
];

export default function Store() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({ queryKey: ["store"], queryFn: () => base44.entities.StoreItem.list("-created_date", 100) });
  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  const handleSearchExternal = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for "${searchQuery}" grow equipment and return a list of 5 products with prices from online retailers. Include name, retailer, price, and link.`,
        add_context_from_internet: true,
        response_json_schema: { type: "object", properties: { products: { type: "array", items: { type: "object", properties: { name: { type: "string" }, retailer: { type: "string" }, price: { type: "string" }, link: { type: "string" } } } } } }
      });
      setSearchResults(result.products || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <PullToRefresh onRefresh={() => queryClient.invalidateQueries({ queryKey: ["store"] })}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-light text-white">Grow Shop</h1>
          <p className="text-white/30 text-sm mt-1">Recommended equipment & supplies</p>
        </div>

        <form onSubmit={handleSearchExternal} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex gap-2">
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products and compare prices..." className="bg-white/5 border-white/10 text-white" />
            <Button type="submit" disabled={searching} className="bg-emerald-600 hover:bg-emerald-500">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </form>

        {searchResults && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-white font-medium mb-4">Price Comparison</h3>
            {searchResults.length === 0 ? <p className="text-white/30 text-sm">No results found</p> : (
              <div className="space-y-3">
                {searchResults.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div><div className="text-white text-sm">{product.name}</div><div className="text-white/40 text-xs">{product.retailer}</div></div>
                    <div className="flex items-center gap-3">
                      <div className="text-emerald-400 font-medium">{product.price}</div>
                      <a href={product.link} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs">View</Button></a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-white font-medium mb-4">Our Store</h3>
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="bg-white/5 border border-white/5 flex-wrap h-auto gap-1 p-1">
              {categories.map(c => <TabsTrigger key={c.value} value={c.value} className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-white/40">{c.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-16 text-center mt-6">
              <ShoppingBag className="w-10 h-10 text-white/10 mx-auto mb-4" /><p className="text-white/30 text-sm">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
              {filtered.map(item => <StoreCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}