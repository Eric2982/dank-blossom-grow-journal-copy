import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const categoryConfig = {
  question: { label: "Question", color: "bg-blue-500/20 text-blue-400", icon: "❓" },
  tip: { label: "Tip", color: "bg-yellow-500/20 text-yellow-400", icon: "💡" },
  guide: { label: "Guide", color: "bg-purple-500/20 text-purple-400", icon: "📖" },
  journal: { label: "Journal", color: "bg-emerald-500/20 text-emerald-400", icon: "📔" },
  review: { label: "Review", color: "bg-pink-500/20 text-pink-400", icon: "⭐" },
};

const levelConfig = {
  novice: { label: "Novice", color: "bg-green-500/20 text-green-400" },
  basic: { label: "Basic", color: "bg-blue-500/20 text-blue-400" },
  advanced: { label: "Advanced", color: "bg-red-500/20 text-red-400" },
  all: { label: "All Levels", color: "bg-white/10 text-white/60" },
};

export default function ForumPostCard({ post, currentUserEmail }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const cat = categoryConfig[post.category] || categoryConfig.tip;
  const level = levelConfig[post.skill_level] || levelConfig.all;

  const voteMutation = useMutation({
    mutationFn: () => base44.entities.ForumPost.update(post.id, { vote_count: (post.vote_count || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forumPosts"] }),
  });

  const isLongContent = post.content?.length > 300;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-3">
        {/* Vote */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => voteMutation.mutate()}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </Button>
          <span className="text-white/60 text-xs font-medium">{post.vote_count || 0}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={`${cat.color} border-0 text-[10px]`}>{cat.icon} {cat.label}</Badge>
            <Badge className={`${level.color} border-0 text-[10px]`}>{level.label}</Badge>
            {post.is_answered && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                <CheckCircle className="w-2.5 h-2.5 mr-1" /> Answered
              </Badge>
            )}
            {post.strain_name && (
              <span className="text-white/40 text-xs">🌿 {post.strain_name}</span>
            )}
          </div>

          <h3 className="text-white font-medium text-sm mb-1 leading-snug">{post.title}</h3>
          
          <p className={`text-white/60 text-xs leading-relaxed ${!expanded && isLongContent ? 'line-clamp-3' : ''}`}>
            {post.content}
          </p>

          {isLongContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-emerald-400 text-xs mt-1 flex items-center gap-1 hover:text-emerald-300"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
            </button>
          )}

          {/* Photos */}
          {post.photos?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.photos.map((p, i) => (
                <img key={i} src={p} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-white/30 text-[10px] bg-white/5 rounded px-1.5 py-0.5">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 text-white/30 text-xs">
            <span>{post.is_anonymous ? "Anonymous Grower" : (post.author_name || "Grower")}</span>
            <span>•</span>
            <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1 ml-auto">
              <MessageCircle className="w-3 h-3" /> {post.reply_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}