import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, ArrowLeft, Trash2, Sprout, Flower, X, Bell, BellOff, Camera, Image } from "lucide-react";
import { createPageUrl } from "../components/utils";
import { useNavigation } from "@/lib/NavigationContext";
import { differenceInDays, format } from "date-fns";
import StrainForm from "../components/grow/StrainForm";
import StrainAnalytics from "../components/grow/StrainAnalytics";
import GrowProgressTracker from "../components/grow/GrowProgressTracker";
import ExportPDFButton from "../components/grow/ExportPDFButton";
import PullToRefresh from "../components/PullToRefresh";

// Independent section components — each fetches its own data
import GrowLogSection from "../components/grow/sections/GrowLogSection";
import NutrientsSection from "../components/grow/sections/NutrientsSection";
import WateringSection from "../components/grow/sections/WateringSection";
import FeedingSection from "../components/grow/sections/FeedingSection";
import HarvestSection from "../components/grow/sections/HarvestSection";
import GrowAdvisor from "../components/grow/GrowAdvisor";

export default function StrainDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const strainId = urlParams.get("id");
  const { goBack, canGoBack } = useNavigation();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    "Notification" in window && Notification.permission === "granted"
  );
  const galleryInputRef = useRef();
  const cameraInputRef = useRef();
  const queryClient = useQueryClient();

  const { data: strain } = useQuery({
    queryKey: ["strain", strainId],
    queryFn: async () => { const s = await base44.entities.Strain.filter({ id: strainId }); return s[0]; },
  });

  // Only fetch readings for analytics — GrowLogSection fetches its own copy
  const { data: readings = [] } = useQuery({
    queryKey: ["readings", strainId],
    queryFn: () => base44.entities.GrowReading.filter({ strain_id: strainId }, "-created_date", 100),
  });

  const updateStrainMutation = useMutation({
    mutationFn: (data) => base44.entities.Strain.update(strainId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["strain", strainId] }); setShowEditForm(false); },
  });

  const deleteStrainMutation = useMutation({
    mutationFn: () => base44.entities.Strain.delete(strainId),
    onSuccess: () => { window.location.href = createPageUrl("Dashboard"); },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Strain.update(strainId, { photos: [...(strain.photos || []), file_url] });
      queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
    } catch { alert("Failed to upload photo"); } finally { setUploading(false); e.target.value = ""; }
  };

  const handleDeletePhoto = async (photoUrl) => {
    await base44.entities.Strain.update(strainId, { photos: (strain.photos || []).filter(p => p !== photoUrl) });
    queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
  };

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) { alert("Notifications not supported"); return; }
    if (Notification.permission === "granted") { setNotificationsEnabled(v => !v); }
    else if (Notification.permission !== "denied") { const p = await Notification.requestPermission(); setNotificationsEnabled(p === "granted"); }
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["strain", strainId] });
    await queryClient.invalidateQueries({ queryKey: ["readings", strainId] });
  };

  if (!strain) return <div className="text-white/50 p-8">Loading...</div>;

  const vegDays = strain.planted_date && strain.flipped_to_flower_date
    ? differenceInDays(new Date(strain.flipped_to_flower_date), new Date(strain.planted_date))
    : strain.planted_date && !strain.flipped_to_flower_date && strain.status === "active"
      ? differenceInDays(new Date(), new Date(strain.planted_date))
      : null;
  const flowerDays = strain.flipped_to_flower_date && strain.status === "active"
    ? differenceInDays(new Date(), new Date(strain.flipped_to_flower_date))
    : null;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => canGoBack() ? goBack() : window.history.back()} aria-label="Go back"
              className="text-white/40 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-white">{strain.name}</h1>
              <p className="text-white/40 text-sm">{strain.breeder}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleToggleNotifications} variant="outline" size="sm" className={`border-white/10 ${notificationsEnabled ? "text-emerald-400" : "text-white"} hover:bg-white/5`}>
              {notificationsEnabled ? <Bell className="w-3 h-3 mr-2" /> : <BellOff className="w-3 h-3 mr-2" />} Alerts
            </Button>
            <Button onClick={() => setShowEditForm(true)} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              <Edit className="w-3 h-3 mr-2" /> Edit
            </Button>
            <ExportPDFButton strain={strain} readings={readings} />
            <Button onClick={() => setShowDeleteDialog(true)} variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-3 h-3 mr-2" /> Delete
            </Button>          </div>
        </div>

        {/* Photos */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Photos</h3>
            <div className="flex gap-2">
              <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
                <Image className="w-3 h-3 mr-2" /> Gallery
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                <Camera className="w-3 h-3 mr-2" /> Camera
              </Button>
            </div>
          </div>
          {(strain.photos?.length ?? 0) === 0 ? (
            <p className="text-white/20 text-sm text-center py-4">No photos yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strain.photos.map((photo, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square">
                  <img src={photo} alt={`${strain.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => handleDeletePhoto(photo)} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {vegDays !== null && (
              <div>
                <div className="flex items-center gap-2 text-white/40 text-xs mb-1"><Sprout className="w-3 h-3 text-green-400" /><span>Vegetative</span></div>
                <div className="text-2xl font-light text-white">{vegDays} days</div>
              </div>
            )}
            {flowerDays !== null && (
              <div>
                <div className="flex items-center gap-2 text-white/40 text-xs mb-1"><Flower className="w-3 h-3 text-pink-400" /><span>Flowering</span></div>
                <div className="text-2xl font-light text-white">{flowerDays} days</div>
              </div>
            )}
            {strain.planted_date && (
              <div>
                <div className="text-white/40 text-xs mb-1">Planted</div>
                <div className="text-sm text-white">{format(new Date(strain.planted_date), "MMM d, yyyy")}</div>
              </div>
            )}
            {strain.flipped_to_flower_date && (
              <div>
                <div className="text-white/40 text-xs mb-1">Flipped</div>
                <div className="text-sm text-white">{format(new Date(strain.flipped_to_flower_date), "MMM d, yyyy")}</div>
              </div>
            )}
          </div>
        </div>

        {/* Grow Progress Tracker */}
        <GrowProgressTracker strain={strain} />

        {/* Analytics — uses shared readings query (already cached) */}
        <StrainAnalytics readings={readings} strain={strain} />

        {/* AI Grow Advisor */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <GrowAdvisor strainId={strainId} strainName={strain.name} />
        </div>

        {/* Independent Sections */}
        <GrowLogSection strainId={strainId} />
        <NutrientsSection strainId={strainId} />
        <WateringSection strainId={strainId} strainName={strain.name} />
        <FeedingSection strainId={strainId} />
        <HarvestSection strainId={strainId} />

        <StrainForm open={showEditForm} onOpenChange={setShowEditForm} strain={strain} onSubmit={(data) => updateStrainMutation.mutate(data)} />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-zinc-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete {strain.name}?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                This will permanently delete this strain and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteStrainMutation.mutate()} disabled={deleteStrainMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                {deleteStrainMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}