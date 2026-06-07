"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GlobeIcon, LoaderIcon, MailIcon, PhoneIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

interface ContactFormDetailsProps {
  title: string;
  description: string;
  phone: string;
  email: string;
  web: { label: string; url: string };
  formSubheading: string;
  formHeading: string;
  successMessage: string;
  submitLabel: string;
  submittingLabel: string;
  className?: string;
}

interface Contact2Props extends ContactFormDetailsProps {
  onSubmit?: (data: ContactFormData) => Promise<void>;
}
type Props = Partial<Contact2Props>;

const defaultProps: Contact2Props = {
  title: "Contact Us",
  description: "Building with shadcn/ui and Tailwind? Shadcnblocks ships copy-paste React sections—drop us a line if you need help picking blocks or wiring forms.",
  phone: "+1 (555) 010-2400",
  email: "hello@shadcnblocks.com",
  web: {
    label: "shadcnblocks.com",
    url: "https://www.shadcnblocks.com",
  },
  formSubheading: "We usually reply within one business day.",
  formHeading: "Send us a message",
  successMessage: "Thanks — your message is in our inbox.",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
};

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact2 = (props: Props) => {
  const {
    title,
    description,
    phone,
    email,
    web,
    formHeading,
    formSubheading,
    successMessage,
    submitLabel,
    submittingLabel,
    className,
    onSubmit,
  } = { ...defaultProps, ...props };

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        console.log("Form submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsSubmitted(true);
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 4500);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <section className={cn("section-padding border-t border-border/60", className)}>
      <div className="container mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="flex flex-1 flex-col gap-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-pretty sm:text-3xl lg:text-4xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href={`tel:${phone}`}
                className="group flex items-center gap-3"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PhoneIcon className="size-5" />
                </span>
                <span className="font-medium text-foreground group-hover:underline">{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MailIcon className="size-5" />
                </span>
                <span className="font-medium text-foreground group-hover:underline">{email}</span>
              </a>
              <a
                href={web.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${web.label} (opens in new tab)`}
                className="group flex items-center gap-3"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GlobeIcon className="size-5" />
                </span>
                <span className="font-medium text-foreground group-hover:underline">{web.label}</span>
              </a>
            </div>
          </div>
          <div className="flex-1">
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[var(--shadow-soft)] sm:p-7"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight text-balance">
                  {formHeading}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formSubheading}
                </p>
              </div>
              {isSubmitted && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center transition-opacity duration-500",
                    showSuccess ? "opacity-100" : "opacity-0",
                  )}
                >
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {successMessage}
                  </p>
                </div>
              )}
              <FieldGroup className="gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          First Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Jordan"
                          className="bg-card"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Last Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Kim"
                          className="bg-card"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="you@company.com"
                        className="bg-card"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="subject"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Subject <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Question about blocks"
                        className="bg-card"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Message <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Tell us what you are building…"
                        rows={4}
                        className="bg-card"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <LoaderIcon className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {form.formState.isSubmitting ? submittingLabel : submitLabel}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Contact2 };
