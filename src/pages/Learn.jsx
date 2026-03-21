import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import LearnSection from "../components/grow/LearnSection";
import PullToRefresh from "../components/PullToRefresh";

export default function Learn() {
  const queryClient = useQueryClient();
  return (
    <PullToRefresh onRefresh={() => queryClient.invalidateQueries()}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-light text-white">Grow Knowledge Base</h1>
          <p className="text-white/30 text-sm mt-1">Deficiencies, environmental guides & best practices</p>
        </div>
        <LearnSection />
      </div>
    </PullToRefresh>
  );
}