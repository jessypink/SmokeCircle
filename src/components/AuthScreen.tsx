import { useState } from 'react';
import { Alert, Button, Container, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const { login, error, loading } = useAuthStore();

  const handleLogin = () => login(username, inviteCode || undefined);

  return (
    <Container size="sm" px="md" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">SmokeCircle</Title>
        <Text c="dimmed" ta="center" mb="xl">
          Вход по нику. Если ты уже был в группе, invite-код не нужен.
        </Text>

        <Stack>
          <TextInput
            label="Твой username"
            name="username"
            autoComplete="username"
            placeholder="Kirill"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />

          <TextInput
            label="Invite Code"
            description="Нужен только для первого входа нового пользователя"
            name="organization"
            autoComplete="organization"
            placeholder="ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.currentTarget.value.trim().toUpperCase())}
          />

          <Button fullWidth onClick={handleLogin} disabled={!username.trim()} loading={loading}>
            Войти
          </Button>

          {error && <Alert color="red">{error}</Alert>}
        </Stack>
      </Paper>
    </Container>
  );
}
