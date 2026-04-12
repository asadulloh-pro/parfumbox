import { Button, Input, Spinner } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import {
  useGetMeQuery,
  usePatchMeMutation,
  type UserProfile,
} from '../../../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from '../../../features/auth/authSlice';

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function ProfileEditor({ me }: { me: UserProfile }) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);

  const [patchMe, { isLoading: saving }] = usePatchMeMutation();

  const [phone, setPhone] = useState(me.phone ?? '');
  const [firstName, setFirstName] = useState(me.firstName ?? '');
  const [lastName, setLastName] = useState(me.lastName ?? '');
  const [birthDate, setBirthDate] = useState(toDateInputValue(me.birthDate));

  const handleSave = async () => {
    const updated = await patchMe({
      phone: phone.trim() || undefined,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      birthDate: birthDate.trim() || undefined,
    }).unwrap();
    dispatch(
      setUser({
        id: updated.id,
        telegramId: updated.telegramId,
        telegramUsername: updated.telegramUsername,
        firstName: updated.firstName,
        lastName: updated.lastName,
      }),
    );
  };

  return (
    <div className="tma-page">
      <h1 className="page-title">Profile</h1>
      <p className="page-placeholder" style={{ marginBottom: 16 }}>
        {me.telegramUsername ? `@${me.telegramUsername}` : 'Telegram'}{' '}
        · ID {me.telegramId}
      </p>
      <div className="form-stack">
        <div className="form-field">
          <label htmlFor="pf-phone">Phone</label>
          <Input
            id="pf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-first">First name</label>
          <Input
            id="pf-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-last">Last name</label>
          <Input
            id="pf-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-birth">Birthday</label>
          <Input
            id="pf-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>
      <Button
        mode="filled"
        size="l"
        stretched
        loading={saving}
        disabled={saving}
        onClick={() => void handleSave()}
      >
        Save
      </Button>
      {authUser ? (
        <p className="page-placeholder" style={{ marginTop: 20 }}>
          Signed in as {authUser.firstName ?? 'User'}{' '}
          {authUser.lastName ?? ''}
        </p>
      ) : null}
    </div>
  );
}

export function ProfilePage() {
  const token = useAppSelector((s) => s.auth.accessToken);

  const { data: me, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Profile</h1>
        <p className="page-placeholder">
          Open the app in Telegram to load your account, or use{' '}
          <code style={{ fontSize: 13 }}>VITE_DEV_JWT</code> for local testing.
        </p>
      </div>
    );
  }

  if (isLoading && !me) {
    return (
      <div className="tma-page tma-page--centered">
        <Spinner size="l" />
      </div>
    );
  }

  if (isError || !me) {
    return (
      <div className="tma-page">
        <h1 className="page-title">Profile</h1>
        <p className="page-placeholder">Could not load profile.</p>
      </div>
    );
  }

  return <ProfileEditor key={me.updatedAt} me={me} />;
}
