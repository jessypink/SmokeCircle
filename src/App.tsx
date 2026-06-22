import { AppShell, Button, Group, MantineProvider, Switch, Text } from '@mantine/core';
import { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import CalendarGrid from './components/CalendarGrid';
import GridMode from './components/GridMode';
import { useGroupCalendar } from './hooks/useGroupCalendar';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { user, logout } = useAuthStore();
  const calendar = useGroupCalendar();
  const [mode, setMode] = useState<'calendar' | 'grid'>('calendar');

  return (
    <MantineProvider defaultColorScheme="dark">
      {!user ? (
        <AuthScreen />
      ) : (
        <AppShell header={{ height: 64 }} padding={0}>
          <AppShell.Header>
            <Group h="100%" px={{ base: 12, sm: 'md' }} justify="space-between" gap="xs" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <Text fw={800} size="lg" lh={1}>SmokeCircle</Text>
                <Switch
                  size="sm"
                  label={mode === 'calendar' ? 'Календарь' : 'Таблица'}
                  checked={mode === 'grid'}
                  onChange={(e) => setMode(e.currentTarget.checked ? 'grid' : 'calendar')}
                />
              </Group>
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" truncate maw={{ base: 92, sm: 220 }}>
                  {user.username}
                </Text>
                <Button size="xs" variant="subtle" onClick={logout}>Выйти</Button>
              </Group>
            </Group>
          </AppShell.Header>

          <AppShell.Main>
            {mode === 'calendar' ? (
              <CalendarGrid
                days={calendar.days}
                entries={calendar.entries}
                error={calendar.error}
                groupInviteCode={calendar.group?.invite_code}
                loading={calendar.loading}
                members={calendar.members}
                currentUserId={user.id}
                onSetStatus={calendar.setStatus}
              />
            ) : (
              <GridMode
                days={calendar.days}
                entries={calendar.entries}
                error={calendar.error}
                loading={calendar.loading}
                members={calendar.members}
              />
            )}
          </AppShell.Main>
        </AppShell>
      )}
    </MantineProvider>
  );
}
