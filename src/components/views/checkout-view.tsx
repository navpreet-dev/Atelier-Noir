"use client";

import { Fragment, useState } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, useStore } from "@/lib/store";

type PaymentMethod = "card" | "upi" | "cod";

type PlacedOrderItem = {
  id: string;
  name: string;
  image: string | null;
  color: string;
  size: string;
  qty: number;
  price: number;
};

type PlacedOrder = {
  number: string;
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  paymentMethod: PaymentMethod;
  paymentDetail: string;
  estimatedMin: number;
  estimatedMax: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string | null;
  items: PlacedOrderItem[];
};

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Germany",
  "France",
  "Japan",
];

const PAYMENT_METHODS: { id: PaymentMethod; title: string; desc: string }[] = [
  {
    id: "card",
    title: "Card",
    desc: "Visa, Mastercard, American Express — pay securely online",
  },
  { id: "upi", title: "UPI", desc: "Pay from any UPI app using your UPI ID" },
  {
    id: "cod",
    title: "Cash on Delivery",
    desc: "Pay in cash when your order arrives",
  },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Card",
  upi: "UPI",
  cod: "Cash on Delivery",
};

const formatDate = (d: number | string | Date) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[#9A3B26]">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-stone-900">{children}</h2>;
}

const STEPS = [
  { num: "01", label: "Shipping" },
  { num: "02", label: "Payment" },
  { num: "03", label: "Confirmation" },
];

function StepIndicator({ step }: { step: number }) {
  const current = STEPS[step - 1];
  return (
    <Fragment>
      <p className="text-[10px] tracking-[0.22em] text-stone-400 uppercase sm:hidden">
        <span className="font-semibold text-stone-900">{current.num}</span> / 03 —{" "}
        <span className="font-semibold text-stone-900">{current.label}</span>
      </p>
      <div className="hidden items-center gap-3 sm:flex sm:gap-5">
        {STEPS.map((s, idx) => {
          const state = idx + 1 < step ? "done" : idx + 1 === step ? "current" : "todo";
          return (
            <Fragment key={s.num}>
              {idx > 0 && <span aria-hidden className="h-px w-12 bg-stone-200" />}
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={`whitespace-nowrap text-[11px] tracking-[0.22em] uppercase ${
                  state === "todo" ? "text-stone-400" : "text-stone-900"
                }`}
              >
                <span className="font-semibold">{s.num}</span>
                <span className={state === "current" ? "font-semibold" : " font-normal"}>
                  {" "}
                  — {s.label}
                </span>
              </span>
            </Fragment>
          );
        })}
      </div>
    </Fragment>
  );
}

