import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render-with-providers';

import { AppButton, Chip, IconButton } from '../kit';

describe('UI kit', () => {
  it('AppButton is a button with its label as accessible name and reacts to presses', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<AppButton onPress={onPress}>Speichern</AppButton>);

    await user.press(screen.getByRole('button', { name: 'Speichern' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a disabled AppButton does not react', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <AppButton onPress={onPress} disabled>
        Speichern
      </AppButton>,
    );

    await user.press(screen.getByRole('button', { name: 'Speichern' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeDisabled();
  });

  it('Chip is a radio that exposes whether it is selected', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(
      <>
        <Chip selected onPress={onPress}>
          Arbeit
        </Chip>
        <Chip selected={false} onPress={onPress}>
          Lernen
        </Chip>
      </>,
    );

    expect(screen.getByRole('radio', { name: 'Arbeit' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Lernen' })).not.toBeChecked();
    await user.press(screen.getByRole('radio', { name: 'Lernen' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('IconButton is named by its label', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<IconButton icon="trash-outline" label="Löschen" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Löschen' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
