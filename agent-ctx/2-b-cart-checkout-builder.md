# Task 2-b — cart-checkout-builder — Work Record

Task ID: 2-b
Agent: cart-checkout-builder
Task: Cart, Checkout, Wishlist, Account views

## Files created (only these four; nothing else modified)
- `src/components/views/cart-view.tsx`
- `src/components/views/checkout-view.tsx`
- `src/components/views/wishlist-view.tsx`
- `src/components/views/account-view.tsx`

## Shared APIs consumed (read-only)
- `@/lib/store`: cartItems, updateQty, removeFromCart, promoCode, applyPromoCode, clearPromo,
  clearCart, user, userReady, setUser, requireSignIn, signOut, navigate, pendingRoute
  (read via `useStore.getState()`; cleared via `useStore.setState({ pendingRoute: null })`),
  sessionId, toggleWishlist, addToCart, formatPrice
- `@/lib/site-data`: COUNTRIES (checkout country Select)
- `@/hooks/use-toast`: toast (success + variant:"destructive" errors)
- shadcn/ui: input, label, radio-group, select

## What was built

### CartView (checkout.clean.html cart page)
- h1 "Shopping Bag (n)" (n = summed qty), Truck banner "complimentary carbon-neutral shipping",
  item rows (image → product, name → product, color/size line, "Ships in 1–2 business days",
  Trash2 remove → removeFromCart, Minus/Plus stepper → updateQty, line total + "{price} each").
- Grid `lg:grid-cols-[1fr_380px]`, aside sticky: ORDER SUMMARY rows (Subtotal, −10% promo row when
  applied, Shipping Free, Total = subtotal×0.9 with promo), PROMO CODE input (placeholder
  ATELIER10) + Apply → applyPromoCode; toasts "Promo applied — 10% off." / "Invalid promo code.";
  applied state shows "ATELIER10 — 10% off" with X → clearPromo.
- BUY NOW → no-op on empty bag, requireSignIn() gate, then navigate checkout.
  "Taxes included. Shipping calculated at checkout." footnote. Empty-bag state per spec.

### CheckoutView (auth + 3 steps + confirmation)
- Auth gate when `!user && userReady`: centered card (ATELIER NOIR eyebrow, Sign In / Create
  Account tab row, labels/inputs per spec, POST /api/auth/login | /api/auth/register, inline error
  line `text-[#9A3B26]`, welcome toasts with first name; on success navigates to
  `pendingRoute` if set — clearing it — else continues into checkout).
- Step indicator 01 — SHIPPING / 02 — PAYMENT / 03 — CONFIRMATION (✓ green for completed),
  RETURN TO BAG link → cart.
- Step 1: CONTACT (name/email prefilled from user, phone), SHIPPING ADDRESS (address, city,
  postal, country Select over COUNTRIES default India), PAYMENT METHOD RadioGroup
  card/upi/cod with descriptions, UPI ID input when upi. Continue validates
  phone/address/city/postal → toast "Please fill in your contact and shipping details."
- Step 2: Card fields (card number auto-grouped 4s maxLength 19, expiry auto MM/YY maxLength 5,
  CVV password maxLength 4) / UPI ID / COD note. Place Order — {total}: card validation
  (16 digits + MM/YY + CVV≥3) → toast "Please complete your card details."; POST /api/orders
  with items snapshot, contact, address, paymentMethod, paymentDetail ("Card — Visa ending in
  XXXX" | "UPI — id" | "Cash on Delivery"), subtotal, shipping 0, total (promo-discounted),
  sessionId. 401 → requireSignIn(); 201 → snapshot placed order, clearCart(), step 3, toast.
- Step 3 confirmation per order-confirm dump: ORDER CONFIRMED eyebrow (#B08968), "Thank you, {first}.",
  order number + receipt copy, ARRIVING (+5/+7 days, "Wed, Sep 16 – Fri, Sep 18" en-US),
  DELIVERING TO (name/address/city postal/country), PAYMENT, Your Order item list with images,
  totals (incl. −10% row when promo was applied), CONTINUE SHOPPING → home, care email footnote.
- Empty-bag guard for steps 1–2.

### WishlistView (wishlist.clean.html)
- Centered header (SAVED PIECES eyebrow #B08968, Wishlist, subtitle), empty state with
  EXPLORE THE COLLECTION → shop; item grid `sm:grid-cols-2 lg:grid-cols-4`, card image/name →
  product, MOVE TO BAG → requireSignIn → GET /api/products/{slug} → addToCart(first size,
  first color or "default") → toggleWishlist removes item (toasts on failure); Heart button
  aria-label "Remove {name} from wishlist" → toggleWishlist off.

### AccountView (account-page.clean.html + auth.clean.html)
- Auth gate identical to checkout (shared markup duplicated in-file); on success honors
  pendingRoute (navigates back and clears it).
- Signed in: MY ACCOUNT eyebrow (#B08968), "Welcome back, {first}" + SIGN OUT (signOut →
  toast "Signed out."), ACCOUNT DETAILS dl (NAME / EMAIL / MEMBER SINCE via
  `toLocaleDateString en-US {month:"long",year:"numeric"}`), quick links grid
  (WISHLIST → wishlist, SHOPPING BAG → cart) with Heart/ShoppingBag icons,
  RECENT ACTIVITY: GET /api/account/activity (401 → empty, keyed by user id so a stale
  list never shows), humanized types (order_placed/wishlist_added/wishlist_removed/
  product_viewed/account_created, raw fallback), "AN-" order meta appended, date on the
  right; empty copy "No activity yet — explore the collection."

## Verification
- `bunx tsc --noEmit`: zero errors in the four files (remaining project errors are in other
  agents' in-progress files: page.tsx imports of missing views, home-view readonly category,
  examples/, skills/).
- `bun run lint`: only remaining error is `src/components/site/search-dialog.tsx`
  (react-hooks/set-state-in-effect) — another agent's file, left untouched. My four files pass.
- dev.log 500 on `/` is caused by page.tsx importing not-yet-created views (shop-view,
  product-view, …) from task 2-a/2-c — my views compile clean and will render once those land.

## Notes for next agents
- Checkout step-2 box heading adapts to method: "Card Details" / "UPI Details" /
  "Cash on Delivery" (spec only pinned the card case).
- Spec's cart banner class read as `mb-6 …` inside the grid's left column to match
  checkout.clean.html exactly (grid carries the `mt-10`).
- AuthPanel markup is duplicated (not shared) in checkout-view.tsx and account-view.tsx to keep
  each file self-contained per task constraints.
