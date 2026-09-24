---
name: cookie-consent-compliance
description: GDPR/ePrivacy/CCPA-compliant cookie consent checklist and implementation patterns. Use whenever building or reviewing a cookie banner, consent management platform (CMP), analytics/ads tag loading (GA4, Meta Pixel, GTM), or any script that sets non-essential cookies/trackers on a website. Prevents the kind of dark-pattern consent banner that got SHEIN fined €150M by CNIL in 2023 (non-essential cookies fired before consent, "Reject" buried behind extra clicks vs one-click "Accept").
metadata:
  tags: privacy, gdpr, cookies, consent, compliance, ccpa, web
---

## When to use

Load this before writing or reviewing any of:
- A cookie/consent banner component
- Code that loads Google Analytics, GTM, Meta/TikTok/LinkedIn pixels, or any ad/analytics SDK
- A "Cookie Settings" or privacy preferences page
- Any `<script>` tag pulling in a third-party tracker

## The failure mode this prevents

Regulators (CNIL, ICO, DPAs across the EU) don't just check "is there a banner" — they check *behavior*. The two violations that most commonly draw large fines (SHEIN: €150M, Amazon: €746M, Google: €150M, etc.):

1. **Non-essential cookies fire before the user consents** (or even after they click "Reject"). A banner that's purely cosmetic while GA/Meta Pixel loads on page load regardless of the click is the single most common and most heavily fined pattern.
2. **Asymmetric friction**: "Accept All" is one big colorful button; "Reject All" is missing, greyed out, or buried inside a "Manage preferences" sub-menu that takes 2-3 extra clicks. Consent obtained this way is legally invalid (not "freely given") even if the banner is technically present.

A banner that exists but doesn't gate scripts, or that makes rejecting harder than accepting, provides **zero legal protection** — it's often worse than no banner because it demonstrates the site knew the rules and circumvented them.

## Implementation checklist

- [ ] **Nothing non-essential fires before consent.** Strictly necessary cookies (session, CSRF, load balancing, cart) are the only ones allowed pre-consent. Analytics, ads, personalization, and social-embed cookies must be blocked until opt-in.
- [ ] **Reject is one click, same prominence as Accept.** Same button size/style/step-depth as "Accept All". Never hide reject behind a sub-menu, never grey it out, never use confirm-shaming copy ("No thanks, I don't want savings").
- [ ] **No pre-ticked boxes.** Every non-essential category defaults to OFF.
- [ ] **Granular categories**, not just all-or-nothing: Necessary / Functional / Analytics / Marketing (at minimum), each independently toggleable.
- [ ] **Consent is actually enforced in code**, not just recorded. Gate every tracker behind the real consent state — see pattern below.
- [ ] **Withdrawing consent is as easy as giving it.** Persistent "Cookie Settings" link/footer button that reopens the same granular panel.
- [ ] **Consent is logged** (timestamp, categories accepted, banner version) so you can prove compliance if audited.
- [ ] **Re-prompt on change**: if you add a new tracker/purpose or change vendors, treat existing consent as stale and re-ask.
- [ ] **No dark patterns**: no countdown timers pressuring a click, no color contrast that makes reject invisible, no interstitial that blocks the page until "Accept All" is clicked (that's coercion, not consent).

## Code pattern: gate scripts behind consent, don't just show a banner

Never let a `<script src="https://www.googletagmanager.com/...">` or pixel snippet sit directly in the page `<head>`. Load it only after consent:

```html
<!-- WRONG: fires unconditionally regardless of banner state -->
<script src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>

<!-- RIGHT: inert until consent is granted -->
<script type="text/plain" data-consent="analytics" data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
```

```js
function applyConsent(consent) {
  // consent = { necessary: true, functional: bool, analytics: bool, marketing: bool }
  localStorage.setItem('consent', JSON.stringify({ ...consent, ts: Date.now(), version: BANNER_VERSION }));

  document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(tag => {
    const category = tag.dataset.consent;
    if (consent[category]) {
      const real = document.createElement('script');
      real.src = tag.dataset.src;
      tag.replaceWith(real);
    }
  });
}

function onRejectAll() {
  applyConsent({ necessary: true, functional: false, analytics: false, marketing: false });
}

function onAcceptAll() {
  applyConsent({ necessary: true, functional: true, analytics: true, marketing: true });
}
```

For Google's own stack, use **Consent Mode v2** (`gtag('consent', 'default', {...})` set to `denied` before GA/Ads loads, then `gtag('consent', 'update', {...})` on the user's actual choice) instead of hand-rolling gating for Google tags specifically.

## Off-the-shelf CMPs

For anything beyond a hobby project, prefer a maintained consent management platform over a hand-rolled banner — they keep up with regulatory changes automatically:
- **Klaro** (open source, self-hosted, framework-agnostic)
- **Cookiebot**, **Osano**, **OneTrust** (hosted, IAB TCF-compliant, good for ad-heavy sites)
- **react-cookie-consent** / **vanilla-cookieconsent** for simpler React/vanilla setups — but you still must wire the gating logic above; the library only renders the UI.

## Quick self-audit before shipping

1. Open the site in an incognito window with DevTools → Network → filter by `google-analytics|gtag|facebook|doubleclick|hotjar` etc.
2. Load the page *without* clicking anything. Confirm **zero** requests to those domains.
3. Click "Reject All". Reload. Confirm still zero requests.
4. Click "Accept All" (or toggle Analytics on). Confirm requests now appear.
5. Check `document.cookie` before/after each step for the same pattern.

If step 2 or 3 shows tracker requests, the implementation is non-compliant regardless of what the banner UI looks like.
