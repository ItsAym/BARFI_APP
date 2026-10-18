import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import DateTimePicker from '../components/barfi-date-picker';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ImageSourcePropType } from 'react-native';


const departments = ['Mortensrud', 'Kalbakken'];

type StockItem = {
  name: string;
  quantity: number;
  unit: 'brett' | 'eske';
  image?: ImageSourcePropType;
};

const mithaiList: StockItem[] = [
  {
    name: 'Akhrot Halwa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Akhrot_Halwa.png'),
  },
  {
    name: 'Badam Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Badam_Barfi.png'),
  },
  {
    name: 'Besan Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Besan_Barfi.png'),
  },
  {
    name: 'Besan Ladoo',
    quantity: 0,
    unit: 'eske',
  },
  {
    name: 'Besan Patisa',
    quantity: 0,
    unit: 'brett',
  },
  {
    name: 'Cham Cham',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Chum_Chum.png'),
  },
  {
    name: 'Chocolate Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Sjokolade_Barfi.png'),
  },
  {
    name: 'Pink Coconut Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Pink_Coconut_Barfi.png'),
  },
  {
    name: 'Gajar Barfi',
    quantity: 0,
    unit: 'brett',
  },
  {
    name: 'Gajar Halwa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Gajar_Halwa.png'),
  },
  {
    name: 'Gulab Jamon (krem)',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Ghulab_Jamun_Cream.png'),
  },
  {
    name: 'Gulab Jamon (Liten)',
    quantity: 0,
    unit: 'eske',
  },
  {
    name: 'Gulab Jamon (Runde)',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Ghulab_Jamun_Runde.png'),
  },
  {
    name: 'Gulab Jamon (Stor)',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Ghulab Jamun Lange.png'),
  },
  {
    name: 'Habshi Halwa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Habshi_Halwa.png'),
  },
  {
    name: 'Jalebi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Dessert/Jalebi.png'),
  },
  {
    name: 'Kalakand',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Kalakand.png'),
  },
  {
    name: 'Kashmiri Halwa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Kashmiri_Halwa.png'),
  },
  {
    name: 'Katlas',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Katlas.png'),
  },
  {
    name: 'Khajoor Halwa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Khajoor_Halwa.png'),
  },
  {
    name: 'Milk Cake',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Milkcake.png'),
  },
  {
    name: 'Motichoor Ladoo',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Motichoor_Laddo.png'),
  },
  {
    name: 'White Patisa',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/White_Patisa.png'),
  },
  {
    name: 'Patisa Pink',
    quantity: 0,
    unit: 'brett',
  },
  {
    name: 'Pista Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Pista_Barfi.png'),
  },
  {
    name: 'Rasgulla',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Rasgulla.png'),
  },
  {
    name: 'Saadi Barfi',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/Plain_Barfi.png'),
  },
  {
    name: 'Shakkar Para',
    quantity: 0,
    unit: 'eske',
    image: require('../../assets/images/Mithai/Shakkar_Paray.png'),
  },
  {
    name: 'White Coconut',
    quantity: 0,
    unit: 'brett',
    image: require('../../assets/images/Mithai/White_Coconut_Barfi.png'),
  },
];

const emptyQuantities = Object.fromEntries(mithaiList.map((item) => [item.name, 0]));
const allowedUid = '5IGP26tTnoXdTTelgg4gUAgmjQo1';

function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'permission-denied') return 'Ingen tilgang. Kontroller Firestore-reglene og brukerens UID.';
  if (code?.startsWith('auth/')) return 'Innlogging mislyktes. Kontroller e-post, passord og at Email/Password er aktivert.';
  if (code === 'unavailable') return 'Ingen kontakt med databasen. Kontroller internett og prøv igjen.';
  return error instanceof Error ? error.message : 'Noe gikk galt. Prøv igjen.';
}

