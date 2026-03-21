import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send } from "lucide-react";
import { format } from "date-fns";

const ROOMS = ["general", "nutrients", "problems", "harvest"];

export default function Chat() {
  const queryClient = useQueryClient();
  const [room, setRoom] = useState("general");
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", room],
    queryFn: () => base44.entities.ChatMessage.filter({ room }, "created_date", 100),
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["chat-messages", room]); setText(""); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatMessage.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["chat-messages", room]),
  });

  const handleSend = () => {
    if (!text.trim() || !user) return;
    sendMutation.mutate({
      message: text.trim(),
      user_email: user.email,
      user_name: user.full_name || user.email,
      room,
    });
  };

  const canDelete = (msg) => user && (user.email === msg.user_email || user.role === "admin");

  return (
    <div className="flex h-screen flex-col max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      {/* Room tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {ROOMS.map(r => (
          <button
            key={r}
            onClick={() => setRoom(r)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
              room === r
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            #{r}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 border rounded-lg p-4 bg-muted/20">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-10">No messages yet. Say hi!</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
              {msg.user_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{msg.user_name}</span>
                <span className="text-xs text-muted-foreground">
                  {msg.created_date ? format(new Date(msg.created_date), "MMM d, HH:mm") : ""}
                </span>
              </div>
              <p className="text-sm break-words">{msg.message}</p>
            </div>
            {canDelete(msg) && (
              <Button
                variant="ghost" size="icon"
                className="opacity-0 group-hover:opacity-100 shrink-0 h-7 w-7"
                onClick={() => deleteMutation.mutate(msg.id)}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Message #${room}...`}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          disabled={!user}
        />
        <Button onClick={handleSend} disabled={!text.trim() || !user}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {!user && <p className="text-xs text-muted-foreground mt-2">Please log in to send messages.</p>}
    </div>
  );
}