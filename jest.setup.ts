// AsyncStorage hat in Jest kein natives Modul – wir nutzen den offiziellen In-Memory-Mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
