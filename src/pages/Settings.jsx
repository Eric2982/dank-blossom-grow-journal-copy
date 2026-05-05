import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Trash2, Crown, Shield, FileText, ChevronDown, Camera, Edit2, Leaf, BookOpen, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import CancelSubscriptionButton from "../components/settings/CancelSubscriptionButton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPageUrl } from "../components/utils";
import PullToRefresh from "../components/PullToRefresh";
import { format } from "date-fns";
import { IntegrityBadge } from "@/components/IntegrityGuard";

export default function Settings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showRegulatory, setShowRegulatory] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });
  const { data: strains = [] } = useQuery({
    queryKey: ["strains"],
    queryFn: () => base44.entities.Strain.list("-created_date"),
  });

  const isPremium = subscription?.[0]?.status === "active";

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["user"] }); setIsEditingProfile(false); toast.success("Profile updated"); },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateProfileMutation.mutateAsync({ profile_picture: file_url });
    } catch { toast.error("Failed to upload photo"); } finally { setUploadingPhoto(false); }
  };

  const getDaysGrowing = (strain) => {
    if (!strain.planted_date) return null;
    return Math.floor((new Date() - new Date(strain.planted_date)) / (1000 * 60 * 60 * 24));
  };

  const activeGrows = strains.filter(s => s.status === "active");
  const completedGrows = strains.filter(s => s.status === "harvested");

  const deleteAccountMutation = useMutation({
    mutationFn: () => base44.functions.invoke('deleteAccount', {}),
    onSuccess: () => {
      toast.success("Account data deleted successfully");
      setTimeout(() => base44.auth.logout(), 1500);
    },
    onError: (error) => toast.error("Failed to delete account: " + error.message),
  });

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() !== "delete") { toast.error("Please type DELETE to confirm"); return; }
    deleteAccountMutation.mutate();
  };

  if (userLoading) return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-light text-white">Profile & Settings</h1><p className="text-white/40 text-sm mt-1">Manage your account</p></div>
      <Card className="bg-white/[0.02] border-white/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-5 bg-white/10 rounded animate-pulse w-40" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-56" />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <PullToRefresh onRefresh={() => Promise.all([queryClient.invalidateQueries({ queryKey: ["user"] }), queryClient.invalidateQueries({ queryKey: ["subscription"] })])}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="text-2xl font-light text-white">Profile & Settings</h1><p className="text-white/40 text-sm mt-1">Manage your account</p></div>

        <Card className="bg-white/[0.02] border-white/5 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                {user.profile_picture ? <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-white" />}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                <Camera className="w-3.5 h-3.5 text-white" />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-medium text-lg">{user.full_name || "User"}</h2>
                {isPremium && <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1"><Crown className="w-3 h-3" /> Premium</Badge>}
              </div>
              <p className="text-white/40 text-sm mb-3">{user.email}</p>
              {isEditingProfile ? (
                <div className="space-y-2">
                  <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about your growing journey..." className="bg-white/5 border-white/10 text-white resize-none" rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateProfileMutation.mutateAsync({ bio: editBio })} className="bg-emerald-600 hover:bg-emerald-500">Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-white/70 text-sm mb-2">{user.bio || "No bio yet."}</p>
                  <Button size="sm" variant="ghost" onClick={() => { setEditBio(user?.bio || ""); setIsEditingProfile(true); }} className="text-white/40 hover:text-white h-8 px-2">
                    <Edit2 className="w-3 h-3 mr-1" /> Edit Bio
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/5">
            <div className="text-center"><div className="text-2xl font-semibold text-emerald-400">{strains.length}</div><div className="text-white/40 text-xs">Total</div></div>
            <div className="text-center"><div className="text-2xl font-semibold text-white">{activeGrows.length}</div><div className="text-white/40 text-xs">Active</div></div>
            <div className="text-center"><div className="text-2xl font-semibold text-white">{completedGrows.length}</div><div className="text-white/40 text-xs">Done</div></div>
            <div className="text-center"><div className="text-2xl font-semibold text-white/60">{user.role}</div><div className="text-white/40 text-xs">Role</div></div>
          </div>
        </Card>

        {activeGrows.length > 0 && (
          <Card className="bg-white/[0.02] border-white/5 p-6 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2"><Leaf className="w-5 h-5 text-emerald-400" /> Active Grows</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGrows.map(strain => (
                <div key={strain.id} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-emerald-900/30 to-green-900/30 relative">
                    {strain.photos?.[0] ? <img src={strain.photos[0]} alt={strain.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Leaf className="w-10 h-10 text-white/10" /></div>}
                  </div>
                  <div className="p-3">
                    <h4 className="text-white font-medium text-sm">{strain.name}</h4>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-white/40">{strain.planted_date ? format(new Date(strain.planted_date), "MMM d, yyyy") : "—"}</span>
                      {getDaysGrowing(strain) && <span className="text-emerald-400">Day {getDaysGrowing(strain)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {isPremium && (
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Premium Subscription</h3>
                <p className="text-white/60 text-sm mb-4">Active until {new Date(subscription[0].current_period_end).toLocaleDateString()}</p>
                <CancelSubscriptionButton />
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl("Learn")}><Card className="bg-white/[0.02] border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer h-full"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><BookOpen className="w-4 h-4 text-blue-400" /></div><div><p className="text-white text-sm font-medium">Learn</p><p className="text-white/40 text-xs">Knowledge base</p></div></div></Card></Link>
          <Link to={createPageUrl("Premium")}><Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4 hover:border-amber-500/30 transition-all cursor-pointer h-full"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><Crown className="w-4 h-4 text-amber-400" /></div><div><p className="text-white text-sm font-medium">Premium</p><p className="text-white/40 text-xs">Unlock all features</p></div></div></Card></Link>
        </div>

        <Card className="bg-white/[0.02] border-white/5 p-6">
          <button onClick={() => setShowAbout(!showAbout)} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div><div><h3 className="text-white font-medium">About Dank Blossom</h3><p className="text-white/40 text-sm">Your cannabis cultivation companion</p></div></div>
            <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showAbout ? 'rotate-180' : ''}`} />
          </button>
          {showAbout && <div className="pt-4 border-t border-white/5 mt-4 text-white/60 text-sm"><p>Dank Blossom is a comprehensive grow journal for cannabis growers of all levels. Track environments, nutrients, watering, harvests, and connect with the community. Happy growing! 🌱</p></div>}
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6">
          <button onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-white/60" /><div><h3 className="text-white font-medium">Privacy Policy</h3><p className="text-white/40 text-sm">How we handle your data</p></div></div>
            <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showPrivacyPolicy ? 'rotate-180' : ''}`} />
          </button>
          {showPrivacyPolicy && <div className="pt-4 border-t border-white/5 text-white/60 text-sm"><p className="text-white/40 text-xs mb-2">Last Updated: February 20, 2026</p><p>We collect account information, cultivation data, and usage data. Your data is encrypted and only accessible through your authenticated account. We do NOT sell your personal data. Contact support@dankblossom.app for questions.</p></div>}
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6">
          <a href="https://doc-hosting.flycricket.io/dank-blossom-grow-journal-terms-of-use/133e87e4-50a4-431c-a96f-2fe3c9cbba63/terms" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
            <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-white/60" /><div><h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">Terms and Conditions</h3><p className="text-white/40 text-sm">Review our terms</p></div></div>
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6">
          <button onClick={() => setShowRegulatory(!showRegulatory)} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-blue-400" /><div><h3 className="text-white font-medium">Regulatory Compliance</h3><p className="text-white/40 text-sm">Legal framework</p></div></div>
            <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showRegulatory ? 'rotate-180' : ''}`} />
          </button>
          {showRegulatory && <div className="pt-4 border-t border-white/5 mt-4 text-white/60 text-sm space-y-3"><p>Dank Blossom is an informational tool only. Users are solely responsible for compliance with all applicable laws. Age verification required (21+).</p><div className="flex items-center gap-2 pt-1"><span className="text-white/30 text-xs">App verification:</span><IntegrityBadge /></div></div>}
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Sign Out</h3>
                <p className="text-white/40 text-sm">Log out of your account</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => base44.auth.logout()} className="border-red-500/20 text-red-400 hover:bg-red-500/10">
              Sign Out
            </Button>
          </div>
        </Card>

        <Card className="bg-red-950/20 border-red-500/20 p-6">
          <button onClick={() => setShowDangerZone(!showDangerZone)} className="w-full flex items-center justify-between text-left">
            <div><h3 className="text-red-400 font-medium mb-1 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h3><p className="text-white/60 text-sm">Permanently delete your account and all data.</p></div>
            <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${showDangerZone ? 'rotate-180' : ''}`} />
          </button>
          {showDangerZone && <div className="pt-4 border-t border-red-500/20 mt-4"><Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="bg-red-600 hover:bg-red-700"><Trash2 className="w-4 h-4 mr-2" /> Delete Account</Button></div>}
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-zinc-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">Type <span className="font-bold text-white">DELETE</span> to confirm:</AlertDialogDescription>
            </AlertDialogHeader>
            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE here"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500" />
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteConfirmText.toLowerCase() !== "delete" || deleteAccountMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}