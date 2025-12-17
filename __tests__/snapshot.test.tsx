import { render } from '@testing-library/react';
import Page from '@/app/page';

it('renders homepage unchanged', async () => {
  const { container } = render(await Page());
  expect(container).toMatchSnapshot();
});
