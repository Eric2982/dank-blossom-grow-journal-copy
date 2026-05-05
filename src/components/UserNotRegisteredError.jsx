import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-6">
      <div className="max-w-md w-full p-8 bg-white/[0.03] rounded-2xl border border-white/10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-500/10">
          <ShieldAlert className="w-8 h-8 text-orange-400" />
        </div>
        <h1 className="text-2xl font-light text-white mb-3">Access Restricted</h1>
        <p className="text-white/50 text-sm mb-6">
          You are not registered to use this application. Please contact the app administrator to request access.
        </p>
        <div className="p-4 bg-white/5 rounded-lg text-sm text-white/40 text-left mb-6">
          <p className="text-white/60 mb-2">If you believe this is an error:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verify you are logged in with the correct account</li>
            <li>Contact support@dankblossom.app for access</li>
            <li>Try logging out and signing in again</li>
          </ul>
        </div>
        <Button
          onClick={() => base44.auth.logout()}
          variant="outline"
          className="border-white/20 text-white/70 hover:bg-white/10 gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;