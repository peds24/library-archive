import { Image } from 'react-native';

// A real book cover is portrait and never far off ~0.65 w/h. These bounds are wide
// enough for square-ish art and tall mass-market paperbacks, but reject the two
// degenerate images the upstream APIs are known to serve (see `isUsableCover`).
const MIN_ASPECT = 0.4;
const MAX_ASPECT = 1.1;
const MIN_WIDTH = 100;

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
 *
 * The winning image is fetched into the RN image cache here, so the `<Image>`
 * that renders it moments later on the review screen doesn't re-download it.
 */
async function isUsableCover(url: string): Promise<boolean> {
  if (!url) return false;
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
