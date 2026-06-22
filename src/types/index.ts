export type Group = { id: string; name: string; invite_code: string };
export type User = { id: string; username: string; group_id: string };
export type Entry = {
  id: string;
  user_id: string;
  group_id: string;
  date: string;
  status: 'clean' | 'smoked';
  notes?: string;
};