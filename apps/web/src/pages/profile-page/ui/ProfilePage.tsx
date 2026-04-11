import { Cell, List, Section } from '@telegram-apps/telegram-ui';

export function ProfilePage() {
  return (
    <div className="tma-page">
      <h1 className="page-title">Profile</h1>
      <Section header="Account">
        <List>
          <Cell subtitle="Synced from Telegram when available">
            Telegram
          </Cell>
          <Cell subtitle="Collected at checkout">Contact details</Cell>
        </List>
      </Section>
    </div>
  );
}
