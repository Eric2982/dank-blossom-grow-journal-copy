import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestTracker from "../HarvestTracker";

export default function HarvestSection({ strainId }) {
  const queryClient = useQueryClient();

  const { data: harvests = [] } = useQuery({
    queryKey: ["harvests", strainId],
    queryFn: () => base44.entities.Harvest.filter({ strain_id: strainId }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Harvest.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Harvest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Harvest.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["harvests", strainId] }),
  });

  return (
    <HarvestTracker
      strainId={strainId}
      harvests={harvests}
      onCreateHarvest={(data) => createMutation.mutate(data)}
      onUpdateHarvest={({ id, data }) => updateMutation.mutate({ id, data })}
      onDeleteHarvest={(id) => deleteMutation.mutate(id)}
    />
  );
}