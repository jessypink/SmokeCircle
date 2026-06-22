import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Group, User } from '../types';

interface AuthState {
  user: User | null;
  group: Group | null;
  loading: boolean;
  error: string | null;
  login: (username: string, inviteCode?: string) => Promise<boolean>;
  logout: () => void;
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }

  return 'Неизвестная ошибка';
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      group: null,
      loading: false,
      error: null,

      login: async (username: string, inviteCode?: string) => {
        set({ loading: true, error: null });

        try {
          let groupId: string;
          let groupData: Group | null = null;

          if (inviteCode) {
            const { data, error } = await supabase
              .from('groups')
              .select('*')
              .eq('invite_code', inviteCode.trim().toUpperCase())
              .single();

            if (error) throw error;
            if (!data) throw new Error('Неверный invite-код');

            groupData = data;
            groupId = data.id;
          } else {
            const inviteCodeNew = Math.random().toString(36).substring(2, 10).toUpperCase();
            const { data, error } = await supabase
              .from('groups')
              .insert({ name: `${username}'s Circle`, invite_code: inviteCodeNew })
              .select()
              .single();

            if (error) throw error;
            if (!data) throw new Error('Группа не была создана');

            groupData = data;
            groupId = data.id;
          }

          let { data: existing } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (!existing) {
            const { data: newUser, error } = await supabase
              .from('users')
              .insert({ username, group_id: groupId })
              .select()
              .single();

            if (error) throw error;
            if (!newUser) throw new Error('Пользователь не был создан');

            existing = newUser;
          } else if (existing.group_id !== groupId) {
            throw new Error('Этот username уже используется в другой группе');
          }

          set({ user: existing, group: groupData });
          return true;
        } catch (error) {
          set({ error: getErrorMessage(error) });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      logout: () => set({ user: null, group: null, error: null }),
    }),
    {
      name: 'smokecircle-auth',
      partialize: (state) => ({
        user: state.user,
        group: state.group,
      }),
    },
  ),
);
