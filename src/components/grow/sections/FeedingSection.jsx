import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FeedingPlanner from "../FeedingPlanner";

export default function FeedingSection({ strainId }) {
  const queryClient = useQueryClient();

  const { data: feedingPlans = [] } = useQuery({
    queryKey: ["feedingPlans", strainId],
    queryFn: () => base44.entities.FeedingPlan.filter({ strain_id: strainId }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeedingPlan.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeedingPlan.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeedingPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedingPlans", strainId] }),
  });

  return (
    <FeedingPlanner
      strainId={strainId}
      plans={feedingPlans}
      onCreatePlan={(data) => createMutation.mutate(data)}
      onUpdatePlan={({ id, data }) => updateMutation.mutate({ id, data })}
      onDeletePlan={(id) => deleteMutation.mutate(id)}
    />
  );
}