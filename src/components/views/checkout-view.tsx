"use client";

import { useEffect, useState, type FormEvent } from "react";
import { formatPrice, useStore } from "@/lib/store";
import { COUNTRIES } from "@/lib/site-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type PaymentMethod = "card" | "upi" | "cod";

type PlacedOrderItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  price: number;
};

type PlacedOrder = {
  orderNumber: string;
  firstName: string;
  email: string;
  items: PlacedOrderItem[];
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentDetail: string;
  subtotal: number;
  total: number;
  promo: boolean;
};

const INPUT_CLS =
  "h-12 rounded-none border-stone-300 bg-white focus-visible:border-stone-900 focus-visible:ring-stone-900/20";
const LABEL_CLS = "text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500";
const SECTION_CLS = "space-y-6 border border-stone-200 p-6 md:p-8";
const SECTION_TITLE_CLS = "text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900";

const STEPS = ["Shipping", "Payment", "Confirmation"];

const PAYMENT_OPTIONS: { value: PaymentMethod; title: string; desc: string }[] = [
  {
    value: "card",
    title: "Card",
    desc: "Visa, Mastercard, American Express — pay securely online",
  },
  {
    value: "upi",
    title: "UPI",
    desc: "Pay from any UPI app using your UPI ID",
  },
  {
    value: "cod",
    title: "Cash on Delivery",
    desc: "Pay in cash when your order arrives",
  },
];

const scrollTop = () => {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    /* noop */
  }
};

