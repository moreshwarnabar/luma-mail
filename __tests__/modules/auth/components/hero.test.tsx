import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Hero from '@/modules/auth/components/hero';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaGithub: () => <svg data-testid="github-icon" aria-label="GitHub" />,
  FaLinkedinIn: () => <svg data-testid="linkedin-icon" aria-label="LinkedIn" />,
}));

describe('Hero Component', () => {
  describe('Rendering', () => {
    it('renders the hero component', () => {
      render(<Hero />);

      expect(
        screen.getByRole('img', { name: /video substitute/i })
      ).toBeInTheDocument();
    });

    it('renders the image with correct attributes', () => {
      render(<Hero />);

      const image = screen.getByRole('img', { name: /video substitute/i });
      expect(image).toHaveAttribute('src', '/video-sub.jpg');
      expect(image).toHaveAttribute('alt', 'Video Substitute');
      expect(image).toHaveAttribute('width', '1024');
      expect(image).toHaveAttribute('height', '512');
    });

    it('renders the heading', () => {
      render(<Hero />);

      expect(
        screen.getByRole('heading', { name: /email, reimagined for clarity/i })
      ).toBeInTheDocument();
    });

    it('renders the description text', () => {
      render(<Hero />);

      expect(
        screen.getByText(
          /luma mail cuts through the noise with ai-powered organization/i
        )
      ).toBeInTheDocument();
    });

    it('renders the "Made with ❤️ by Moreshwar" text', () => {
      render(<Hero />);

      expect(
        screen.getByText(/made with ❤️ by moreshwar/i)
      ).toBeInTheDocument();
    });

    it('renders social media links', () => {
      render(<Hero />);

      const links = screen.getAllByRole('link');
      const linkedinLink = links.find(
        link =>
          link.getAttribute('href') ===
          'https://www.linkedin.com/in/moreshwar-rajan-nabar/'
      );
      const githubLink = links.find(
        link =>
          link.getAttribute('href') === 'https://github.com/moreshwarnabar'
      );

      expect(linkedinLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
    });

    it('renders LinkedIn link with correct href and target', () => {
      render(<Hero />);

      const links = screen.getAllByRole('link');
      const linkedinLink = links.find(
        link =>
          link.getAttribute('href') ===
          'https://www.linkedin.com/in/moreshwar-rajan-nabar/'
      );

      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/moreshwar-rajan-nabar/'
      );
      expect(linkedinLink).toHaveAttribute('target', '_blank');
    });

    it('renders GitHub link with correct href and target', () => {
      render(<Hero />);

      const links = screen.getAllByRole('link');
      const githubLink = links.find(
        link =>
          link.getAttribute('href') === 'https://github.com/moreshwarnabar'
      );

      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/moreshwarnabar'
      );
      expect(githubLink).toHaveAttribute('target', '_blank');
    });

    it('renders social media icons', () => {
      render(<Hero />);

      expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    });

    it('renders social media buttons', () => {
      render(<Hero />);

      const links = screen.getAllByRole('link');
      const linkedinLink = links.find(
        link =>
          link.getAttribute('href') ===
          'https://www.linkedin.com/in/moreshwar-rajan-nabar/'
      );
      const githubLink = links.find(
        link =>
          link.getAttribute('href') === 'https://github.com/moreshwarnabar'
      );

      const linkedinButton = linkedinLink?.querySelector('button');
      const githubButton = githubLink?.querySelector('button');

      expect(linkedinButton).toBeInTheDocument();
      expect(githubButton).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders within a card component', () => {
      const { container } = render(<Hero />);

      // Card should be present (checking for card structure)
      const card = container.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
    });

    it('has correct layout classes', () => {
      const { container } = render(<Hero />);

      const heroContainer = container.firstChild;
      expect(heroContainer).toHaveClass('w-3/5');
      expect(heroContainer).toHaveClass('flex');
      expect(heroContainer).toHaveClass('flex-col');
    });
  });
});
