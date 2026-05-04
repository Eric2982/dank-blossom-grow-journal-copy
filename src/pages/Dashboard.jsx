import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Crown, Sparkles } from "lucide-react";
import StrainCard from "../components/grow/StrainCard";
import StrainForm from "../components/grow/StrainForm";
import PullToRefresh from "../components/PullToRefresh";
import { Link } from "react-router-dom";
import { createPageUrl } from "../components/utils";
import WeatherWidget from "../components/dashboard/WeatherWidget";

export default function Dashboard() {
  const [showStrainForm, setShowStrainForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: strains = [] } = useQuery({
    queryKey: ["strains"],
    queryFn: () => base44.entities.Strain.list("-created_date", 50),
  });

  const { data: latestReadings = [] } = useQuery({
    queryKey: ["latestReadings"],
    queryFn: () => base44.entities.GrowReading.list("-created_date", 1),
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const createStrainMutation = useMutation({
    mutationFn: (data) => base44.entities.Strain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strains"] });
      setShowStrainForm(false);
    },
    onError: (error) => {
      console.error("Failed to create strain:", error);
      alert("Failed to save strain: " + (error?.message || "Unknown error. Are you logged in?"));
    },
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["strains"] }),
      queryClient.invalidateQueries({ queryKey: ["user"] }),
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.email] }),
      queryClient.invalidateQueries({ queryKey: ["latestReadings"] }),
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-light text-white">Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">Manage your grow strains and track progress</p>
            </div>
            {subscription?.[0]?.status === "active" ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
                <Crown className="w-3 h-3" /> Premium
              </Badge>
            ) : (
              <Link to={createPageUrl("Premium")}>
                <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 gap-1 cursor-pointer hover:opacity-90 transition-opacity">
                  <Sparkles className="w-3 h-3" /> Upgrade
                </Badge>
              </Link>
            )}
          </div>
          <Button onClick={() => setShowStrainForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Strain
          </Button>
        </div>

        <WeatherWidget
          indoorTemp={latestReadings[0]?.temperature}
          indoorHumidity={latestReadings[0]?.humidity}
        />

        {strains.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <Leaf className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">No strains yet</h3>
            <p className="text-white/30 text-sm mb-4">Start tracking your grows by adding a strain</p>
            <Button onClick={() => setShowStrainForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Strain
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strains.map(strain => (
              <StrainCard key={strain.id} strain={strain} />
            ))}
          </div>
        )}

        <StrainForm
          open={showStrainForm}
          onOpenChange={setShowStrainForm}
          onSubmit={(data) => createStrainMutation.mutate(data)}
        />
      </div>
    </PullToRefresh>
  );
}