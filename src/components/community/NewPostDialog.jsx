import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../MobileSelect";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Image, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewPostDialog({ open, onClose, onSubmit, user }) {
  const [form, setForm] = useState({ title: "", content: "", category: "question", tags: "", strain_name: "", skill_level: "all", is_anonymous: false });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const galleryRef = useRef();
  const cameraRef = useRef();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos(prev => [...prev, file_url]);
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    const tagArr = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    onSubmit({
      ...form,
      tags: tagArr,
      photos,
      author_email: form.is_anonymous ? "" : user?.email,
      author_name: form.is_anonymous ? "Anonymous Grower" : user?.full_name,
    });
    setForm({ title: "", content: "", category: "question", tags: "", strain_name: "", skill_level: "all", is_anonymous: false });
    setPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-light text-xl">Create Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white/50 text-xs">Category</Label>
            <MobileSelect
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
              options={[
                { value: "question", label: "❓ Question" },
                { value: "tip", label: "💡 Tip" },
                { value: "guide", label: "📖 Guide / Tutorial" },
                { value: "journal", label: "📔 Grow Journal Update" },
                { value: "review", label: "⭐ Strain Review" },
              ]}
              placeholder="Select category"
              label="Category"
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label className="text-white/50 text-xs">Skill Level</Label>
            <MobileSelect
              value={form.skill_level}
              onValueChange={(v) => setForm({ ...form, skill_level: v })}
              options={[
                { value: "all", label: "All Levels" },
                { value: "novice", label: "🌱 Novice" },
                { value: "basic", label: "🌿 Basic" },
                { value: "advanced", label: "🔥 Advanced" },
              ]}
              placeholder="Select level"
              label="Skill Level"
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label className="text-white/50 text-xs">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <Label className="text-white/50 text-xs">Content *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none"
              rows={4}
              placeholder="Share your knowledge, experience, or question..."
              required
            />
          </div>

          <div>
            <Label className="text-white/50 text-xs">Strain Name (optional)</Label>
            <Input
              value={form.strain_name}
              onChange={(e) => setForm({ ...form, strain_name: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
              placeholder="e.g. Gorilla Glue #4"
            />
          </div>

          <div>
            <Label className="text-white/50 text-xs">Tags (comma separated)</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="bg-white/5 border-white/10 text-white mt-1"
              placeholder="nutrients, deficiency, tips"
            />
          </div>

          {/* Photos */}
          <div>
            <Label className="text-white/50 text-xs">Photos</Label>
            <div className="flex gap-2 mt-1">
              <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => galleryRef.current?.click()} disabled={uploading}>
                <Image className="w-3 h-3 mr-2" /> Gallery
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => cameraRef.current?.click()} disabled={uploading}>
                <Camera className="w-3 h-3 mr-2" /> Camera
              </Button>
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-white/40 self-center" />}
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div>
              <p className="text-white text-sm">Post Anonymously</p>
              <p className="text-white/40 text-xs">Your name won't be displayed</p>
            </div>
            <Switch
              checked={form.is_anonymous}
              onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            Post
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}