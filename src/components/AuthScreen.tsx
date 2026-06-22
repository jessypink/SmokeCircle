import { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { login, error, loading } = useAuthStore();

  const handleCreate = () => login(username);
  const handleJoin = () => login(username, inviteCode);

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">SmokeCircle</Title>
        <Text c="dimmed" ta="center" mb="xl">
          Приватный трекер для друзей
        </Text>

        <Stack>
          <TextInput
            label="Твой username"
            name="username"
            autoComplete="username"
            placeholder="Kirill"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value.trim())}
          />

          <TextInput
            label="Invite Code (если есть)"
            name="organization"
            autoComplete="organization"
            placeholder="ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.currentTarget.value.trim().toUpperCase())}
          />

          <Button fullWidth onClick={handleCreate} disabled={!username} loading={loading}>
            Создать новую группу
          </Button>

          <Button fullWidth variant="outline" onClick={handleJoin} disabled={!username || !inviteCode} loading={loading}>
            Присоединиться по invite-коду
          </Button>

          {error && <Alert color="red">{error}</Alert>}
        </Stack>
      </Paper>
    </Container>
  );
}
