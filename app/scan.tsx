import { CameraView, useCameraPermissions, type BarcodeType } from 'expo-camera';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { lookupByISBN } from '@/src/services/bookLookup';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';
import { Book } from '@/src/types/book';

type ScanPhase = 'scanning' | 'fetching' | 'preview' | 'duplicate' | 'not-found' | 'error';

const BOOK_BARCODES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const books = useBookStore((s) => s.books);

  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [preview, setPreview] = useState<Book | null>(null);
  const [lastIsbn, setLastIsbn] = useState('');
  const isProcessing = useRef(false);

  // Returning from the review screen (either "Add & Scan Another" or a back gesture)
  // leaves this screen mounted on its old preview phase. Resetting on focus is what
  // makes the scan → review → scan loop work without re-mounting the camera.
  useFocusEffect(
    useCallback(() => {
      setPreview(null);
      setPhase('scanning');
      isProcessing.current = false;
    }, [])
  );

  // Permission not yet resolved
  if (!permission) return <View style={styles.black} />;

  // Permission denied
  if (!permission.granted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Scan Book' }} />
        <View style={[CommonStyles.screenCentered, styles.permissionScreen]}>
          <Text style={styles.permissionHeading}>Camera access needed</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to scan barcodes on your books.
          </Text>
          <Pressable onPress={requestPermission} style={styles.inlinePill}>
            <Text style={CommonStyles.pillFilledLabel}>Allow Camera</Text>
          </Pressable>
        </View>
      </>
    );
  }

  async function handleBarcodeScanned({ data: isbn }: { data: string }) {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLastIsbn(isbn);
    setPhase('fetching');

    try {
      const book = await lookupByISBN(isbn);
      if (!book) {
        setPhase('not-found');
      } else if (books.some((b) => b.id === isbn)) {
        setPreview(book);
        setPhase('duplicate');
      } else {
        setPreview(book);
        setPhase('preview');
      }
    } catch {
      setPhase('error');
    }
  }

  function resumeScanning() {
    setPreview(null);
    setPhase('scanning');
    isProcessing.current = false;
  }

  // Nothing is saved here. Confirming a scan hands the looked-up book to the review
  // screen, which is where it can be edited and where the two commit actions ("Add
  // to Library" / "Add & Scan Another") live. Splitting it this way means a bad scan
  // — a misread barcode, or a right barcode matched to the wrong edition — never
  // reaches the library on its own.
  function handleConfirm() {
    if (!preview) return;
    router.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathname: '/scan-review' as any,
      params: { book: JSON.stringify(preview) },
    });
  }

  const cameraActive = phase === 'scanning' || phase === 'fetching';
  const showBottomSheet = phase === 'preview' || phase === 'duplicate' || phase === 'not-found' || phase === 'error';

  return (
    <>
      <Stack.Screen options={{ title: 'Scan Book' }} />

      <View style={styles.black}>
        {/* Camera */}
        {cameraActive && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: BOOK_BARCODES }}
            onBarcodeScanned={phase === 'scanning' ? handleBarcodeScanned : undefined}
          />
        )}

        {/* Scan frame */}
        {phase === 'scanning' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <View style={styles.frame} />
            <Text style={styles.frameCaption}>Point at the barcode on the back cover</Text>
          </View>
        )}

        {/* Fetching overlay */}
        {phase === 'fetching' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay, styles.scrim]}>
            <ActivityIndicator size="large" color={Colors.accent.default} />
            <Text style={styles.scrimCaption}>Looking up book…</Text>
          </View>
        )}

        {/* Bottom sheet — preview / duplicate / not-found / error */}
        {showBottomSheet && (
          <View style={styles.sheet}>
            {/* Book preview */}
            {(phase === 'preview' || phase === 'duplicate') && preview && (
              <View style={styles.sheetPreview}>
                <Image source={{ uri: preview.coverImage }} style={styles.sheetCover} resizeMode="cover" />
                <View style={styles.sheetPreviewText}>
                  <Text style={styles.sheetTitle} numberOfLines={2}>
                    {preview.title}
                  </Text>
                  <Text style={styles.sheetAuthor}>{preview.author}</Text>
                  <Text style={styles.sheetMeta}>
                    {preview.genre} · {preview.pages} pages
                  </Text>
                </View>
              </View>
            )}

            {/* Duplicate notice */}
            {phase === 'duplicate' && (
              <Text style={styles.duplicateNotice}>Already in your library.</Text>
            )}

            {/* Not found */}
            {phase === 'not-found' && (
              <View style={styles.sheetMessage}>
                <Text style={styles.sheetMessageHeading}>Book not found</Text>
                <Text style={styles.sheetMessageBody}>
                  This ISBN wasn't in any database.{'\n'}Add it manually or scan another.
                </Text>
              </View>
            )}

            {/* Network error */}
            {phase === 'error' && (
              <View style={styles.sheetMessage}>
                <Text style={styles.sheetMessageHeading}>Network error</Text>
                <Text style={styles.sheetMessageBody}>
                  Couldn't reach the book databases.{'\n'}Check your connection.
                </Text>
              </View>
            )}

            {/* Actions */}
            {phase === 'preview' && (
              <View style={styles.sheetActions}>
                <Pressable onPress={handleConfirm} style={CommonStyles.pillFilled}>
                  <Text style={CommonStyles.pillFilledLabel}>Confirm Book</Text>
                </Pressable>
                <Pressable onPress={resumeScanning} style={CommonStyles.textButton}>
                  <Text style={CommonStyles.textButtonLabel}>Not this book — rescan</Text>
                </Pressable>
              </View>
            )}

            {(phase === 'duplicate' || phase === 'error') && (
              <Pressable onPress={resumeScanning} style={CommonStyles.pillOutline}>
                <Text style={styles.scanAnotherLabel}>Scan another</Text>
              </Pressable>
            )}

            {phase === 'not-found' && (
              <View style={styles.sheetActions}>
                <Pressable
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onPress={() => router.push({ pathname: '/manual-entry' as any, params: { isbn: lastIsbn } })}
                  style={CommonStyles.pillFilled}
                >
                  <Text style={styles.addManuallyLabel}>Add Manually</Text>
                </Pressable>
                <Pressable onPress={resumeScanning} style={CommonStyles.pillOutline}>
                  <Text style={styles.scanAnotherLabel}>Scan another</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: Colors.camera.bg },
  overlay: { alignItems: 'center', justifyContent: 'center' },
  scrim: { backgroundColor: Colors.camera.scrim },

  frame: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: Colors.camera.frame,
    borderRadius: Radius.md,
  },
  frameCaption: {
    color: Colors.camera.caption,
    fontSize: FontSize.sm,
    marginTop: Spacing.xl,
  },
  scrimCaption: {
    color: Colors.camera.captionStrong,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },

  permissionScreen: { paddingHorizontal: Spacing.xxxl, gap: Spacing.xl },
  permissionHeading: {
    color: Colors.ink.default,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  permissionBody: { color: Colors.ink.muted, fontSize: FontSize.base, textAlign: 'center' },
  // A hug-width filled pill, unlike the full-width CommonStyles.pillFilled.
  inlinePill: {
    backgroundColor: Colors.accent.default,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface.raised,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  sheetPreview: { flexDirection: 'row', gap: Spacing.lg },
  sheetCover: {
    width: 64,
    height: 96,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface.default,
  },
  sheetPreviewText: { flex: 1, justifyContent: 'center', gap: Spacing.xs },
  sheetTitle: {
    color: Colors.ink.default,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  sheetAuthor: { color: Colors.ink.muted, fontSize: FontSize.sm },
  sheetMeta: { color: Colors.ink.faint, fontSize: FontSize.xs, marginTop: Spacing.xs },

  duplicateNotice: {
    color: Colors.accent.default,
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  sheetMessage: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  sheetMessageHeading: {
    color: Colors.ink.default,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
  sheetMessageBody: { color: Colors.ink.faint, fontSize: FontSize.sm, textAlign: 'center' },

  sheetActions: { gap: Spacing.sm },
  // These two sit in the sheet rather than on a screen, and were sized a step down
  // from the shared pill labels before the port — kept as-is.
  scanAnotherLabel: { color: Colors.accent.default, fontWeight: FontWeight.semibold },
  addManuallyLabel: { color: Colors.accent.on, fontWeight: FontWeight.semibold },
});
