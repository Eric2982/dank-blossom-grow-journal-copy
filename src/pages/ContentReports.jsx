import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Flag } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
};

const REASON_LABELS = {
  illegal_activity: "Illegal Activity",
  nudity: "Nudity",
  harassment: "Harassment",
  spam: "Spam",
  violence: "Violence",
  hate_speech: "Hate Speech",
  other: "Other",
};

export default function ContentReports() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["content-reports"],
    queryFn: () => base44.entities.ContentReport.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContentReport.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(["content-reports"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentReport.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["content-reports"]),
  });

  const filtered = statusFilter === "all" ? reports : reports.filter(r => r.status === statusFilter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flag className="w-6 h-6 text-destructive" />
          <h1 className="text-3xl font-bold">Content Reports</h1>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No reports found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_COLORS[report.status]}>{report.status}</Badge>
                      <Badge variant="outline">{REASON_LABELS[report.reason] || report.reason}</Badge>
                      {report.room && <Badge variant="secondary">#{report.room}</Badge>}
                    </div>
                    {report.message_author && (
                      <p className="text-sm text-muted-foreground">By: {report.message_author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={report.status}
                      onValueChange={(val) => updateMutation.mutate({ id: report.id, status: val })}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(report.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="bg-muted rounded p-3 italic text-muted-foreground">
                  "{report.message_content}"
                </div>
                {report.details && <p><span className="font-medium">Details:</span> {report.details}</p>}
                <p className="text-xs text-muted-foreground">
                  Reported {report.created_date ? format(new Date(report.created_date), "MMM d, yyyy HH:mm") : ""} · ID: {report.message_id}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}