import { Button, Input, Spinner } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetMeQuery,
  usePatchMeMutation,
  type UserProfile,
} from '../../../app/parfumApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from '../../../features/auth/authSlice';
import { LanguageSwitcher } from '../../../features/i18n/LanguageSwitcher';
import { useTelegramSession } from '../../../features/session/telegramSessionContext';

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function ProfileEditor({ me }: { me: UserProfile }) {
  const { t } = useTranslation();
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
      <div style={{ marginBottom: 12 }}>
        <LanguageSwitcher />
      </div>
      <h1 className="page-title">{t('profile.title')}</h1>
      <p className="page-placeholder" style={{ marginBottom: 16 }}>
        {me.telegramUsername ? `@${me.telegramUsername}` : t('profile.telegramLine')}{' '}
        · ID {me.telegramId}
      </p>
      <div className="form-stack">
        <div className="form-field">
          <label htmlFor="pf-phone">{t('profile.phone')}</label>
          <Input
            id="pf-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-first">{t('profile.firstName')}</label>
          <Input
            id="pf-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-last">{t('profile.lastName')}</label>
          <Input
            id="pf-last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pf-birth">{t('profile.birthday')}</label>
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
        {t('profile.save')}
      </Button>
      {authUser ? (
        <p className="page-placeholder" style={{ marginTop: 20 }}>
          {t('profile.signedInAs', {
            name:
              [authUser.firstName, authUser.lastName].filter(Boolean).join(' ') ||
              t('profile.userFallback'),
          })}
        </p>
      ) : null}
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const token = useAppSelector((s) => s.auth.accessToken);
  const { isTelegramAuthPending, telegramSignInError } = useTelegramSession();

  const { data: me, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    if (isTelegramAuthPending) {
      return (
        <div className="tma-page tma-page--centered">
          <Spinner size="l" />
        </div>
      );
    }
    return (
      <div className="tma-page">
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('profile.title')}</h1>
        {telegramSignInError ? (
          <p
            className="page-placeholder"
            style={{ color: 'var(--pb-danger, #b42318)', marginBottom: 12 }}
          >
            {telegramSignInError}
          </p>
        ) : null}
        <p className="page-placeholder">{t('profile.signInHint')}</p>
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
        <div style={{ marginBottom: 12 }}>
          <LanguageSwitcher />
        </div>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-placeholder">{t('profile.loadError')}</p>
      </div>
    );
  }

  return <ProfileEditor key={me.updatedAt} me={me} />;
}