const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export function CheckoutView() {
  const user = useStore((s) => s.user);
  const userReady = useStore((s) => s.userReady);
  const cartItems = useStore((s) => s.cartItems);
  const promoCode = useStore((s) => s.promoCode);
  const sessionId = useStore((s) => s.sessionId);
  const clearCart = useStore((s) => s.clearCart);
  const requireSignIn = useStore((s) => s.requireSignIn);
  const navigate = useStore((s) => s.navigate);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Contact + shipping
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Prefill contact fields from the signed-in user.
  useEffect(() => {
    if (!user) return;
    setName((n) => n || user.name);
    setEmail((e) => e || user.email);
    setCardName((c) => c || user.name);
  }, [user]);

  const subtotal = cartItems.reduce((n, i) => n + i.qty * i.product.price, 0);
  const total = promoCode ? subtotal * 0.9 : subtotal;

  if (!userReady) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  if (!user) {
    return <AuthPanel />;
  }

  // Step 3 — order confirmation
  if (step === 3 && placed) {
    return <Confirmation placed={placed} />;
  }

  // Empty bag guard (steps 1–2)
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-6 lg:px-10">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">Checkout</h1>
        <div className="py-28 text-center">
          <p className="font-display text-2xl">Your bag is empty</p>
          <p className="mt-2 text-sm text-stone-500">
            Beautiful things take up little space — but they do need a bag.
          </p>
          <button
            onClick={() => navigate({ name: "shop", title: "All Clothing" })}
            className="mt-8 border border-stone-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  function handleContinueToPayment() {
    if (!phone.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      toast({
        title: "Please fill in your contact and shipping details.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
    scrollTop();
  }

  async function handlePlaceOrder() {
    if (placing) return;
    if (!user) {
      requireSignIn();
      return;
    }
    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (digits.length !== 16 || !/^\d{2}\/\d{2}$/.test(cardExpiry) || cardCvv.length < 3) {
        toast({ title: "Please complete your card details.", variant: "destructive" });
        return;
      }
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast({ title: "Please enter your UPI ID.", variant: "destructive" });
      return;
    }

    const items: PlacedOrderItem[] = cartItems.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      image: i.product.images[0],
      size: i.size,
      color: i.color,
      qty: i.qty,
      price: i.product.price,
    }));
    const paymentDetail =
      paymentMethod === "card"
        ? `Card — Visa ending in ${cardNumber.replace(/\s/g, "").slice(-4)}`
        : paymentMethod === "upi"
          ? `UPI — ${upiId.trim()}`
          : "Cash on Delivery";

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: email.trim() || user.email,
          name: name.trim() || user.name,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country,
          paymentMethod,
          paymentDetail,
          subtotal,
          shipping: 0,
          total,
          sessionId,
        }),
      });
      if (res.status === 401) {
        requireSignIn();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.order) {
        toast({
          title: json.error ?? "Something went wrong placing your order.",
          variant: "destructive",
        });
        return;
      }
      setPlaced({
        orderNumber: json.order.orderNumber,
        firstName: (user.name ?? "").split(" ")[0] ?? "",
        email: email.trim() || user.email,
        items,
        name: name.trim() || user.name,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country,
        paymentDetail,
        subtotal,
        total,
        promo: Boolean(promoCode),
      });
      await clearCart();
      setStep(3);
      scrollTop();
      toast({ title: "Order placed — thank you." });
    } catch {
      toast({
        title: "Something went wrong placing your order.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-6 lg:px-10">
      <h1 className="font-display text-3xl tracking-tight md:text-4xl">Checkout</h1>

      {/* Step indicator */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
        {STEPS.map((label, idx) => {
          const n = idx + 1;
          const cls =
            n < step ? "text-[#5C6B4F]" : n === step ? "text-stone-900" : "text-stone-400";
          return (
            <span key={label} className={cls} aria-current={n === step ? "step" : undefined}>
              {n < step ? `✓ ${label}` : `0${n} — ${label}`}
            </span>
          );
        })}
        <button
          onClick={() => navigate({ name: "cart" })}
          className="ml-auto text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 underline transition hover:text-stone-900"
        >
          Return to Bag
        </button>
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Left — current step */}
        <div>
          {step === 1 ? (
            <div className="space-y-8">
              {/* Contact */}
              <section className={SECTION_CLS}>
                <h2 className={SECTION_TITLE_CLS}>Contact</h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Moreau"
                      autoComplete="name"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>Phone</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
              </section>

              {/* Shipping address */}
              <section className={SECTION_CLS}>
                <h2 className={SECTION_TITLE_CLS}>Shipping Address</h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>Address</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street and number, apartment, suite"
                      autoComplete="street-address"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className={LABEL_CLS}>City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        autoComplete="address-level2"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={LABEL_CLS}>Pin / Postal Code</Label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="560001"
                        autoComplete="postal-code"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger
                        className={`${INPUT_CLS} w-full [&>svg]:size-4`}
                        aria-label="Country"
                      >
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-stone-200">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c} className="rounded-none">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section className={SECTION_CLS}>
                <h2 className={SECTION_TITLE_CLS}>Payment Method</h2>
                <p className="text-sm text-stone-500">
                  Select the account you want to pay with.
                </p>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="gap-3"
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`flex cursor-pointer items-start gap-3 rounded-none border p-4 transition ${
                        paymentMethod === opt.value
                          ? "border-stone-900"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-xs text-stone-500">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {paymentMethod === "upi" && (
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>UPI ID</Label>
                    <Input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className={INPUT_CLS}
                    />
                  </div>
                )}
              </section>

              <button
                onClick={handleContinueToPayment}
                className="h-12 w-full bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <section className={SECTION_CLS}>
                <h2 className={SECTION_TITLE_CLS}>
                  {paymentMethod === "card"
                    ? "Card Details"
                    : paymentMethod === "upi"
                      ? "UPI Details"
                      : "Cash on Delivery"}
                </h2>
                {paymentMethod === "card" && (
                  <p className="text-sm text-stone-500">
                    Your card details are encrypted end to end.
                  </p>
                )}
                {paymentMethod === "cod" && (
                  <p className="text-sm text-stone-500">
                    Pay in cash when your order arrives.
                  </p>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className={LABEL_CLS}>Name on Card</Label>
                      <Input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="JANE MOREAU"
                        autoComplete="cc-name"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={LABEL_CLS}>Card Number</Label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        maxLength={19}
                        autoComplete="cc-number"
                        className={`${INPUT_CLS} tracking-[0.08em]`}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className={LABEL_CLS}>Expiry (MM/YY)</Label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="08/27"
                          inputMode="numeric"
                          maxLength={5}
                          autoComplete="cc-exp"
                          className={INPUT_CLS}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={LABEL_CLS}>Security Code</Label>
                        <Input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="3–4 digits"
                          inputMode="numeric"
                          maxLength={4}
                          autoComplete="cc-csc"
                          className={INPUT_CLS}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="space-y-2">
                    <Label className={LABEL_CLS}>UPI ID</Label>
                    <Input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className={INPUT_CLS}
                    />
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setStep(1);
                    scrollTop();
                  }}
                  className="h-12 flex-1 border border-stone-300 bg-transparent text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-900 transition hover:border-stone-900"
                >
                  Return to Shipping
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="h-12 flex-1 bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
                >
                  {placing ? "Placing Order…" : `Place Order — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — read-only order summary */}
        <SummaryAside items={cartItems} subtotal={subtotal} total={total} promo={promoCode} />
      </div>
    </div>
  );
}

/* ---------- Order summary (read-only, checkout) ---------- */

function SummaryAside({
  items,
  subtotal,
  total,
  promo,
}: {
  items: { id: string; qty: number; size: string; color: string; product: { id: string; name: string; images: string[]; price: number } }[];
  subtotal: number;
  total: number;
  promo: string | null;
}) {
  return (
    <aside className="h-fit border border-stone-200 p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-lg tracking-[0.1em]">ORDER SUMMARY</h2>
      <div className="thin-scrollbar mt-6 max-h-72 space-y-5 overflow-y-auto pr-1">
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-4">
            <div className="h-16 w-14 shrink-0 overflow-hidden bg-stone-100">
              <img
                alt={i.product.name}
                className="h-full w-full object-cover"
                src={i.product.images[0]}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">{i.product.name}</p>
              <p className="mt-0.5 text-xs text-stone-500">
                {i.color} · Size {i.size} · Qty {i.qty}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-stone-900">
              {formatPrice(i.product.price * i.qty)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Subtotal</span>
          <span className="text-stone-900">{formatPrice(subtotal)}</span>
        </div>
        {promo && (
          <div className="flex justify-between">
            <span className="text-stone-500">Promo — {promo}</span>
            <span className="text-[#5C6B4F]">−10%</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-500">Shipping</span>
          <span className="text-stone-900">Free</span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-stone-400">
          Or 4 interest-free payments of {formatPrice(Math.round((total / 4) * 100) / 100)}
        </p>
      </div>
      <p className="mt-6 border-t border-stone-100 pt-5 text-[11px] leading-relaxed text-stone-400">
        Secure 256-bit encrypted checkout · Free 30-day returns · 10-year repair guarantee
      </p>
    </aside>
  );
}

/* ---------- Step 3 — confirmation ---------- */

function Confirmation({ placed }: { placed: PlacedOrder }) {
  const navigate = useStore((s) => s.navigate);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const from = new Date();
  from.setDate(from.getDate() + 5);
  const to = new Date();
  to.setDate(to.getDate() + 7);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 md:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B08968]">
        Order Confirmed
      </p>
      <h1 className="mt-3 font-display text-3xl md:text-5xl">Thank you, {placed.firstName}.</h1>
      <p className="mt-4 text-sm text-stone-500">
        Order <strong className="font-semibold text-stone-900">{placed.orderNumber}</strong> is
        confirmed. A receipt has been sent to {placed.email}. Your pieces will be prepared and
        dispatched within two business days.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="border border-stone-200 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Arriving
          </p>
          <p className="mt-2 text-sm">
            {fmt(from)} – {fmt(to)}
          </p>
        </div>
        <div className="border border-stone-200 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Delivering To
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {placed.name}
            <br />
            {placed.address}
            <br />
            {placed.city} {placed.postalCode}
            <br />
            {placed.country}
          </p>
        </div>
        <div className="border border-stone-200 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Payment
          </p>
          <p className="mt-2 text-sm">{placed.paymentDetail}</p>
        </div>
      </div>

      <h2 className="mt-12 font-display text-xl tracking-[0.1em]">Your Order</h2>
      <div className="mt-4 divide-y divide-stone-100 border-y border-stone-100">
        {placed.items.map((item, idx) => (
          <div key={`${item.productId}-${idx}`} className="flex gap-4 py-4">
            <img
              src={item.image}
              alt={item.name}
              className="aspect-[3/4] w-16 shrink-0 bg-stone-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="mt-0.5 text-xs text-stone-500">
                {item.color} · Size {item.size} · Qty {item.qty}
              </p>
            </div>
            <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      <div className="ml-auto mt-5 max-w-xs space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Subtotal</span>
          <span>{formatPrice(placed.subtotal)}</span>
        </div>
        {placed.promo && (
          <div className="flex justify-between">
            <span className="text-stone-500">Promo — ATELIER10</span>
            <span className="text-[#5C6B4F]">−10%</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-stone-500">Shipping</span>
          <span className="text-[#5C6B4F]">Free</span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(placed.total)}</span>
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => navigate({ name: "home" })}
          className="border border-stone-900 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition hover:bg-stone-900 hover:text-white"
        >
          Continue Shopping
        </button>
        <p className="mt-6 text-center text-xs text-stone-400">
          Questions about your order? Write to us at care@ateliernoir.com with your order number.
        </p>
      </div>
    </div>
  );
}

/* ---------- Auth gate (sign in / create account) ---------- */

function AuthPanel() {
  const setUser = useStore((s) => s.setUser);
  const navigate = useStore((s) => s.navigate);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password || (mode === "register" && !name.trim())) {
      setError("Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email: email.trim(), password }
            : { name: name.trim(), email: email.trim(), password }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.user) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setUser(json.user);
      const first = String(json.user.name ?? "").split(" ")[0] ?? "";
      toast({
        title:
          mode === "login" ? `Welcome back, ${first}.` : `Welcome to Atelier Noir, ${first}.`,
      });
      const pending = useStore.getState().pendingRoute;
      if (pending) {
        useStore.setState({ pendingRoute: null });
        navigate(pending);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-14">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
        Atelier Noir
      </p>
      <h1 className="mt-3 text-center font-display text-3xl md:text-4xl">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      <p className="mt-3 text-center text-sm text-stone-500">
        {mode === "login"
          ? "Welcome back. Sign in to see your saved activity, wishlist and bag."
          : "One account for everything — your recently viewed pieces, wishlist and bag are kept in one place."}
      </p>

      <div className="mt-8 grid grid-cols-2 border border-stone-200">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
            mode === "login" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
            mode === "register" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {mode === "register" && (
          <div className="space-y-2">
            <Label className={LABEL_CLS}>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Moreau"
              autoComplete="name"
              className={INPUT_CLS}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label className={LABEL_CLS}>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLS}>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className={INPUT_CLS}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full bg-stone-900 text-[11px] font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        {error && <p className="mt-4 text-center text-sm text-[#9A3B26]">{error}</p>}
      </form>

      <p className="mt-6 text-center text-xs text-stone-400">
        Your email and password are kept private and are never shared.
      </p>
    </div>
  );
}
