import { eachDayOfInterval, endOfMonth, format, startOfMonth, startOfToday, subDays } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Entry, User } from '../types';

export type MemberWithStreak = User & {
  streak: number;
};

export function useGroupCalendar() {
  const { user, group } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const today = new Date();

    return eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(today),
    });
  }, []);

  const getEntry = useCallback(
    (userId: string, date: string) => entries.find((entry) => entry.user_id === userId && entry.date === date),
    [entries],
  );

  const getStreak = useCallback(
    (userId: string) => {
      let streak = 0;
      let day = startOfToday();
      const monthStart = startOfMonth(day);

      while (day >= monthStart) {
        const entry = getEntry(userId, format(day, 'yyyy-MM-dd'));

        if (entry?.status !== 'clean') {
          break;
        }

        streak += 1;
        day = subDays(day, 1);
      }

      return streak;
    },
    [getEntry],
  );

  const members = useMemo<MemberWithStreak[]>(
    () => users.map((member) => ({ ...member, streak: getStreak(member.id) })),
    [getStreak, users],
  );

  const loadCalendar = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const groupId = group?.id ?? user.group_id;
    const firstDay = format(days[0], 'yyyy-MM-dd');
    const lastDay = format(days[days.length - 1], 'yyyy-MM-dd');

    const [{ data: groupUsers, error: usersError }, { data: groupEntries, error: entriesError }] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true }),
      supabase
        .from('entries')
        .select('*')
        .eq('group_id', groupId)
        .gte('date', firstDay)
        .lte('date', lastDay),
    ]);

    if (usersError || entriesError) {
      setError(usersError?.message ?? entriesError?.message ?? 'Не удалось загрузить календарь');
    } else {
      setUsers(groupUsers ?? []);
      setEntries(groupEntries ?? []);
    }

    setLoading(false);
  }, [days, group?.id, user]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const setStatus = async (date: string, status: 'clean' | 'smoked') => {
    if (!user) return;

    setError(null);

    const { data, error: upsertError } = await supabase
      .from('entries')
      .upsert(
        {
          user_id: user.id,
          group_id: user.group_id,
          date,
          status,
        },
        { onConflict: 'user_id,date' },
      )
      .select()
      .single();

    if (upsertError || !data) {
      setError(upsertError?.message ?? 'Не удалось сохранить отметку');
      return;
    }

    setEntries((current) => [
      ...current.filter((entry) => !(entry.user_id === user.id && entry.date === date)),
      data,
    ]);
  };

  return {
    days,
    entries,
    error,
    group,
    loading,
    members,
    setStatus,
    user,
  };
}