function ProductImage({ item }: { item: StockItem }) {
  const [imageFailed, setImageFailed] = useState(false);

    if (item.image && !imageFailed) {
    return (
      <Image
        source={item.image}
        style={styles.productImage}
        resizeMode="cover"
        accessibilityLabel={item.name}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <View
      style={styles.imagePlaceholder}
      accessibilityLabel={`Bilde mangler for ${item.name}`}
    >
      <Text style={styles.imageLetter}>
        {item.name.charAt(0)}
      </Text>
      <Text style={styles.imageCaption}>Bilde</Text>
    </View>
  );
}

type ChangeLog = {
  id: string;
  department: string;
  product: string;
  employee: string;
  date: string;
  time: string;
  recordedAt: string;
  change: number;
  before: number;
  after: number;
  unit: StockItem['unit'];
};

function formatDate(value: Date) {
  return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0')].join('-');
}
function formatTime(value: Date) {
  return [String(value.getHours()).padStart(2, '0'),
    String(value.getMinutes()).padStart(2, '0')].join(':');
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [department, setDepartment] = useState('Mortensrud');
  const [quantities, setQuantities] = useState<Record<string, number>>(emptyQuantities);
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loadedDepartment, setLoadedDepartment] = useState('');
  const [online, setOnline] = useState(false);
  const [databaseError, setDatabaseError] = useState('');
  const [editing, setEditing] = useState(false);
  const [employee, setEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [baseline, setBaseline] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const ready = loadedDepartment === department;
  const items = mithaiList.map((item) => ({ ...item, quantity: quantities[item.name] ?? 0 }));
  const inStockCount = items.filter((item) => item.quantity > 0).length;
  const changedNames = mithaiList.filter((item) =>
    draft[item.name] !== undefined && draft[item.name] !== baseline[item.name]).map((item) => item.name);
  const changedCount = changedNames.length;

  useEffect(() => onAuthStateChanged(auth, (current) => {
    setUser(current);
    setAuthReady(true);
    setEditing(false);
    if (!current) {
      setLoadedDepartment('');
      setQuantities(emptyQuantities);
      setLogs([]);
      setEmployee('');
    }
  }), []);

  useEffect(() => {
    if (!user || user.uid !== allowedUid) return;
    let active = true;
    let stopState = () => {};
    let stopLogs = () => {};
    setLoadedDepartment('');
    setOnline(false);
    setLogs([]);
    setDatabaseError('');
    const stateRef = doc(db, 'departments', department);
    async function connect() {
      try {
        // Første oppstart oppretter en tom beholdning, aldri eksempeldata.
        await runTransaction(db, async (transaction) => {
          const state = await transaction.get(stateRef);
          if (!state.exists()) transaction.set(stateRef, {
            quantities: emptyQuantities, revision: 0, lastBatchId: '',
            updatedBy: user!.uid, updatedAt: serverTimestamp(),
          });
        });
        if (!active) return;
        stopState = onSnapshot(stateRef, { includeMetadataChanges: true }, (snapshot) => {
          if (!active || !snapshot.exists()) return;
          setQuantities(snapshot.data().quantities);
          setLoadedDepartment(department);
          setOnline(!snapshot.metadata.fromCache);
          setDatabaseError('');
        }, (err) => { if (active) { setOnline(false); setDatabaseError(errorMessage(err)); } });
        const history = query(collection(stateRef, 'batches'), orderBy('recordedAt', 'desc'), limit(50));
        stopLogs = onSnapshot(history, (snapshot) => {
          if (!active) return;
          const rows: ChangeLog[] = [];
          snapshot.docs.forEach((entry) => {
            const batch = entry.data();
            mithaiList.forEach((item) => {
              const before = batch.before[item.name];
              const after = batch.after[item.name];
              if (before !== after) rows.push({
                id: `${entry.id}-${item.name}`, department, product: item.name,
                employee: batch.employee, date: batch.date, time: batch.time,
                recordedAt: batch.recordedAt?.toDate().toISOString() ?? '',
                change: after - before, before, after, unit: item.unit,
              });
            });
          });
          setLogs(rows);
        }, (err) => { if (active) setDatabaseError(errorMessage(err)); });
      } catch (err) {
        if (active) setDatabaseError(errorMessage(err));
      }
    }
    void connect();
    return () => { active = false; stopState(); stopLogs(); };
  }, [user, department]);

  async function login() {
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch (err) { setLoginError(errorMessage(err)); }
    finally { setLoginBusy(false); }
  }

  function closeEditor() {
    if (savingRef.current) return;
    setEditing(false);
    setPicker(null);
  }

  function openEditor() {
    if (!ready || !online || databaseError) return;
    setSelectedDate(new Date());
    setDraft({ ...quantities });
    setBaseline({ ...quantities });
    setPicker(null);
    setError('');
    setEditing(true);
  }

  function adjust(name: string, delta: number) {
    if (savingRef.current) return;
    setDraft((current) => ({ ...current,
      [name]: Math.min(100000, Math.max(0, (current[name] ?? 0) + delta)),
    }));
    setError('');
  }

  async function saveChanges() {
    if (savingRef.current) return;
    if (!user || !ready || !online) return setError('Du må være logget inn og ha kontakt med databasen.');
    if (!employee.trim() || employee.trim().length > 100) return setError('Skriv navn (maks 100 tegn).');
    if (!changedCount) return setError('Endre antallet på minst én mithai-sort.');
    if (mithaiList.some((item) => !Number.isSafeInteger(draft[item.name]) || draft[item.name] < 0 || draft[item.name] > 100000)) {
      return setError('Antall må være hele tall mellom 0 og 100 000.');
    }
    savingRef.current = true;
    setSaving(true);
    setError('');
    const stateRef = doc(db, 'departments', department);
    const batchRef = doc(collection(stateRef, 'batches'));
    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(stateRef);
        if (!snapshot.exists()) throw new Error('Avdelingen finnes ikke. Åpne appen på nytt.');
        const state = snapshot.data();
        const before = state.quantities as Record<string, number>;
        // Avvis endringer på varer andre har oppdatert etter at skjemaet ble åpnet.
        if (changedNames.some((name) => before[name] !== baseline[name])) {
          throw new Error('En annen telefon har endret en av disse varene. Avbryt og åpne Rediger data på nytt for å hente oppdaterte tall.');
        }
        const after = { ...before };
        changedNames.forEach((name) => { after[name] = draft[name]; });
        transaction.update(stateRef, {
          quantities: after, revision: state.revision + 1,
          lastBatchId: batchRef.id, updatedBy: user.uid, updatedAt: serverTimestamp(),
        });
        transaction.set(batchRef, {
          uid: user.uid, employee: employee.trim(),
          date: formatDate(selectedDate), time: formatTime(selectedDate),
          recordedAt: serverTimestamp(), before, after,
        });
      });
      setEditing(false);
      setPicker(null);
    } catch (err) { setError(errorMessage(err)); }
    finally { savingRef.current = false; setSaving(false); }
  }

  if (!authReady || !user || user.uid !== allowedUid) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <Text style={styles.brand}>BARFI</Text>
          <Text style={styles.heading}>Logg inn</Text>
          {!authReady ? <Text style={styles.emptyText}>Sjekker innlogging …</Text> : user ? (
            <>
              <Text style={styles.errorText}>Denne brukeren har ikke tilgang til BARFI.</Text>
              <Pressable style={styles.editButton} onPress={() => void signOut(auth)}><Text style={styles.editButtonText}>Logg ut</Text></Pressable>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>E-post</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address"
                autoCapitalize="none" autoCorrect={false} accessibilityLabel="E-post" />
              <Text style={styles.fieldLabel}>Passord</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry accessibilityLabel="Passord" />
              {!!loginError && <Text style={styles.errorText}>{loginError}</Text>}
              <Pressable style={styles.editButton} disabled={loginBusy} onPress={() => void login()} accessibilityRole="button">
                <Text style={styles.editButtonText}>{loginBusy ? 'Logger inn …' : 'Logg inn'}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>BARFI</Text>
        <Text style={styles.subtitle}>Velg avdeling:</Text>
        <Pressable onPress={() => void signOut(auth).catch((err) => setDatabaseError(errorMessage(err)))} accessibilityRole="button">
          <Text style={[styles.departmentText, { marginTop: 12 }]}>Logg ut</Text>
        </Pressable>
        <Text style={styles.emptyText}>{!ready ? 'Henter lager fra Firebase …' : online ? 'Tilkoblet Firebase' : 'Uten nett · redigering utilgjengelig'}</Text>
        {!!databaseError && <Text style={styles.errorText}>{databaseError}</Text>}

        <View style={styles.departments}>
          {departments.map((name) => (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={{
                selected: department === name,
              }}
              onPress={() => setDepartment(name)}
              style={[
                styles.department,
                department === name && styles.selected,
              ]}
            >
              <Text
                style={[
                  styles.departmentText,
                  department === name && styles.selectedText,
                ]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>
            LAGER · {department}
          </Text>
          <Text style={styles.total}>
            {ready ? `${inStockCount} sorter` : '…'}
          </Text>
          <Text style={styles.summaryHint}>
            På lager av {items.length} mithai-sorter
          </Text>
        </View>

        <Pressable disabled={!ready || !online || !!databaseError} style={[styles.editButton, (!ready || !online || !!databaseError) && styles.disabledButton]} onPress={openEditor} accessibilityRole="button">
          <Text style={styles.editButtonText}>Rediger data</Text>
        </Pressable>

        <Text style={styles.heading}>
          Varelageroversikt i kjølerom
        </Text>

        {!ready ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Henter beholdning
            </Text>
            <Text style={styles.emptyText}>
              Vent til databasen er lastet før du registrerer endringer.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.name} style={styles.productRow}>
              <ProductImage item={item} />

              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {item.name}
                </Text>
                <Text style={styles.productStatus}>
                  {item.quantity > 0
                    ? 'På lager'
                    : 'Ingen beholdning registrert'}
                </Text>
              </View>

              <Text
                style={[
                  styles.quantity,
                  item.quantity === 0 && styles.zeroQuantity,
                ]}
              >
                {item.quantity}{' '}
                {item.unit === 'eske' && item.quantity !== 1
                  ? 'esker'
                  : item.unit}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.heading}>Historikk · {department}</Text>
        <Text style={styles.productStatus}>Viser de siste 50 lagringene. Eldre historikk beholdes i Firebase.</Text>
        {logs.length === 0 && <Text style={styles.emptyText}>Ingen endringer registrert ennå.</Text>}
        {logs.map((log) => (
          <View key={log.id} style={[styles.empty, { marginBottom: 10 }]}>
            <Text style={styles.productName}>{log.product}</Text>
            <Text style={styles.emptyText}>
              {log.change > 0 ? '+' : ''}{log.change} · {log.before} → {log.after}{' '}
              {log.unit === 'eske' && log.after !== 1 ? 'esker' : log.unit}
            </Text>
            <Text style={styles.emptyText}>{log.employee} · {log.date} kl. {log.time}</Text>
            <Text style={styles.productStatus}>
              Loggført: {log.recordedAt ? new Date(log.recordedAt).toLocaleString('nb-NO') : 'Lagrer …'}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Modal visible={editing} animationType="slide" onRequestClose={closeEditor}>
        <SafeAreaView style={styles.screen}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
            <Text style={styles.heading}>Rediger data</Text>
            <Text style={styles.subtitle}>{department}</Text>
            <Text style={styles.fieldLabel}>Navn</Text>
            <TextInput style={styles.input} value={employee} onChangeText={setEmployee} maxLength={100} editable={!saving}
              placeholder="Skriv navnet ditt" placeholderTextColor="#8A7B82" accessibilityLabel="Navn" />
            <Text style={styles.fieldLabel}>Dato og tidspunkt</Text>
            <View style={styles.dateButtons}>
              <Pressable style={[styles.input, { flex: 1 }]} accessibilityRole="button"
                accessibilityLabel="Velg dato" onPress={() => setPicker(picker === 'date' ? null : 'date')}>
                <Text style={styles.productName}>{selectedDate.toLocaleDateString('nb-NO')}</Text>
              </Pressable>
              <Pressable style={[styles.input, { flex: 1 }]} accessibilityRole="button"
                accessibilityLabel="Velg tidspunkt" onPress={() => setPicker(picker === 'time' ? null : 'time')}>
                <Text style={styles.productName}>{formatTime(selectedDate)}</Text>
              </Pressable>
            </View>
            {picker && (
              <View>
                <DateTimePicker value={selectedDate} mode={picker}
                  display={Platform.OS === 'ios' ? (picker === 'date' ? 'inline' : 'spinner') : 'default'}
                  is24Hour locale="nb-NO" themeVariant="light"
                  onChange={(event, value) => {
                    if (Platform.OS !== 'ios') setPicker(null);
                    if (event.type === 'set' && value) {
                      setSelectedDate((current) => {
                        const next = new Date(current);
                        if (picker === 'date') {
                          next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
                        } else {
                          next.setHours(value.getHours(), value.getMinutes(), 0, 0);
                        }
                        return next;
                      });
                    }
                  }} />
                {Platform.OS === 'ios' && (
                  <Pressable style={styles.cancelButton} onPress={() => setPicker(null)} accessibilityRole="button">
                    <Text style={styles.departmentText}>Ferdig</Text>
                  </Pressable>
                )}
              </View>
            )}
            <Text style={styles.fieldLabel}>Oppdater beholdningen</Text>
            <Text style={[styles.emptyText, { marginBottom: 16 }]}>
              Bruk − og + på varene. Alle endringer lagres samlet når du trykker Lagre alle endringer.
            </Text>
            {items.map((item) => {
              const quantity = draft[item.name] ?? item.quantity;
              const changed = quantity !== baseline[item.name];
              return (
                <View key={item.name} style={[styles.productRow, styles.editorRow, changed && styles.selectedProduct]}>
                  <View style={styles.editorProduct}>
                    <ProductImage item={item} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productStatus}>
                        {changed ? `${baseline[item.name]} → ${quantity}` : `Ved åpning: ${baseline[item.name]}`}{' '}
                        {item.unit === 'eske' && quantity !== 1 ? 'esker' : item.unit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable style={[styles.stepButton, quantity === 0 && styles.disabledButton]}
                      disabled={quantity === 0 || saving} accessibilityRole="button"
                      accessibilityLabel={`Trekk fra én: ${item.name}`}
                      onPress={() => adjust(item.name, -1)}>
                      <Text style={styles.stepButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.stepQuantity} accessibilityLiveRegion="polite">{quantity}</Text>
                    <Pressable disabled={saving} style={styles.stepButton} accessibilityRole="button"
                      accessibilityLabel={`Legg til én: ${item.name}`}
                      onPress={() => adjust(item.name, 1)}>
                      <Text style={styles.stepButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
            {!!error && <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>}
            <Pressable style={styles.editButton} disabled={saving} onPress={() => void saveChanges()} accessibilityRole="button">
              <Text style={styles.editButtonText}>{saving ? 'Lagrer i Firebase …' : `Lagre alle endringer (${changedCount})`}</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={closeEditor} accessibilityRole="button">
              <Text style={styles.departmentText}>Avbryt</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateButtons: { flexDirection: 'row', gap: 10 },
  editorRow: { flexDirection: 'column', alignItems: 'stretch' },
  editorProduct: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  stepButton: { width: 46, height: 46, backgroundColor: '#522738', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { opacity: 0.3 },
  stepButtonText: { color: '#FFFFFF', fontSize: 26, fontWeight: '600' },
  stepQuantity: { minWidth: 48, textAlign: 'center', fontSize: 23, fontWeight: '700', color: '#522738' },
  editButton: {
    backgroundColor: '#522738', padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 20,
  },
  editButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  fieldLabel: {
    fontSize: 15, fontWeight: '600', color: '#30232A', marginTop: 20, marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF', color: '#30232A', borderWidth: 1,
    borderColor: '#DDD0D6', borderRadius: 12, padding: 14, fontSize: 16,
  },
  productPicker: { height: 280 },
  selectedProduct: { borderColor: '#522738', backgroundColor: '#F4EAF0' },
  cancelButton: { padding: 18, alignItems: 'center', marginTop: 8 },
  errorText: { color: '#B3261E', marginTop: 12, fontSize: 15 },
  screen: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 5,
    color: '#522738',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#7B7275',
    marginTop: 4,
  },
  departments: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
    marginBottom: 24,
  },
  department: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#EEE7E4',
  },
  selected: {
    backgroundColor: '#522738',
  },
  departmentText: {
    color: '#522738',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  summary: {
    backgroundColor: '#522738',
    padding: 24,
    borderRadius: 24,
  },
  summaryLabel: {
    color: '#E5C6CF',
    fontSize: 12,
    fontWeight: '600',
  },
  total: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginVertical: 12,
  },
  summaryHint: {
    color: '#E5C6CF',
    fontSize: 14,
  },
  heading: {
    fontSize: 21,
    fontWeight: '700',
    color: '#30232A',
    marginTop: 30,
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE5DF',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0E8DF',
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0E8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLetter: {
    fontSize: 23,
    fontWeight: '700',
    color: '#8A6472',
  },
  imageCaption: {
    fontSize: 10,
    color: '#8A6472',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#30232A',
  },
  productStatus: {
    fontSize: 11,
    color: '#7B7275',
    marginTop: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#522738',
    textAlign: 'right',
    flexShrink: 1,
  },
  zeroQuantity: {
    color: '#A2979C',
  },
  empty: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE5DF',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#30232A',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#7B7275',
    marginTop: 8,
  },
  notice: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#F0E8DF',
    borderRadius: 16,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#705B4C',
  },
});