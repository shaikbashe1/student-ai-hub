import React from "react";
import { HelpCircle } from "lucide-react";

interface AdSlotProps {
  slotId?: string;
  className?: string;
}

export default function AdSlot({ slotId = "default-slot", className = "" }: AdSlotProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shrink-0 transition-all duration-300 hover:border-slate-800 ${className}`}
      id={`ad-slot-${slotId}`}
    >
      {/* Background ambient aesthetic light */}
      <div className="absolute top-0 right-0 h-20 w-20 bg-indigo-500/5 rounded-full blur-xl" />
      
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[10px]">
        <span className="font-mono text-slate-500 tracking-wider uppercase font-semibold">Curated Sponsor Listing</span>
        <div className="flex items-center space-x-1 text-slate-400 group cursor-help">
          <span>AdSense Enabled</span>
          <HelpCircle className="h-3 w-3" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 py-1.5 justify-between">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-1.5 justify-center md:justify-start">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded">
              AWS Training Promo
            </span>
            <span className="text-[9px] text-slate-500 font-medium">AWS Free Tier</span>
          </div>
          <h4 className="font-display font-bold text-xs text-slate-200">
            Build your first AI server in under 10 minutes on EC2
          </h4>
          <p className="text-[10px] text-slate-400 max-w-[400px]">
            Get $300 in AWS Educational Sandbox Credits to host custom Node/Python LLM endpoints using promo code "AWSSTUDENT2026"
          </p>
        </div>

        <a 
          href="https://aws.amazon.com/free/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded-xl bg-gradient-to-tr from-amber-500/10 to-orange-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 shrink-0 hover:bg-amber-500/10 active:scale-95 transition"
        >
          Claim $300 Coupon
        </a>
      </div>
    </div>
  );
}
