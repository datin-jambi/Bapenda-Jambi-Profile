import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "sidebar-store" }
  )
);

interface ModalStore {
  modals: Record<string, boolean>;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
  toggleModal: (key: string) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: {},
  openModal: (key) => set((s) => ({ modals: { ...s.modals, [key]: true } })),
  closeModal: (key) => set((s) => ({ modals: { ...s.modals, [key]: false } })),
  toggleModal: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: !s.modals[key] } })),
}));

interface AuthStore {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    uptdId?: number | null;
    avatarUrl?: string | null;
  } | null;
  setUser: (user: AuthStore["user"]) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "auth-store" }
  )
);
