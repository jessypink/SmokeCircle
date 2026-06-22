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

const normalizeUsername = (username: string) => username.trim();
const normalizeInviteCode = (inviteCode?: string) => inviteCode?.trim().toUpperCase();

async function getGroup(groupId: string) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Группа пользователя не найдена');

  return data;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      group: null,
      loading: false,
      error: null,

      login: async (rawUsername: string, rawInviteCode?: string) => {
        set({ loading: true, error: null });

        try {
          const username = normalizeUsername(rawUsername);
          const inviteCode = normalizeInviteCode(rawInviteCode);

          if (!username) {
            throw new Error('Введи username');
          }

          const { data: existingUser, error: userLookupError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();

          if (userLookupError) throw userLookupError;

          if (existingUser) {
            const existingGroup = await getGroup(existingUser.group_id);
            set({ user: existingUser, group: existingGroup });
            return true;
          }

          if (!inviteCode) {
            throw new Error('Пользователь не найден. Для первого входа нужен invite-код группы.');
          }

          const { data: groupData, error: groupLookupError } = await supabase
            .from('groups')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

          if (groupLookupError) throw groupLookupError;
          if (!groupData) throw new Error('Неверный invite-код');

          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert({ username, group_id: groupData.id })
            .select()
            .single();

          if (createUserError) throw createUserError;
          if (!newUser) throw new Error('Пользователь не был создан');

          set({ user: newUser, group: groupData });
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