function OrderSummary({ promoCode, total }: { promoCode: string | null; total: number }) {
  const cartItems = useStore((s) => s.cartItems);
  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const discount = promoCode ? Math.round(0.1 * subtotal * 100) / 100 : 0;
  const shipping = cartItems.length === 0 || subtotal - discount >= 150 ? 0 : 8;

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <div className="border border-stone-200 p-7">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em]">Order Summary</h2>

        <div className="mt-6 max-h-72 space-y-5 overflow-y-auto pr-1">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-stone-100">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">{item.product.name}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {item.color} · Size {item.size} · Qty {item.qty}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-stone-900">
                {formatPrice(item.product.price * item.qty)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Subtotal</span>
            <span className="text-stone-900">{formatPrice(subtotal)}</span>
          </div>
          {promoCode && (
            <div className="flex justify-between text-[#5C6B4F]">
              <span>
                Promo {promoCode} (−10%)
              </span>
              <span>−{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Shipping</span>
            <span className="text-stone-900">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-stone-400">
            Or 4 interest-free payments of {formatPrice(Math.round(total / 4))}
          </p>
        </div>

        <p className="mt-6 border-t border-stone-100 pt-5 text-[11px] leading-relaxed text-stone-400">
          Secure 256-bit encrypted checkout · Free 30-day returns · 10-year repair guarantee
        </p>
      </div>
    </aside>
  );
}

export function CheckoutView() {
  const cartItems = useStore((s) => s.cartItems);
  const user = useStore((s) => s.user);
  const promoCode = useStore((s) => s.promoCode);
  const clearPromo = useStore((s) => s.clearPromo);
  const hydrateCart = useStore((s) => s.hydrateCart);
  const navigate = useStore((s) => s.navigate);
  const sessionId = useStore((s) => s.sessionId);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState("forward");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState(user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const discount = promoCode ? Math.round(0.1 * subtotal * 100) / 100 : 0;
  const shipping = cartItems.length === 0 || subtotal - discount >= 150 ? 0 : 8;
  const total = Math.max(0, subtotal - discount + shipping);

  const placeOrder = async () => {
    if (placing) return;
    const errs: Record<string, string> = {};
    if (paymentMethod === "card") {
      if (cardName.trim().length < 2) errs.cardName = "Please enter the name on your card.";
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 15 || digits.length > 16)
        errs.cardNumber = "Please enter a valid card number.";
      const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(cardExpiry.trim());
      if (m) {
        if (new Date(2000 + Number(m[2]), Number(m[1]), 1) <= new Date())
          errs.cardExpiry = "This card has expired.";
      } else {
        errs.cardExpiry = "Use MM/YY format.";
      }
      const cvv = cardCvv.replace(/\D/g, "");
      if (cvv.length < 3 || cvv.length > 4) errs.cardCvv = "Please enter the 3–4 digit code.";
    } else if (paymentMethod === "upi" && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      errs.upiId = "Enter a valid UPI ID (name@bank).";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPlacing(true);
    try {
      const paymentDetail =
        paymentMethod === "card"
          ? `Visa ending in ${cardNumber.replace(/\D/g, "").slice(-4)}`
          : paymentMethod === "upi"
            ? upiId.trim()
            : "";
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          promoCode: promoCode ?? undefined,
          name,
          email,
          phone,
          address,
          city,
          postalCode,
          country,
          paymentMethod,
          cardName,
          cardNumber,
          cardExpiry,
          cardCvv,
          upiId,
          items: cartItems.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            image: i.product.images[0],
            size: i.size,
            color: i.color,
            qty: i.qty,
            price: i.product.price,
          })),
          subtotal,
          shipping,
          total,
          paymentDetail,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Could not place your order. Please check your details and try again.");
        return;
      }
      const o = json.order ?? {};
      const now = Date.now();
      setOrder({
        number: o.orderNumber ?? o.number ?? "",
        email: o.email ?? email,
        name: o.name ?? name,
        address: o.address ?? address,
        city: o.city ?? city,
        state: o.state ?? "",
        postalCode: o.postalCode ?? postalCode,
        country: o.country ?? country,
        phone: o.phone ?? phone,
        paymentMethod: (o.paymentMethod ?? paymentMethod) as PaymentMethod,
        paymentDetail: o.paymentDetail ?? paymentDetail,
        estimatedMin: o.estimatedMin ?? now + 5 * 86400000,
        estimatedMax: o.estimatedMax ?? now + 7 * 86400000,
        subtotal: typeof o.subtotal === "number" ? o.subtotal : subtotal,
        discount: typeof o.discount === "number" ? o.discount : discount,
        shipping: typeof o.shipping === "number" ? o.shipping : shipping,
        total: typeof o.total === "number" ? o.total : total,
        promoCode: o.promoCode ?? promoCode ?? null,
        items: (Array.isArray(o.items) ? o.items : []).map(
          (it: Record<string, unknown>, idx: number) => ({
            id: String(it.id ?? idx),
            name: String(it.name ?? ""),
            image: (it.image as string | null) ?? null,
            color: String(it.color ?? ""),
            size: String(it.size ?? ""),
            qty: Number(it.qty ?? 0),
            price: Number(it.price ?? 0),
          })
        ),
      });
      clearPromo();
      await hydrateCart();
      setDir("forward");
      setStep(3);
      setDialogOpen(true);
      scrollToTop();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length !== 0 || order) {
    if (step === 3 && order) {
      return (
        <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl">
            <div className="pt-14 text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#5C6B4F] uppercase">
                Order Confirmed
              </p>
              <h1 className="mt-3 font-display text-3xl tracking-tight text-stone-900 md:text-4xl">
                Thank you, {order.name.split(" ")[0]}.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-stone-500">
                Order <strong className="font-semibold text-stone-900">{order.number}</strong> is
                confirmed. A receipt has been sent to {order.email}. Your pieces will be prepared
                and dispatched within two business days.
              </p>
            </div>

            <div className="mt-10 divide-y divide-stone-100 border border-stone-200">
              <div className="grid gap-1 px-6 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">
                  Arriving
                </p>
                <p className="text-sm text-stone-800">
                  {formatDate(order.estimatedMin)} – {formatDate(order.estimatedMax)}
                </p>
              </div>
              <div className="grid gap-1 px-6 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">
                  Delivering to
                </p>
                <p className="text-sm leading-relaxed text-stone-800">
                  {order.name}
                  <br />
                  {order.address}
                  <br />
                  {[order.city, order.state].filter(Boolean).join(", ")} {order.postalCode}
                  <br />
                  {order.country} · {order.phone}
                </p>
              </div>
              <div className="grid gap-1 px-6 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">
                  Payment
                </p>
                <p className="text-sm text-stone-800">
                  {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  {order.paymentDetail ? ` — ${order.paymentDetail}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.3em] text-stone-900">
                Your Order
              </h2>
              <div className="mt-4 divide-y divide-stone-100 border-y border-stone-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-5 py-5">
                    <div className="aspect-[3/4] w-16 shrink-0 overflow-hidden bg-stone-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-stone-100" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {item.color} · Size {item.size} · Qty {item.qty}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 ml-auto max-w-xs space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-900">{formatPrice(order.subtotal)}</span>
                </div>
                {order.promoCode && (
                  <div className="flex justify-between text-[#5C6B4F]">
                    <span>
                      Promo {order.promoCode} (−10%)
                    </span>
                    <span>−{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-stone-900">
                    {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => navigate({ name: "shop", title: "All Clothing" })}
                className="w-full bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 sm:w-auto sm:px-16"
              >
                Continue Shopping
              </button>
              <p className="mt-5 text-[11px] leading-relaxed text-stone-400">
                Questions about your order? Write to us at care@ateliernoir.com with your order
                number.
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="rounded-none sm:max-w-md">
              <DialogTitle className="sr-only">Order placed</DialogTitle>
              <div className="py-3 text-center">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[#5C6B4F] uppercase">
                  Order Placed
                </p>
                <h3 className="mt-3 font-display text-2xl text-stone-900">
                  Thank you, {order.name.split(" ")[0]}.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Your order <strong className="font-semibold text-stone-900">{order.number}</strong>{" "}
                  has been placed successfully. A receipt is on its way to {order.email}.
                </p>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="mt-7 w-full bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
                >
                  View Order
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
        <h1 className="pt-10 font-display text-3xl tracking-tight md:text-4xl">Checkout</h1>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <StepIndicator step={step} />
          <button
            onClick={() => navigate({ name: "cart" })}
            className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase underline underline-offset-4 transition hover:text-stone-900"
          >
            Return to Bag
          </button>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div
            key={step}
            className={dir === "forward" ? "animate-page-turn-forward" : "animate-page-turn-back"}
          >
            {step === 1 ? (
              <div className="space-y-10">
                <section className="space-y-5">
                  <SectionHeading>Contact</SectionHeading>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="checkout-name" label="Full Name" error={errors.name}>
                      <Input
                        id="checkout-name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Moreau"
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                    <Field id="checkout-email" label="Email" error={errors.email}>
                      <Input
                        id="checkout-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                  </div>
                  <Field id="checkout-phone" label="Phone" error={errors.phone}>
                    <Input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      maxLength={20}
                      className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                    />
                  </Field>
                </section>

                <section className="space-y-5">
                  <SectionHeading>Shipping Address</SectionHeading>
                  <Field id="checkout-address" label="Address" error={errors.address}>
                    <Input
                      id="checkout-address"
                      autoComplete="address-line1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat, house no., building, street, landmark"
                      className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="checkout-city" label="City" error={errors.city}>
                      <Input
                        id="checkout-city"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                    <Field id="checkout-postal" label="PIN / Postal Code" error={errors.postal}>
                      <Input
                        id="checkout-postal"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="400001"
                        maxLength={10}
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                  </div>
                  <Field id="checkout-country" label="Country" error={errors.country}>
                    <select
                      id="checkout-country"
                      autoComplete="country-name"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-11 w-full rounded-none border border-stone-300 bg-white px-3 text-[15px] text-stone-900 outline-none transition focus:border-stone-900"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </section>

                <section className="space-y-5">
                  <SectionHeading>Payment Method</SectionHeading>
                  <p className="-mt-2 text-sm text-stone-500">
                    Select the account you want to pay with.
                  </p>
                  <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                    {PAYMENT_METHODS.map((pm) => {
                      const selected = paymentMethod === pm.id;
                      return (
                        <label
                          key={pm.id}
                          className={`flex cursor-pointer items-start gap-3.5 border px-5 py-4 transition-colors ${
                            selected
                              ? "border-stone-900 bg-stone-50"
                              : "border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={pm.id}
                            checked={selected}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-stone-900" : "border-stone-400"
                            }`}
                          >
                            {selected && <span className="h-2 w-2 rounded-full bg-stone-900" />}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-stone-900">
                              {pm.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                              {pm.desc}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <button
                  onClick={() => {
                    const errs: Record<string, string> = {};
                    if (name.trim().length < 2) errs.name = "Please enter your full name.";
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
                      errs.email = "Please enter a valid email address.";
                    if (phone.replace(/\D/g, "").length < 7)
                      errs.phone = "Please enter a valid phone number.";
                    if (address.trim().length < 4) errs.address = "Please enter your street address.";
                    if (city.trim().length < 2) errs.city = "Please enter your city.";
                    if (postalCode.replace(/\D/g, "").length < 4)
                      errs.postal = "Please enter a valid postal code.";
                    if (!country) errs.country = "Please select your country.";
                    setErrors(errs);
                    if (Object.keys(errs).length === 0) {
                      setDir("forward");
                      setStep(2);
                      scrollToTop();
                    }
                  }}
                  className="w-full bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div>
                  <SectionHeading>
                    {paymentMethod === "card"
                      ? "Card Details"
                      : paymentMethod === "upi"
                        ? "UPI Details"
                        : "Cash on Delivery"}
                  </SectionHeading>
                  <p className="mt-2 text-sm text-stone-500">
                    {paymentMethod === "card" && "Your card details are encrypted end to end."}
                    {paymentMethod === "upi" && "A payment request will be sent to this UPI ID."}
                    {paymentMethod === "cod" &&
                      "Pay the full amount in cash when your order is handed to you."}
                  </p>
                </div>

                {paymentMethod === "card" && (
                  <section className="space-y-5">
                    <Field id="checkout-card-name" label="Name on Card" error={errors.cardName}>
                      <Input
                        id="checkout-card-name"
                        autoComplete="cc-name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="JANE MOREAU"
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                    <Field id="checkout-card-number" label="Card Number" error={errors.cardNumber}>
                      <Input
                        id="checkout-card-number"
                        autoComplete="cc-number"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
                          )
                        }
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="h-11 rounded-none border-stone-300 text-[15px] tracking-[0.08em] focus-visible:ring-stone-900"
                      />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="checkout-card-expiry"
                        label="Expiry (MM/YY)"
                        error={errors.cardExpiry}
                      >
                        <Input
                          id="checkout-card-expiry"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setCardExpiry(
                              digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`
                            );
                          }}
                          placeholder="08/27"
                          maxLength={5}
                          className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                        />
                      </Field>
                      <Field id="checkout-card-cvv" label="Security Code" error={errors.cardCvv}>
                        <Input
                          id="checkout-card-cvv"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="3–4 digits"
                          maxLength={4}
                          className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                        />
                      </Field>
                    </div>
                  </section>
                )}

                {paymentMethod === "upi" && (
                  <section className="space-y-5">
                    <Field id="checkout-upi" label="UPI ID" error={errors.upiId}>
                      <Input
                        id="checkout-upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okbank"
                        className="h-11 rounded-none border-stone-300 text-[15px] focus-visible:ring-stone-900"
                      />
                    </Field>
                  </section>
                )}

                {paymentMethod === "cod" && (
                  <div className="border border-stone-200 bg-stone-50 px-6 py-5 text-sm leading-relaxed text-stone-700">
                    You will pay{" "}
                    <strong className="font-semibold text-stone-900">{formatPrice(total)}</strong>{" "}
                    in cash when your order arrives. Please keep the exact amount ready — our
                    delivery partner carries a card machine as a backup.
                  </div>
                )}

                <div className="space-y-5 border-t border-stone-100 pt-8">
                  <button
                    onClick={() => {
                      setErrors({});
                      setDir("back");
                      setStep(1);
                      scrollToTop();
                    }}
                    className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:text-stone-900"
                  >
                    <ArrowLeft size={15} /> Return to Shipping
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full bg-stone-900 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
                  >
                    {placing ? "Processing…" : `Place Order — ${formatPrice(total)}`}
                  </button>
                  <p className="text-center text-[11px] text-stone-400">
                    By placing your order you agree to our terms and return policy.
                  </p>
                </div>
              </div>
            )}
          </div>

          <OrderSummary promoCode={promoCode} total={total} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 md:px-6 lg:px-10">
      <h1 className="pt-10 font-display text-3xl tracking-tight md:text-4xl">Checkout</h1>
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <ShoppingBag size={52} strokeWidth={1} className="text-stone-300" />
        <p className="mt-6 font-display text-2xl text-stone-900">Your bag is empty</p>
        <p className="mt-2 max-w-sm text-sm text-stone-500">
          Add a piece to your bag to continue to checkout.
        </p>
        <button
          onClick={() => navigate({ name: "shop", title: "All Clothing" })}
          className="mt-8 bg-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-stone-700"
        >
          Explore the Collection
        </button>
      </div>
    </div>
  );
}
