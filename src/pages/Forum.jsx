import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ThumbsUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_COLORS = {
  question: "bg-blue-100 text-blue-800",
  tip: "bg-green-100 text-green-800",
  guide: "bg-purple-100 text-purple-800",
  journal: "bg-yellow-100 text-yellow-800",
  review: "bg-orange-100 text-orange-800",
};

const emptyForm = () => ({
  title: "", content: "", category: "question", tags: "",
  is_anonymous: false, author_name: "", author_email: "",
  strain_name: "", skill_level: "", photos: "",
});

export default function Forum() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: () => base44.entities.ForumPost.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["forum-posts"]); setDialogOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ForumPost.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["forum-posts"]); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ForumPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["forum-posts"]),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (post) => {
    setEditing(post);
    setForm({
      ...post,
      tags: (post.tags || []).join(", "),
      photos: (post.photos || []).join(", "),
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      photos: form.photos ? form.photos.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate({
        ...data,
        author_email: user?.email || "",
        author_name: user?.full_name || user?.email || "",
        vote_count: 0,
        reply_count: 0,
        is_answered: false,
      });
    }
  };

  const canEdit = (post) => user && (user.email === post.author_email || user.role === "admin");
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const filtered = categoryFilter === "all" ? posts : posts.filter(p => p.category === categoryFilter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Forum</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Post</Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", "question", "tip", "guide", "journal", "review"].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={CATEGORY_COLORS[post.category]}>{post.category}</Badge>
                      {post.is_answered && <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Answered</Badge>}
                      {post.skill_level && <Badge variant="outline">{post.skill_level}</Badge>}
                    </div>
                    <h3 className="font-semibold text-base leading-tight">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.is_anonymous ? "Anonymous" : post.author_name || post.author_email}
                      {post.created_date && ` · ${format(new Date(post.created_date), "MMM d, yyyy")}`}
                      {post.strain_name && ` · 🌿 ${post.strain_name}`}
                    </p>
                  </div>
                  {canEdit(post) && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                {post.photos?.[0] && (
                  <img src={post.photos[0]} alt="" className="rounded-md h-40 object-cover w-full" />
                )}
                {post.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>)}
                  </div>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.vote_count ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.reply_count ?? 0} replies</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} /></div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["question", "tip", "guide", "journal", "review"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Content *</Label><Textarea className="min-h-[120px]" value={form.content} onChange={e => set("content", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Skill Level</Label>
                <Select value={form.skill_level || ""} onValueChange={v => set("skill_level", v)}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["novice", "basic", "advanced", "all"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Strain Name</Label><Input value={form.strain_name} onChange={e => set("strain_name", e.target.value)} /></div>
            </div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => set("tags", e.target.value)} /></div>
            <div><Label>Photo URLs (comma-separated)</Label><Input value={form.photos} onChange={e => set("photos", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? "Save" : "Post"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}