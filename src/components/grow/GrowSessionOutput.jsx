import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, StopCircle, PlayCircle, Copy, Check } from "lucide-react";
import { useGrowSession, getElapsedMs } from "@/hooks/useGrowSession";

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours > 0 ? String(hours).padStart(2, "0") : null,
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");
}

/**
 * GrowSessionOutput — displays the active grow session status and session ID,
 * and renders a read-only output form with current session data.
 */
export default function GrowSessionOutput({ strainId = null, strainName = null }) {
  const { session, isActive, startSession, endSession, readOutput } = useGrowSession();
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState(null);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(getElapsedMs(session.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, session]);

  useEffect(() => {
    if (session?.notes) setNotes(session.notes);
  }, [session?.id]);

  const handleStart = () => {
    startSession(strainId, notes);
    setNotes("");
    setOutput(null);
  };

  const handleStop = () => {
    const snap = readOutput();
    setOutput(snap);
    endSession();
  };

  const handleCopy = () => {
    if (!session?.id) return;
    navigator.clipboard.writeText(session.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-white text-sm font-medium">Grow Session</span>
        </div>
        {isActive ? (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 border text-[10px] gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Active
          </Badge>
        ) : (
          <Badge className="bg-white/5 text-white/40 border-white/10 border text-[10px]">
            Idle
          </Badge>
        )}
      </div>

      {isActive && session ? (
        <div className="space-y-3">
          <div>
            <Label className="text-white/50 text-xs">Session ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono truncate">
                {session.id}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 text-white/40 hover:text-white shrink-0"
                title="Copy session ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-white/40 mb-0.5">Started</p>
              <p className="text-white/70">{new Date(session.startedAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-white/40 mb-0.5">Elapsed</p>
              <p className="text-white/70 font-mono">{formatElapsed(elapsed)}</p>
            </div>
            {strainName && (
              <div className="col-span-2">
                <p className="text-white/40 mb-0.5">Strain</p>
                <p className="text-white/70">{strainName}</p>
              </div>
            )}
            {session.notes && (
              <div className="col-span-2">
                <p className="text-white/40 mb-0.5">Notes</p>
                <p className="text-white/60 leading-relaxed">{session.notes}</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleStop}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
          >
            <StopCircle className="w-4 h-4" /> End Session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {output && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 space-y-2 text-xs">
              <p className="text-white/40 uppercase tracking-wide text-[10px] font-medium">Last Session Output</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-white/30">Session ID</p>
                  <p className="text-white/60 font-mono truncate">{output.sessionId}</p>
                </div>
                <div>
                  <p className="text-white/30">Duration</p>
                  <p className="text-white/60 font-mono">{formatElapsed(output.elapsedMs)}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-white/50 text-xs">Session Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 resize-none text-sm"
              rows={2}
              placeholder="Describe this grow session..."
            />
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          >
            <PlayCircle className="w-4 h-4" /> Start Session
          </Button>
        </div>
      )}
    </div>
  );
}