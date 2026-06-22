import { Alert, Badge, Container, Group, Loader, ScrollArea, Table, Text, Title } from '@mantine/core';
import { format, isAfter, isToday, startOfDay } from 'date-fns';
import type { Entry } from '../types';

type GridModeProps = {
  days: Date[];
  entries: Entry[];
  error: string | null;
  loading: boolean;
  members: Array<{
    id: string;
    username: string;
    streak: number;
  }>;
};

export default function GridMode({ days, entries, error, loading, members }: GridModeProps) {
  return (
    <Container size="xl" px={{ base: 12, sm: 'md' }} py={{ base: 'md', sm: 'xl' }}>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2} size="h3">Таблица группы</Title>
          <Text c="dimmed" size="sm">Сводка по дням текущего месяца</Text>
        </div>
      </Group>

      {error && <Alert color="red" mb="md">{error}</Alert>}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : (
        <ScrollArea type="always" scrollbarSize={6}>
          <Table striped highlightOnHover withTableBorder withColumnBorders miw={860}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ position: 'sticky', left: 0, zIndex: 1 }}>Участник</Table.Th>
                <Table.Th>Серия</Table.Th>
                {days.map((day) => (
                  <Table.Th key={format(day, 'yyyy-MM-dd')} ta="center">
                    <Text size="xs" fw={700}>{format(day, 'dd')}</Text>
                    {isToday(day) && <Badge size="xs" color="green">сегодня</Badge>}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td style={{ position: 'sticky', left: 0, zIndex: 1 }}>
                    <Text fw={700}>{member.username}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={member.streak > 0 ? 'green' : 'gray'}>{member.streak}</Badge>
                  </Table.Td>
                  {days.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const entry = entries.find((item) => item.user_id === member.id && item.date === dateKey);
                    const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));

                    return (
                      <Table.Td key={dateKey} ta="center" c={isFuture ? 'dimmed' : undefined}>
                        {entry?.status === 'clean' && '🟩'}
                        {entry?.status === 'smoked' && '🟥'}
                        {!entry && (isFuture ? '·' : '⬜')}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </Container>
  );
}
