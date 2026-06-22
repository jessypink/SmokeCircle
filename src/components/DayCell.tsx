import { Badge, Button, Card, Group, Stack, Text } from '@mantine/core';
import { format, isAfter, isToday, startOfDay } from 'date-fns';

type DayUser = {
  id: string;
  username: string;
  status: 'clean' | 'smoked' | null;
};

type Props = {
  date: Date;
  dateKey: string;
  users: DayUser[];
  currentUserId: string;
  onSetStatus: (date: string, status: 'clean' | 'smoked') => void;
};

export default function DayCell({ date, dateKey, users, currentUserId, onSetStatus }: Props) {
  const currentUser = users.find((user) => user.id === currentUserId);
  const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
  const today = isToday(date);

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      h="100%"
      opacity={isFuture ? 0.64 : 1}
      style={{
        borderColor: today ? 'var(--mantine-color-green-5)' : undefined,
        boxShadow: today ? '0 0 0 1px var(--mantine-color-green-5)' : undefined,
      }}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
          <div>
            <Text fw={900} size="xl" lh={1}>{format(date, 'dd')}</Text>
            <Text size="xs" c="dimmed">{format(date, 'MM.yyyy')}</Text>
          </div>
          <Group gap={6} justify="flex-end">
            {today && <Badge size="sm" color="green">Сегодня</Badge>}
            {isFuture && <Badge size="sm" color="gray">Будущее</Badge>}
          </Group>
        </Group>

        <Stack gap={8} style={{ flex: 1 }}>
          {users.map((user) => (
            <Group key={user.id} justify="space-between" gap="xs" wrap="nowrap">
              <Text size="sm" fw={user.id === currentUserId ? 700 : 500} truncate>
                {user.username}
              </Text>
              {user.status === 'clean' && <Badge color="green" variant="light">Не курил</Badge>}
              {user.status === 'smoked' && <Badge color="red" variant="light">Курил</Badge>}
              {!user.status && <Badge color="gray" variant="light">Нет отметки</Badge>}
            </Group>
          ))}
        </Stack>

        {currentUser && (
          <Group grow>
            <Button
              size="sm"
              color="green"
              disabled={isFuture}
              variant={currentUser.status === 'clean' ? 'filled' : 'light'}
              onClick={() => onSetStatus(dateKey, 'clean')}
            >
              Не курил
            </Button>
            <Button
              size="sm"
              color="red"
              disabled={isFuture}
              variant={currentUser.status === 'smoked' ? 'filled' : 'light'}
              onClick={() => onSetStatus(dateKey, 'smoked')}
            >
              Курил
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
