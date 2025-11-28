'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa';

import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { signIn } from '@/lib/auth-client';

const formSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(16, { message: 'Password can be at most 16 characters' }),
});

const Page = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      await signIn.email({ email: data.email, password: data.password });
      setIsPending(false);
      router.push('/dashboard');
    } catch (err) {
      const msg =
        err instanceof Error ? String(err.message ?? '') : String(err ?? '');

      if (/email/i.test(msg) && !/password/i.test(msg))
        form.setError('email', { message: 'Invalid email' });
      else if (/password/i.test(msg))
        form.setError('password', { message: 'Invalid password' });
      else form.setError('password', { message: 'Invalid email or password' });
    }
  };

  return (
    <>
      <div className="w-2/5 px-8 flex flex-col justify-center items-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-3">
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="sign-in-form-email">
                          Email
                        </FieldLabel>
                        <Input
                          {...field}
                          id="sign-in-form-email"
                          aria-invalid={fieldState.invalid}
                          placeholder="abc@email.com"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="sign-in-form-pwd">
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id="sign-in-form-pwd"
                          aria-invalid={fieldState.invalid}
                          placeholder="********"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Button type="submit" form="sign-in-form">
                    Submit
                  </Button>
                </FieldGroup>
                <div className="relative text-center text-sm">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-700"></span>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-slate-400 rounded-full border border-slate-300">
                      Or continue with
                    </span>
                  </div>
                </div>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      disabled={isPending}
                      onClick={async () =>
                        await signIn.social({ provider: 'google' })
                      }
                      type="button"
                    >
                      <FaGoogle className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                      <span className="truncate">Google</span>
                    </Button>
                    <Button
                      disabled={isPending}
                      onClick={async () =>
                        await signIn.social({ provider: 'github' })
                      }
                      type="button"
                    >
                      <FaGithub className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                      <span className="truncate">Github</span>
                    </Button>
                  </div>
                </FieldGroup>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="w-3/5">right</div>
    </>
  );
};

export default Page;
