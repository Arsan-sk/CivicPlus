import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: 'citizen' | 'authority' | 'admin';
  country_id?: string;
  state_id?: string;
  city_id?: string;
  contribution_score: number;
  is_verified: boolean;
}

interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  setSession: async (session) => {
    const { user: currentUser, profile: currentProfile } = get();
    if (!session) {
      set({ user: null, profile: null, loading: false, initialized: true });
      return;
    }

    const user = session.user;
    
    // If the user matches currently loaded user, skip setSession re-fetching/re-loading
    if (currentUser?.id === user.id && currentProfile) {
      set({ user, initialized: true, loading: false });
      return;
    }

    set({ user, loading: true });

    try {
      // Fetch user profile from DB
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        set({ user, profile: null, loading: false, initialized: true });
      } else {
        set({ user, profile, loading: false, initialized: true });
      }
    } catch (err) {
      console.error('Auth store error:', err);
      set({ user, profile: null, loading: false, initialized: true });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && profile) {
        set({ profile });
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  },

  setProfile: (profile: Profile) => {
    set({ profile });
  },
}));
