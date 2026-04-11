import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <Stack align="center" justify="center" mih="100dvh" p="md" bg="gray.0">
      <Paper shadow="md" p="xl" radius="md" maw={420} w="100%">
        <Title order={2} mb="xs" c="parfum.8">
          Sign in
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Admin credentials will be validated by the API in a later step.
        </Text>
        <Stack gap="md">
          <TextInput label="Email" placeholder="admin@example.com" />
          <PasswordInput label="Password" placeholder="••••••••" />
          <Button
            fullWidth
            onClick={() => navigate('/dashboard')}
            color="parfum"
          >
            Continue
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Scaffold only — <Anchor size="xs">forgot password</Anchor> is not
            wired yet.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
