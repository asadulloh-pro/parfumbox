import {
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existing = useAppSelector((s) => s.auth.accessToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  if (existing) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Stack align="center" justify="center" mih="100dvh" p="md" bg="gray.0">
      <Paper shadow="md" p="xl" radius="md" maw={420} w="100%">
        <Title order={2} mb="xs" c="parfum.8">
          Sign in
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Use the admin email and password configured in the API database.
        </Text>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              const res = await login({ email: email.trim(), password }).unwrap();
              dispatch(setCredentials({ accessToken: res.accessToken }));
              navigate('/dashboard', { replace: true });
            } catch {
              setError('Invalid email or password.');
            }
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="admin@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.currentTarget.value)}
              required
            />
            {error ? (
              <Text size="sm" c="red">
                {error}
              </Text>
            ) : null}
            <Button fullWidth type="submit" loading={isLoading} color="parfum">
              Continue
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
