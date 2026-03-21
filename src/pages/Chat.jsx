import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Users, Send, Loader2, Flag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import MobileSelect from "../components/MobileSelect";

export default function Chat() {
  const [aiMessage, setAiMessage] = useState("");
  const [communityMessage, setCommunityMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const aiEndRef = useRef(null);
  const communityEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat", selectedRoom],
    queryFn: () => base44.entities.ChatMessage.filter({ room: selectedRoom }, "-created_date", 100),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.room === selectedRoom) {
        queryClient.invalidateQueries({ queryKey: ["chat", selectedRoom] });
      }
    });
    return unsubscribe;
  }, [selectedRoom, queryClient]);

  const sendCommunityMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ["chat", selectedRoom] });
      const prev = queryClient.getQueryData(["chat", selectedRoom]);
      queryClient.setQueryData(["chat", selectedRoom], (old = []) => [{ ...newMsg, id: `optimistic-${Date.now()}`, created_date: new Date().toISOString() }, ...old]);
      setCommunityMessage("");
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) queryClient.setQueryData(["chat", selectedRoom], ctx.prev); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["chat", selectedRoom] }); },
  });

  const reportMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentReport.create(data),
    onSuccess: () => {
      toast.success("Report submitted successfully");
      setReportDialogOpen(false); setReportingMessage(null); setReportReason("spam"); setReportDetails("");
    },
    onError: () => toast.error("Failed to submit report"),
  });

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    const userMsg = aiMessage;
    setAiConversation(prev => [...prev, { role: "user", content: userMsg }]);
    setAiMessage("");
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful cannabis growing assistant. Answer this question: ${userMsg}`,
        add_context_from_internet: true,
      });
      setAiConversation(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setAiConversation(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCommunitySubmit = (e) => {
    e.preventDefault();
    if (!communityMessage.trim() || !user) return;
    sendCommunityMutation.mutate({ message: communityMessage, user_email: user.email, user_name: user.full_name || user.email, room: selectedRoom });
  };

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiConversation]);
  useEffect(() => { communityEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const rooms = [{ id: "general", label: "General" }, { id: "nutrients", label: "Nutrients" }, { id: "problems", label: "Problems" }, { id: "harvest", label: "Harvest" }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-white">Chat</h1>
        <p className="text-white/40 text-sm mt-1">Get AI advice or chat with the community</p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="ai" className="data-[state=active]:bg-emerald-600"><Bot className="w-4 h-4 mr-2" /> AI Assistant</TabsTrigger>
          <TabsTrigger value="community" className="data-[state=active]:bg-emerald-600"><Users className="w-4 h-4 mr-2" /> Community</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiConversation.length === 0 && (
                <div className="text-center text-white/30 mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                  <p>Ask me anything about growing cannabis!</p>
                </div>
              )}
              {aiConversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-white/5 text-white border border-white/10"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {aiLoading && <div className="flex justify-start"><div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10"><Loader2 className="w-4 h-4 animate-spin text-emerald-400" /></div></div>}
              <div ref={aiEndRef} />
            </div>
            <form onSubmit={handleAiSubmit} className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <Input value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} placeholder="Ask about nutrients, lighting, problems..." className="bg-white/5 border-white/10 text-white" disabled={aiLoading} />
                <Button type="submit" disabled={aiLoading} className="bg-emerald-600 hover:bg-emerald-500"><Send className="w-4 h-4" /></Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="community" className="mt-4">
          <div className="mb-4 flex gap-2 flex-wrap">
            {rooms.map(room => (
              <Button key={room.id} onClick={() => setSelectedRoom(room.id)} variant={selectedRoom === room.id ? "default" : "outline"} size="sm"
                className={selectedRoom === room.id ? "bg-emerald-600" : "border-white/10 text-white hover:bg-white/5"}>{room.label}</Button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && <div className="text-center text-white/30 mt-20"><Users className="w-12 h-12 mx-auto mb-4 text-emerald-400" /><p>No messages yet. Start the conversation!</p></div>}
              {messages.slice().reverse().map((msg) => (
                <div key={msg.id} className="bg-white/5 rounded-xl p-3 border border-white/10 group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 text-sm font-medium">{msg.user_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs">{format(new Date(msg.created_date), "MMM d, h:mm a")}</span>
                      <Button variant="ghost" size="sm" onClick={() => { setReportingMessage(msg); setReportDialogOpen(true); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400">
                        <Flag className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-white text-sm">{msg.message}</p>
                </div>
              ))}
              <div ref={communityEndRef} />
            </div>
            <form onSubmit={handleCommunitySubmit} className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <Input value={communityMessage} onChange={(e) => setCommunityMessage(e.target.value)} placeholder="Type your message..." className="bg-white/5 border-white/10 text-white" />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500"><Send className="w-4 h-4" /></Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Report Content</DialogTitle>
            <DialogDescription className="text-white/60">Help us keep the community safe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/70 text-sm">Reason *</Label>
              <MobileSelect value={reportReason} onValueChange={setReportReason}
                options={[{ value: "spam", label: "Spam" }, { value: "illegal_activity", label: "Illegal Activity" }, { value: "nudity", label: "Nudity" }, { value: "harassment", label: "Harassment" }, { value: "violence", label: "Violence" }, { value: "hate_speech", label: "Hate Speech" }, { value: "other", label: "Other" }]}
                placeholder="Select reason" label="Report Reason" className="mt-1 w-full" />
            </div>
            <div>
              <Label className="text-white/70 text-sm">Details (optional)</Label>
              <Textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} className="mt-1 bg-white/5 border-white/10 text-white resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={() => reportMutation.mutate({ message_id: reportingMessage?.id, message_content: reportingMessage?.message, message_author: reportingMessage?.user_name, reason: reportReason, details: reportDetails || undefined, room: selectedRoom })}
              disabled={reportMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}