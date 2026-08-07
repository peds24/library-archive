import { Image } from 'react-native';

// A real book cover is portrait and never far off ~0.65 w/h. These bounds are wide
// enough for square-ish art and tall mass-market paperbacks, but reject the two
// degenerate images the upstream APIs are known to serve (see `isUsableCover`).
const MIN_ASPECT = 0.4;
const MAX_ASPECT = 1.1;
const MIN_WIDTH = 100;

// Google's cover renderer, which serves both real artwork and its stand-in. Two
// paths reach it: `/books/content` for ordinary volumes and `/books/publisher/content`
// for publisher-supplied scans.
const GOOGLE_CONTENT_URL = /books\.google\.com\/books\/(publisher\/)?content/;

/**
 * Detects Google's grey "image not available" card.
 *
 * Google only re-renders a cover at raised zoom for volumes it has actually
 * scanned. For a metadata-only volume — which is most of what scanning a real
 * shelf turns up — every zoom except 1 and 5 returns a placeholder card instead,
 * and it 200s like anything else. Measured on volume 1Iul0QEACAAJ:
 *
 *   zoom=1  128x192   JPEG   the real cover
 *   zoom=2  300x391   PNG    placeholder
 *   zoom=3  575x750   PNG    placeholder
 *   zoom=4  800x1043  PNG    placeholder
 *   zoom=6  1280x1670 PNG    placeholder
 *
 * Every one of those is aspect ~0.767 and well over the width floor, so the
 * dimension checks below cannot see it — the app was storing the placeholder and
 * never falling through to the sources that had the real art. The content type is
 * the reliable tell: Google renders real covers as JPEG and the card as PNG.
 *
 * Scoped to Google's own URLs, so a legitimately-PNG cover from anywhere else
 * (including one the user types in by hand) is left alone.
 */
async function isGooglePlaceholder(url: string): Promise<boolean> {
  if (!GOOGLE_CONTENT_URL.test(url)) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return (res.headers.get('content-type') ?? '').includes('png');
  } catch {
    // Can't tell — let the dimension checks decide rather than dropping a
    // candidate that might be fine.
    return false;
  }
}

/**
 * Rewrites Google's `imageLinks.thumbnail` URL to a usable size.
 *
 * What Google returns is a ~128px-wide preview carrying a `zoom=1` param; at the
 * 144×208pt the app renders covers at, that is badly soft on a 3x screen. Raising
 * the zoom re-renders it server-side — measured on a real volume:
 *   zoom=1 → 128×229    zoom=2 → 300×537    zoom=3 → 575×1030
 *   zoom=4 → 800×1433   zoom=0/6 → 1256×2250 (277 KB — far more than needed)
 * zoom=3 is the smallest step that comfortably exceeds the render size.
 *
 * `edge=curl` is stripped because it overlays a fake page-curl on the artwork.
 */
export function googleCoverAtZoom(thumbnail: string, zoom: number): string {
  if (!thumbnail) return '';
  return thumbnail
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/g, '')
    .replace(/([?&])zoom=\d+/, `$1zoom=${zoom}`);
}

// Open Library's ISBN-keyed CDN answers 200 with a 1×1 blank when it has no scan
// for a book; `default=false` makes it 404 instead, so a failed load is detectable.
export function openLibraryCoverByISBN(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

/**
 * Loads a candidate's dimensions and decides whether it's a real cover.
 *
 * Both upstreams serve plausible-looking URLs that aren't covers, and neither
 * signals it through the status code:
 *   - Google's high-zoom render collapses for some volumes (one measured at
 *     575×92 — a landscape strip, while zoom=1 for the same book was a correct
 *     128×191). Byte size hints at it (1.9 KB vs 9-74 KB) but is too fragile a
 *     threshold to rely on; the aspect ratio is unambiguous.
 *   - Open Library's blank placeholder is 1×1, which passes an aspect check on
 *     its own — hence the separate minimum-width floor.
 *   - Google's "image not available" card is correctly proportioned and large,
 *     so it clears both checks; see `isGooglePlaceholder`.
 *
 * The winning image is fetched into the RN image cache here, so the `<Image>`
 * that renders it moments later on the review screen doesn't re-download it.
 */
async function isUsableCover(url: string): Promise<boolean> {
  if (!url) return false;
  if (await isGooglePlaceholder(url)) return false;
  try {
    const { width, height } = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => Image.getSize(url, (w, h) => resolve({ width: w, height: h }), reject)
    );
    if (width < MIN_WIDTH || height <= 0) return false;
    const aspect = width / height;
    return aspect >= MIN_ASPECT && aspect <= MAX_ASPECT;
  } catch {
    // 404, network failure, or an undecodable body — all mean "not usable"
    return false;
  }
}

/**
 * Returns the first candidate URL that actually resolves to a real cover, or ''
 * to let the UI fall back to its "No cover" placeholder.
 *
 * Ordered best-first, so the common case costs a single validation.
 */
export async function resolveCover(candidates: string[]): Promise<string> {
  for (const url of candidates.filter(Boolean)) {
    if (await isUsableCover(url)) return url;
  }
  return '';
}
