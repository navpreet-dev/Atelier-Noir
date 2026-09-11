"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { CONTACT_CHANNELS, CONTACT_SUBJECTS } from "@/lib/site-data";

/* Shared strings from the original build. */
const CX = "text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400";
const CF = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

const CHANNEL_ICONS = [MapPin, Mail, Phone, Clock];

const FIELD_CLASSES =
  "rounded-none border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus-visible:border-stone-900 focus-visible:ring-stone-900/20";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

export function ContactView() {
  const navigate = useStore((s) => s.navigate);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);

  const setField = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.name.trim() && form.email.trim() && form.message.trim()) {
      setSending(true);
      window.setTimeout(() => {
        setSending(false);
        toast.success("Message sent — we reply within one business day", {
          description: `A confirmation will arrive at ${form.email}.`,
        });
        setForm(EMPTY_FORM);
      }, 600);
    } else {
      toast.error("Please fill in your name, email and message.");
    }
  };

  return (
    <div>
      {/* Intro header */}
      <header className={`${CF} pb-12 pt-14 text-center md:pb-16 md:pt-20`}>
        <p className={`${CX} text-[#B08968]`}>Contact</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight tracking-tight text-stone-900 md:text-6xl">
          We&apos;re here to help
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-500 md:text-[15px]">
          Questions about an order, a fit, or a repair? Write to us — a human, not a bot, will
          answer.
        </p>
      </header>

      <section className={`${CF} pb-20 md:pb-28`}>
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Channels */}
          <div className="space-y-5 lg:col-span-2">
            {CONTACT_CHANNELS.map((channel, i) => {
              const Icon = CHANNEL_ICONS[i] ?? MapPin;
              return (
                <div
                  key={channel.label}
                  className="flex gap-5 border border-stone-200 bg-white p-5 transition-colors hover:border-stone-900 md:p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
                    <Icon size={18} strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className={`${CX} text-[#B08968]`}>{channel.label}</p>
                    {channel.lines.map((line, j) => (
                      <p
                        key={line}
                        className={`mt-1 text-sm ${
                          j === 0 ? "font-medium text-stone-900" : "text-stone-500"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => navigate({ name: "faq" })}
              className="flex w-full items-center justify-between gap-4 border border-dashed border-stone-300 bg-stone-50 p-5 text-left transition-colors hover:border-stone-900 md:p-6"
              aria-label="Browse frequently asked questions"
            >
              <div>
                <p className={`${CX} text-[#B08968]`}>Quick Answers</p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  Shipping, returns, sizing &amp; repairs — answered instantly.
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-stone-400" aria-hidden />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-3" noValidate>
            <div className="border border-stone-200 p-6 md:p-10">
              <p className={CX}>Write to us</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight text-stone-900 md:text-3xl">
                Send a message
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={`${CX} mb-2 block`}>
                    Name *
                  </label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setField("name")(e.target.value)}
                    placeholder="Your full name"
                    className={`h-12 ${FIELD_CLASSES}`}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={`${CX} mb-2 block`}>
                    Email *
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email")(e.target.value)}
                    placeholder="you@example.com"
                    className={`h-12 ${FIELD_CLASSES}`}
                    autoComplete="email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-subject" className={`${CX} mb-2 block`}>
                    Subject
                  </label>
                  <Select value={form.subject} onValueChange={setField("subject")}>
                    <SelectTrigger
                      id="contact-subject"
                      className={`h-12 w-full ${FIELD_CLASSES}`}
                      aria-label="Message subject"
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-stone-200">
                      {CONTACT_SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className={`${CX} mb-2 block`}>
                    Message *
                  </label>
                  <Textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => setField("message")(e.target.value)}
                    placeholder="How can we help?"
                    rows={6}
                    className={`resize-none ${FIELD_CLASSES}`}
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-relaxed text-stone-400">
                  By sending, you agree to our privacy policy. We never share your details.
                </p>
                <Button
                  type="submit"
                  disabled={sending}
                  className="h-12 shrink-0 rounded-none bg-stone-900 px-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-stone-700"
                >
                  {sending ? "Sending…" : "Send Message"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
