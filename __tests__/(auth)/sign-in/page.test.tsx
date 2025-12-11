import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect } from 'next/navigation';

import Page from '@/app/(auth)/sign-in/page';
import { auth } from '@/lib/auth/auth';
import { signIn } from '@/lib/auth/auth-client';

// Mock Hero component
jest.mock('@/modules/auth/components/hero', () => {
  return function MockHero() {
    return <div data-testid="hero-component">Hero</div>;
  };
});

const mockPush = (global as typeof globalThis & { __mockPush: jest.Mock })
  .__mockPush;

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(signIn.email).mockClear();
    jest.mocked(signIn.social).mockClear();
    jest.mocked(auth.api.getSession).mockClear();
    mockPush.mockClear();
  });

  describe('Server Component Behavior', () => {
    it('redirects to dashboard when session exists', async () => {
      await Page();

      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('renders SignIn component when no session exists', async () => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await Page();
      render(result);

      expect(
        screen.getByRole('heading', { name: /welcome/i })
      ).toBeInTheDocument();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('SignIn Component - Form Rendering', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('renders the sign-in form with all fields', async () => {
      const result = await Page();
      render(result);

      expect(
        screen.getByRole('heading', { name: /welcome/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /submit/i })
      ).toBeInTheDocument();
    });

    it('renders social sign-in buttons', async () => {
      const result = await Page();
      render(result);

      expect(
        screen.getByRole('button', { name: /google/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /github/i })
      ).toBeInTheDocument();
    });

    it('renders sign-up link', async () => {
      const result = await Page();
      render(result);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/sign-up');
    });
  });

  describe('SignIn Component - Form Validation', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for password too short', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for password too long', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'a'.repeat(17));
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password can be at most 16 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('allows form submission with valid inputs', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.email).mockResolvedValue(undefined);
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn.email).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'validpassword',
        });
      });
    });
  });

  describe('SignIn Component - Form Submission', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('redirects to dashboard on successful sign-in', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error message for invalid email', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.email).mockRejectedValue(new Error('Invalid email'));
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('shows error message for invalid password', async () => {
      const user = userEvent.setup();
      jest
        .mocked(signIn.email)
        .mockRejectedValue(new Error('Invalid password'));
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
    });

    it('shows generic error message for other errors', async () => {
      const user = userEvent.setup();
      jest
        .mocked(signIn.email)
        .mockRejectedValue(new Error('Something went wrong'));
      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('SignIn Component - Social Sign-In', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('calls signIn.social with google provider when Google button is clicked', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.social).mockResolvedValue(undefined);
      const result = await Page();
      render(result);

      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(signIn.social).toHaveBeenCalledWith({ provider: 'google' });
      });
    });

    it('calls signIn.social with github provider when GitHub button is clicked', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.social).mockResolvedValue(undefined);
      const result = await Page();
      render(result);

      const githubButton = screen.getByRole('button', { name: /github/i });
      await user.click(githubButton);

      await waitFor(() => {
        expect(signIn.social).toHaveBeenCalledWith({ provider: 'github' });
      });
    });

    it('disables social buttons when form is pending', async () => {
      const user = userEvent.setup();
      jest
        .mocked(signIn.email)
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );

      const result = await Page();
      render(result);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });
      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword');
      await user.click(submitButton);

      // Buttons should be disabled while pending
      await waitFor(() => {
        expect(googleButton).toBeDisabled();
        expect(githubButton).toBeDisabled();
      });
    });
  });
});
