export const STRIPE_PRICE_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID as string | undefined,
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID as string | undefined,
  premium_monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID as string | undefined,
  premium_yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID as string | undefined,
};

export async function createCheckoutSession(
  priceId: string, userId: string, userEmail: string,
): Promise<void> {
  const res = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId, userEmail }),
  });
  if (!res.ok) throw new Error('Failed to create checkout session');
  const { sessionId } = await res.json() as { sessionId: string };
  const { loadStripe } = await import('@stripe/stripe-js');
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string || '');
  if (!stripe) throw new Error('Stripe failed to load');
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw new Error(error.message);
}
