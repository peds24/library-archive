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
import { colors } from '@/src/theme/colors';
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
        <View className="flex-1 items-center justify-center bg-surface px-8 gap-5">
          <Text className="text-ink text-lg font-semibold text-center">
            Camera access needed
          </Text>
          <Text className="text-ink-muted text-base text-center">
            Allow camera access to scan barcodes on your books.
          </Text>
          <Pressable onPress={requestPermission} className="bg-accent px-6 py-3 rounded-full">
            <Text className="text-accent-on font-semibold text-base">Allow Camera</Text>
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
          <View style={StyleSheet.absoluteFill} className="items-center justify-center">
            <View style={styles.frame} />
            <Text className="text-white/60 text-sm mt-5">Point at the barcode on the back cover</Text>
          </View>
        )}

        {/* Fetching overlay */}
        {phase === 'fetching' && (
          <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/60">
            <ActivityIndicator size="large" color={colors.accent.default} />
            <Text className="text-white/70 text-sm mt-3">Looking up book…</Text>
          </View>
        )}

        {/* Bottom sheet — preview / duplicate / not-found / error */}
        {showBottomSheet && (
          <View className="absolute bottom-0 left-0 right-0 bg-surface-2 rounded-t-3xl px-6 pt-6 pb-10 gap-4">
            {/* Book preview */}
            {(phase === 'preview' || phase === 'duplicate') && preview && (
              <View className="flex-row gap-4">
                <Image
                  source={{ uri: preview.coverImage }}
                  className="w-16 h-24 rounded-lg bg-surface"
                  resizeMode="cover"
                />
                <View className="flex-1 justify-center gap-1">
                  <Text className="text-ink font-semibold text-base leading-snug" numberOfLines={2}>
                    {preview.title}
                  </Text>
                  <Text className="text-ink-muted text-sm">{preview.author}</Text>
                  <Text className="text-ink-faint text-xs mt-1">
                    {preview.genre} · {preview.pages} pages
                  </Text>
                </View>
              </View>
            )}

            {/* Duplicate notice */}
            {phase === 'duplicate' && (
              <Text className="text-accent text-sm text-center font-medium">
                Already in your library.
              </Text>
            )}

            {/* Not found */}
            {phase === 'not-found' && (
              <View className="items-center gap-2 py-2">
                <Text className="text-ink font-semibold text-base">Book not found</Text>
                <Text className="text-ink-faint text-sm text-center">
                  This ISBN wasn't in any database.{'\n'}Add it manually or scan another.
                </Text>
              </View>
            )}

            {/* Network error */}
            {phase === 'error' && (
              <View className="items-center gap-2 py-2">
                <Text className="text-ink font-semibold text-base">Network error</Text>
                <Text className="text-ink-faint text-sm text-center">
                  Couldn't reach the book databases.{'\n'}Check your connection.
                </Text>
              </View>
            )}

            {/* Actions */}
            {phase === 'preview' && (
              <View className="gap-2">
                <Pressable onPress={handleConfirm} className="bg-accent py-3 rounded-full items-center">
                  <Text className="text-accent-on font-semibold text-base">Confirm Book</Text>
                </Pressable>
                <Pressable onPress={resumeScanning} className="py-2 items-center">
                  <Text className="text-ink-faint font-medium">Not this book — rescan</Text>
                </Pressable>
              </View>
            )}

            {(phase === 'duplicate' || phase === 'error') && (
              <Pressable onPress={resumeScanning} className="border border-border py-3 rounded-full items-center">
                <Text className="text-accent font-semibold">Scan another</Text>
              </Pressable>
            )}

            {phase === 'not-found' && (
              <View className="gap-2">
                <Pressable
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onPress={() => router.push({ pathname: '/manual-entry' as any, params: { isbn: lastIsbn } })}
                  className="bg-accent py-3 rounded-full items-center"
                >
                  <Text className="text-accent-on font-semibold">Add Manually</Text>
                </Pressable>
                <Pressable onPress={resumeScanning} className="border border-border py-3 rounded-full items-center">
                  <Text className="text-accent font-semibold">Scan another</Text>
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
  black: { flex: 1, backgroundColor: '#000' },
  frame: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
  },
});
