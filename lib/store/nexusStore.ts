import { create } from "zustand";
import { UserRole } from "@/lib/auth/session";
import { EmailTemplateType } from "@/lib/email/resend";

export type DashboardTab =
  | "overview"
  | "schema"
  | "seeder"
  | "middleware"
  | "transactions"
  | "email"
  | "webhooks"
  | "audit";

interface NexusState {
  activeRole: UserRole;
  activeTab: DashboardTab;
  soundEnabled: boolean;
  isCommandPaletteOpen: boolean;
  selectedEmailTemplate: EmailTemplateType;
  simulatedLatency: number;
  lastActionMessage: string | null;

  setRole: (role: UserRole) => void;
  setActiveTab: (tab: DashboardTab) => void;
  toggleSound: () => void;
  setCommandPalette: (open: boolean) => void;
  setSelectedEmailTemplate: (template: EmailTemplateType) => void;
  setSimulatedLatency: (ms: number) => void;
  setLastActionMessage: (msg: string | null) => void;
  playSfx: (type: "click" | "success" | "error" | "warp") => void;
}

export const useNexusStore = create<NexusState>((set, get) => ({
  activeRole: "ADMIN",
  activeTab: "overview",
  soundEnabled: true,
  isCommandPaletteOpen: false,
  selectedEmailTemplate: "TRANSACTION_RECEIPT",
  simulatedLatency: 18,
  lastActionMessage: null,

  setRole: (role) => {
    set({ activeRole: role });
    get().playSfx("warp");
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
    get().playSfx("click");
  },
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setCommandPalette: (open) => set({ isCommandPaletteOpen: open }),
  setSelectedEmailTemplate: (template) => set({ selectedEmailTemplate: template }),
  setSimulatedLatency: (ms) => set({ simulatedLatency: ms }),
  setLastActionMessage: (msg) => set({ lastActionMessage: msg }),

  playSfx: (type) => {
    if (!get().soundEnabled || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "warp") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // AudioContext muted/blocked by browser
    }
  },
}));
