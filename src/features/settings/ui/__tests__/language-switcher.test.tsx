import { screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { renderWithProviders } from '@/test-utils/render-with-providers';

import { LanguageSwitcher } from '../language-switcher';

function Title() {
  const { t } = useTranslation();
  return <Text>{t('wins.title')}</Text>;
}

describe('LanguageSwitcher', () => {
  it('offers German, Italian and English and marks the active language', async () => {
    await renderWithProviders(<LanguageSwitcher />, { language: 'de' });

    expect(screen.getByLabelText('Sprache')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Italiano' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'English' })).not.toBeChecked();
  });

  it('switches the whole UI to the chosen language', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <>
        <LanguageSwitcher />
        <Title />
      </>,
      { language: 'de' },
    );
    expect(screen.getByText('Meine Wins')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Italiano' }));

    expect(await screen.findByText('I miei successi')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Italiano' })).toBeChecked();
    expect(screen.getByLabelText('Lingua')).toBeOnTheScreen();
  });
});
