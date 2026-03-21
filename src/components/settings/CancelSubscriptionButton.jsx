import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CancelSubscriptionButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => base44.functions.invoke("cancelSubscription", {}),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription canceled. You'll retain access until the end of your billing period.");
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to cancel subscription: " + error.message);
    },
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirmDialog(true)}
        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <XCircle className="w-3.5 h-3.5 mr-2" />
        Cancel Subscription
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Cancel Premium Subscription?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to cancel your Premium subscription? You'll lose access to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Advanced analytics and insights</li>
                <li>Priority support</li>
                <li>Unlimited strains and photos</li>
                <li>Challenge badges and rewards</li>
              </ul>
              <p className="mt-4 text-white/80">
                Your subscription will remain active until the end of your current billing period.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Keep Premium
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}