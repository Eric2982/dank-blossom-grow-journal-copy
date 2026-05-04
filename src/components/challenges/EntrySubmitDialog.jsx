import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MobileSelect from "../MobileSelect";

export default function EntrySubmitDialog({ challenge, open, onClose }) {
  const [selectedStrain, setSelectedStrain] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["challenges", "user"],
    queryFn: () => base44.auth.me(),
    staleTime: 300_000,
  });

  const { data: strains = [] } = useQuery({
    queryKey: ["challenges", "strains"],
    queryFn: () => base44.entities.Strain.list("-created_date"),
    staleTime: 60_000,
  });

  const submitEntryMutation = useMutation({
    mutationFn: (entryData) => base44.entities.ChallengeEntry.create(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges", "myEntries"] });
      toast.success("Entry submitted successfully! Good luck! 🍀");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to submit entry: " + error.message);
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      setPhotos([...photos, ...urls]);
      toast.success("Photos uploaded");
    } catch (error) {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedStrain) {
      toast.error("Please select a strain");
      return;
    }

    const strain = strains.find(s => s.id === selectedStrain);
    if (!strain) return;

    submitEntryMutation.mutate({
      challenge_id: challenge.id,
      strain_id: strain.id,
      strain_name: strain.name,
      user_email: user.email,
      user_name: user.full_name,
      photos: photos,
      description: description,
      metrics: metrics,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Enter Challenge</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Select Strain */}
          <div>
            <Label className="text-white/80">Select Strain *</Label>
            <MobileSelect
              value={selectedStrain}
              onValueChange={setSelectedStrain}
              placeholder="Choose a strain"
              label="Select Strain"
              options={strains.map(s => ({ value: s.id, label: s.name }))}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-white/80">Entry Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your grow, techniques used, challenges overcome..."
              className="bg-white/5 border-white/10 text-white mt-2"
              rows={4}
            />
          </div>

          {/* Metrics (optional) */}
          <div>
            <Label className="text-white/80">Metrics (Optional)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Input
                type="number"
                placeholder="Yield (g)"
                value={metrics.yield || ""}
                onChange={(e) => setMetrics({...metrics, yield: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                type="number"
                placeholder="Days to harvest"
                value={metrics.days || ""}
                onChange={(e) => setMetrics({...metrics, days: e.target.value})}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <Label className="text-white/80">Photos *</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              
              {photos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white/40 mb-1" />
                      <span className="text-xs text-white/40">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
            <p className="text-xs text-white/40 mt-2">Add up to 6 photos of your entry</p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedStrain || photos.length === 0 || submitEntryMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            >
              {submitEntryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Entry"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}