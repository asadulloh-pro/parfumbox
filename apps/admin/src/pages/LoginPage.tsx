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
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { LanguageSwitcher } from '../features/i18n/LanguageSwitcher';

export function LoginPage() {
  const { t } = useTranslation();
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
        <Stack gap="xs" mb="lg" align="stretch">
          <LanguageSwitcher />
        </Stack>
        <Title order={2} mb="xs" c="parfum.8">
          {t('login.title')}
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          {t('login.subtitle')}
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
              setError(t('login.invalidCredentials'));
            }
          }}
        >
          <Stack gap="md">
            <TextInput
              label={t('login.email')}
              placeholder={t('login.emailPlaceholder')}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.currentTarget.value)}
              required
            />
            <PasswordInput
              label={t('login.password')}
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
              {t('login.continue')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
