// tests/test-utils.js
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const customRender = (ui, options) => {
  return render(<SafeAreaProvider>{ui}</SafeAreaProvider>, options);
};

export * from '@testing-library/react-native';
export { customRender as render };
