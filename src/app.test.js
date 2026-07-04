import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './library/store/store';
import App from './app';

test('renders app without crashing', () => {
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container.firstChild).not.toBeNull();
});
