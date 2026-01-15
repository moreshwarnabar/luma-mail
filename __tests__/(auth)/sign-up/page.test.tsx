import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { redirect } from 'next/navigation';

import Page from '@/app/(auth)/sign-up/page';
import { auth } from '@/lib/auth/auth';
import { signIn, signUp } from '@/lib/auth/auth-client';

const mockPush = (global as typeof globalThis & { __mockPush: jest.Mock })
  .__mockPush;

describe('SignUp Page', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Server Component Behavior', () => {
    it('redirects to dashboard when session exists', async () => {
      await Page();

      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('renders SignUp component when no session exists', async () => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await Page();
      render(result);

      expect(
        screen.getByRole('heading', { name: /welcome/i })
      ).toBeInTheDocument();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('SignUp Component - Form Rendering', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('renders the sign-up form with all fields', async () => {
      const result = await Page();
      render(result);

      expect(
        screen.getByRole('heading', { name: /welcome/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Sign up to start using luma mail./i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /submit/i })
      ).toBeInTheDocument();
    });

    it('renders social sign-up buttons', async () => {
      const result = await Page();
      render(result);

      expect(
        screen.getByRole('button', { name: /google/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /github/i })
      ).toBeInTheDocument();
    });

    it('renders sign-in link', async () => {
      const result = await Page();
      render(result);

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/sign-in');
    });
  });

  describe('SignUp Component - Form Validation', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('shows validation error for name required', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for email required', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for password required', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for confirm password required', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm your password/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for passwords do not match', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(passwordInput, 'password');
      await user.type(confirmPasswordInput, 'password1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
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

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(passwordInput, '1234567');
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

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(
        passwordInput,
        '1234567890123456789012345678901234567890'
      );
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password can be at most 16 characters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('SignUp Component - Form Submission', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('redirects to dashboard on successful sign-up', async () => {
      const user = userEvent.setup();
      const result = await Page();
      render(result);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error message for invalid email', async () => {
      const user = userEvent.setup();
      jest.mocked(signUp.email).mockRejectedValue(new Error('Invalid Email'));

      const result = await Page();
      render(result);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('shows error message for invalid password', async () => {
      const user = userEvent.setup();
      jest
        .mocked(signUp.email)
        .mockRejectedValue(new Error('Invalid Password'));

      const result = await Page();
      render(result);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
    });

    it('shows generic error message for other errors', async () => {
      const user = userEvent.setup();
      jest
        .mocked(signUp.email)
        .mockRejectedValue(new Error('Something went wrong'));

      const result = await Page();
      render(result);

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('SignUp Component - Social Sign-Up', () => {
    beforeEach(() => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);
    });

    it('calls signIn.social with google provider when Google button is clicked', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.social).mockResolvedValue(undefined);

      const result = await Page();
      render(result);

      const signUpButton = screen.getByRole('button', { name: /google/i });
      await user.click(signUpButton);

      await waitFor(() => {
        expect(signIn.social).toHaveBeenCalledWith({ provider: 'google' });
      });
    });

    it('calls signIn.social with github provider when GitHub button is clicked', async () => {
      const user = userEvent.setup();
      jest.mocked(signIn.social).mockResolvedValue(undefined);

      const result = await Page();
      render(result);

      const signUpButton = screen.getByRole('button', { name: /github/i });
      await user.click(signUpButton);

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

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john.doe@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      await waitFor(() => {
        expect(googleButton).toBeDisabled();
        expect(githubButton).toBeDisabled();
      });
    });
  });
});
