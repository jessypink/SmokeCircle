import { Alert, Badge, Box, Container, Group, Loader, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { format, isToday } from 'date-fns';
import { useEffect, useRef } from 'react';
import type { Entry } from '../types';
import DayCell from './DayCell';

type CalendarGridProps = {
  days: Date[];
  entries: Entry[];
  error: string | null;
  groupInviteCode?: string;
  loading: boolean;
  members: Array<{
    id: string;
    username: string;
    streak: number;
  }>;
  currentUserId: string;
  onSetStatus: (date: string, status: 'clean' | 'smoked') => void;
};

export default function CalendarGrid({
  days,
  entries,
  error,
  groupInviteCode,
  loading,
  members,
  currentUserId,
  onSetStatus,
}: CalendarGridProps) {
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading) {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [loading]);

  return (
    <Container size="xl" px={{ base: 12, sm: 'md' }} py={{ base: 'md', sm: 'xl' }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
          <Box>
            <Title order={2} size="h3">Календарь группы</Title>
            <Text c="dimmed" size="sm">{format(new Date(), 'MM.yyyy')}</Text>
          </Box>

          {groupInviteCode && (
            <Badge size="lg" variant="light" style={{ flexShrink: 0 }}>
              {groupInviteCode}
            </Badge>
          )}
        </Group>

        <ScrollArea type="never" offsetScrollbars={false}>
          <Group gap="xs" wrap="nowrap" pb={4}>
            {members.map((member) => (
              <Paper key={member.id} withBorder radius="md" px="sm" py={6} miw={118}>
                <Text size="xs" c="dimmed" truncate>{member.username}</Text>
                <Text fw={800} size="sm">Серия {member.streak}</Text>
              </Paper>
            ))}
          </Group>
        </ScrollArea>

        {error && <Alert color="red">{error}</Alert>}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <ScrollArea type="always" scrollbarSize={6} offsetScrollbars>
            <Group gap="md" wrap="nowrap" align="stretch" pb="sm">
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayUsers = members.map((member) => ({
                  id: member.id,
                  username: member.username,
                  status: entries.find((entry) => entry.user_id === member.id && entry.date === dateKey)?.status ?? null,
                }));

                return (
                  <Box
                    key={dateKey}
                    ref={isToday(day) ? todayRef : undefined}
                    w={{ base: 286, sm: 320 }}
                    style={{ flex: '0 0 auto' }}
                  >
                    <DayCell
                      date={day}
                      dateKey={dateKey}
                      users={dayUsers}
                      currentUserId={currentUserId}
                      onSetStatus={onSetStatus}
                    />
                  </Box>
                );
              })}
            </Group>
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
}
