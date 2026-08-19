import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { Account, api, Category, getStoredUser, signIn, signOut, Transaction, User } from "./src/api";

type Tab = "dashboard" | "transactions" | "accounts" | "categories";
type TransactionType = "expense" | "income" | "transfer";
type FormMode = "add" | "edit";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<{ categoryName: string; totalExpense: number }[]>([]);
  const [accountFilter, setAccountFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [transactionModal, setTransactionModal] = useState<{ mode: FormMode; item?: Transaction } | null>(null);
  const [accountModal, setAccountModal] = useState<{ mode: FormMode; item?: Account } | null>(null);
  const [categoryModal, setCategoryModal] = useState<{ mode: FormMode; item?: Category } | null>(null);

  async function loadData() {
    const accountQuery = accountFilter === "all" ? "" : `?accountId=${accountFilter}`;
    const [accountData, categoryData, transactionData, analyticsData] = await Promise.all([
      api<{ accounts: Account[] }>("/api/accounts"),
      api<{ data: Category[] }>("/api/categories"),
      api<{ transactions: Transaction[] }>(`/api/transactions${accountQuery}`),
      api<{ data: { categoryName: string; totalExpense: number }[] }>("/api/analytics/category-expense"),
    ]);
    setAccounts(accountData.accounts);
    setCategories(categoryData.data);
    setTransactions(transactionData.transactions);
    setAnalytics(analyticsData.data);
  }

  useEffect(() => {
    getStoredUser().then((storedUser) => {
      setUser(storedUser);
      setLoading(false);
      if (storedUser) loadData().catch(() => setUser(null));
    });
  }, []);

  useEffect(() => {
    if (user) loadData().catch((error) => Alert.alert("Could not refresh", error.message));
  }, [accountFilter]);

  async function handleLogin() {
    try { setLoading(true); setUser(await signIn(email, password)); await loadData(); }
    catch (error) { Alert.alert("Could not sign in", error instanceof Error ? error.message : "Try again"); }
    finally { setLoading(false); }
  }

  async function refresh() { try { await loadData(); } catch (error) { Alert.alert("Could not refresh", error instanceof Error ? error.message : "Try again"); } }

  const filteredTransactions = useMemo(() => {
    if (dateFilter === "all") return transactions;
    const start = new Date();
    start.setDate(start.getDate() - Number(dateFilter));
    return transactions.filter((item) => new Date(item.date) >= start);
  }, [transactions, dateFilter]);
  const income = filteredTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = filteredTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses;

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>;
  if (!user) return <Login email={email} password={password} setEmail={setEmail} setPassword={setPassword} onLogin={handleLogin} />;

  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.kicker}>TRACKIT / PERSONAL FINANCE</Text><Text style={styles.title}>Dashboard</Text><Text style={styles.muted}>Welcome back, {user.name.split(" ")[0]}</Text></View>
        <Pressable onPress={async () => { await signOut(); setUser(null); }}><Text style={styles.signOut}>Sign out</Text></Pressable>
      </View>
      <View style={styles.tabBar}>{(["dashboard", "transactions", "accounts", "categories"] as Tab[]).map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}><Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item}</Text></Pressable>)}</View>
      {tab === "dashboard" && <Dashboard accounts={accounts} transactions={filteredTransactions} analytics={analytics} income={income} expenses={expenses} balance={balance} dateFilter={dateFilter} setDateFilter={setDateFilter} />}
      {tab === "transactions" && <Transactions transactions={filteredTransactions} accounts={accounts} categories={categories} accountFilter={accountFilter} setAccountFilter={setAccountFilter} onAdd={() => setTransactionModal({ mode: "add" })} onEdit={(item: Transaction) => setTransactionModal({ mode: "edit", item })} onDelete={(item: Transaction) => confirmDelete("transaction", item._id, refresh)} />}
      {tab === "accounts" && <Accounts accounts={accounts} onAdd={() => setAccountModal({ mode: "add" })} onEdit={(item: Account) => setAccountModal({ mode: "edit", item })} onDelete={(item: Account) => confirmDelete("account", item._id, refresh)} />}
      {tab === "categories" && <Categories categories={categories} onAdd={() => setCategoryModal({ mode: "add" })} onEdit={(item: Category) => setCategoryModal({ mode: "edit", item })} onDelete={(item: Category) => confirmDelete("category", item._id, refresh)} />}
    </ScrollView>
    {transactionModal && <TransactionForm modal={transactionModal} accounts={accounts} categories={categories} onClose={() => setTransactionModal(null)} onSaved={refresh} />}
    {accountModal && <AccountForm modal={accountModal} onClose={() => setAccountModal(null)} onSaved={refresh} />}
    {categoryModal && <CategoryForm modal={categoryModal} onClose={() => setCategoryModal(null)} onSaved={refresh} />}
  </SafeAreaView>;
}

function Login({ email, password, setEmail, setPassword, onLogin }: any) { return <SafeAreaView style={styles.safe}><View style={styles.login}><Text style={styles.kicker}>TRACKIT / MOBILE</Text><Text style={styles.hero}>Your money, in step.</Text><Text style={styles.muted}>One account across web and mobile.</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} /><TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} /><Pressable style={styles.primary} onPress={onLogin}><Text style={styles.primaryText}>Sign in</Text></Pressable></View></SafeAreaView>; }

function Dashboard({ accounts, transactions, analytics, income, expenses, balance, dateFilter, setDateFilter }: any) { return <>
  <View style={styles.filterRow}><Text style={styles.sectionTitle}>Summary</Text><SelectChips value={dateFilter} options={["10", "30", "60", "all"]} labels={["10d", "30d", "60d", "All"]} onChange={setDateFilter} /></View>
  <View style={styles.summaryGrid}><Summary title="Income" value={income} color={COLORS.income} /><Summary title="Expenses" value={expenses} color={COLORS.expense} /><Summary title="Balance" value={balance} color={COLORS.blue} /></View>
  <Text style={styles.sectionTitle}>Account's Balance</Text><View style={styles.cardGrid}>{accounts.map((item: Account) => <View style={styles.accountCard} key={item._id}><Text style={styles.cardLabel}>{item.type.toUpperCase()}</Text><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.accountAmount}>₹{item.balance.toLocaleString("en-IN")}</Text></View>)}</View>
  <Text style={styles.sectionTitle}>Category expenses this month</Text><View style={styles.panel}>{analytics.length === 0 ? <Text style={styles.muted}>No categorized expenses yet.</Text> : analytics.slice(0, 6).map((item: any) => <View style={styles.chartRow} key={item.categoryName}><View style={styles.chartLabel}><Text style={styles.rowTitle}>{item.categoryName}</Text><Text style={styles.muted}>₹{item.totalExpense.toLocaleString("en-IN")}</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, (item.totalExpense / Math.max(...analytics.map((entry: any) => entry.totalExpense))) * 100)}%` }]} /></View></View>)}</View>
  <Text style={styles.sectionTitle}>Recent activity</Text>{transactions.slice(0, 6).map((item: Transaction) => <TransactionRow key={item._id} item={item} />)}
</>; }
function Summary({ title, value, color }: { title: string; value: number; color: string }) { return <View style={styles.summary}><Text style={[styles.summaryTitle, { color }]}>{title}</Text><Text style={styles.summaryValue}>₹{value.toLocaleString("en-IN")}</Text></View>; }

function Transactions({ transactions, accounts, categories, accountFilter, setAccountFilter, onAdd, onEdit, onDelete }: any) { return <><View style={styles.filterRow}><Text style={styles.sectionTitle}>Transactions</Text><Pressable style={styles.smallButton} onPress={onAdd}><Text style={styles.smallButtonText}>+ Add</Text></Pressable></View><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}><SelectChips value={accountFilter} options={["all", ...accounts.map((item: Account) => item._id)]} labels={["All accounts", ...accounts.map((item: Account) => item.name)]} onChange={setAccountFilter} /></ScrollView>{transactions.length === 0 ? <Text style={styles.muted}>No transactions found.</Text> : transactions.map((item: Transaction) => <View key={item._id} style={styles.transactionLine}><TransactionRow item={item} /><View style={styles.actions}><Pressable onPress={() => onEdit(item)}><Text style={styles.actionText}>Edit</Text></Pressable><Pressable onPress={() => onDelete(item)}><Text style={styles.deleteText}>Delete</Text></Pressable></View></View>)}</>; }
function TransactionRow({ item }: { item: Transaction }) { const account = typeof item.accountId === "string" ? item.accountId : item.accountId?.name; const category = typeof item.categoryId === "string" ? "" : item.categoryId?.name; return <View style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.note || category || item.type}</Text><Text style={styles.muted}>{account || "Account"} · {new Date(item.date).toLocaleDateString()}</Text></View><Text style={[styles.rowAmount, item.type === "expense" ? styles.expense : styles.income]}>{item.type === "expense" ? "-" : "+"}₹{item.amount.toLocaleString("en-IN")}</Text></View>; }

function Accounts({ accounts, onAdd, onEdit, onDelete }: any) { return <><View style={styles.filterRow}><Text style={styles.sectionTitle}>Accounts</Text><Pressable style={styles.smallButton} onPress={onAdd}><Text style={styles.smallButtonText}>+ Add account</Text></Pressable></View>{accounts.map((item: Account) => <View style={styles.managementRow} key={item._id}><View><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.muted}>{item.type} · {item.currency ?? "INR"}</Text><Text style={styles.accountAmount}>₹{item.balance.toLocaleString("en-IN")}</Text></View><View style={styles.actions}><Pressable onPress={() => onEdit(item)}><Text style={styles.actionText}>Edit</Text></Pressable><Pressable onPress={() => onDelete(item)}><Text style={styles.deleteText}>Delete</Text></Pressable></View></View>)}</>; }
function Categories({ categories, onAdd, onEdit, onDelete }: any) { return <><View style={styles.filterRow}><Text style={styles.sectionTitle}>Categories</Text><Pressable style={styles.smallButton} onPress={onAdd}><Text style={styles.smallButtonText}>+ Add category</Text></Pressable></View>{categories.map((item: Category) => <View style={styles.managementRow} key={item._id}><View><Text style={styles.rowTitle}>{item.icon ? `${item.icon} ` : ""}{item.name}</Text><Text style={styles.muted}>{item.isDefault ? "Default category" : "Personal category"}</Text></View>{!item.isDefault && <View style={styles.actions}><Pressable onPress={() => onEdit(item)}><Text style={styles.actionText}>Edit</Text></Pressable><Pressable onPress={() => onDelete(item)}><Text style={styles.deleteText}>Delete</Text></Pressable></View>}</View>)}</>; }

function TransactionForm({ modal, accounts, categories, onClose, onSaved }: any) { const item = modal.item; const [type, setType] = useState<TransactionType>(item?.type ?? "expense"); const [accountId, setAccountId] = useState(item?.accountId?._id ?? ""); const [categoryId, setCategoryId] = useState(item?.categoryId?._id ?? ""); const [transferAccountId, setTransferAccountId] = useState(item?.transferAccountId ?? ""); const [amount, setAmount] = useState(item?.amount?.toString() ?? ""); const [note, setNote] = useState(item?.note ?? ""); async function save() { if (!accountId || !amount || (type !== "transfer" && !categoryId)) return Alert.alert("Missing details", "Select an account, amount, and category."); try { await api(modal.mode === "add" ? "/api/transactions" : `/api/transactions/${item._id}`, { method: modal.mode === "add" ? "POST" : "PUT", body: JSON.stringify({ accountId, categoryId: type === "transfer" ? null : categoryId, transferAccountId: type === "transfer" ? transferAccountId : null, type, amount: Number(amount), date: item?.date ?? new Date().toISOString(), note }) }); onClose(); await onSaved(); } catch (error) { Alert.alert("Could not save transaction", error instanceof Error ? error.message : "Try again"); } } return <FormModal title={modal.mode === "add" ? "Add transaction" : "Edit transaction"} onClose={onClose} onSave={save}><Label text="Type" /><SelectChips value={type} options={["expense", "income", "transfer"]} onChange={setType} /><Label text="Account" /><SelectChips value={accountId} options={accounts.map((entry: Account) => entry._id)} labels={accounts.map((entry: Account) => entry.name)} onChange={setAccountId} /><Label text="Category" />{type !== "transfer" && <SelectChips value={categoryId} options={categories.map((entry: Category) => entry._id)} labels={categories.map((entry: Category) => entry.name)} onChange={setCategoryId} />}{type === "transfer" && <SelectChips value={transferAccountId} options={accounts.filter((entry: Account) => entry._id !== accountId).map((entry: Account) => entry._id)} labels={accounts.filter((entry: Account) => entry._id !== accountId).map((entry: Account) => entry.name)} onChange={setTransferAccountId} />}<TextInput style={styles.input} placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /><TextInput style={styles.input} placeholder="Note" value={note} onChangeText={setNote} /></FormModal>; }
function AccountForm({ modal, onClose, onSaved }: any) { const [name, setName] = useState(modal.item?.name ?? ""); const [type, setType] = useState(modal.item?.type ?? "cash"); const [balance, setBalance] = useState(modal.item?.balance?.toString() ?? "0"); async function save() { if (!name) return Alert.alert("Missing name", "Enter an account name."); try { await api(modal.mode === "add" ? "/api/accounts" : `/api/accounts/${modal.item._id}`, { method: modal.mode === "add" ? "POST" : "PUT", body: JSON.stringify({ name, type, balance: Number(balance), currency: "INR" }) }); onClose(); await onSaved(); } catch (error) { Alert.alert("Could not save account", error instanceof Error ? error.message : "Try again"); } } return <FormModal title={modal.mode === "add" ? "Add account" : "Edit account"} onClose={onClose} onSave={save}><TextInput style={styles.input} placeholder="Account name" value={name} onChangeText={setName} /><Label text="Type" /><SelectChips value={type} options={["cash", "bank", "credit", "other"]} onChange={setType} /><TextInput style={styles.input} placeholder="Opening balance" keyboardType="decimal-pad" value={balance} onChangeText={setBalance} /></FormModal>; }
function CategoryForm({ modal, onClose, onSaved }: any) { const [name, setName] = useState(modal.item?.name ?? ""); const [icon, setIcon] = useState(modal.item?.icon ?? ""); async function save() { if (!name.trim()) return Alert.alert("Missing name", "Enter a category name."); try { await api(modal.mode === "add" ? "/api/categories" : `/api/categories/${modal.item._id}`, { method: modal.mode === "add" ? "POST" : "PUT", body: JSON.stringify({ name: name.trim(), icon }) }); onClose(); await onSaved(); } catch (error) { Alert.alert("Could not save category", error instanceof Error ? error.message : "Try again"); } } return <FormModal title={modal.mode === "add" ? "Add category" : "Edit category"} onClose={onClose} onSave={save}><TextInput style={styles.input} placeholder="Category name" value={name} onChangeText={setName} /><TextInput style={styles.input} placeholder="Icon (optional)" value={icon} onChangeText={setIcon} /></FormModal>; }
function FormModal({ title, children, onClose, onSave }: any) { return <Modal visible animationType="slide" transparent onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.filterRow}><Text style={styles.panelTitle}>{title}</Text><Pressable onPress={onClose}><Text style={styles.signOut}>Close</Text></Pressable></View><ScrollView>{children}</ScrollView><Pressable style={styles.primary} onPress={onSave}><Text style={styles.primaryText}>Save changes</Text></Pressable></View></View></Modal>; }
function Label({ text }: { text: string }) { return <Text style={styles.label}>{text}</Text>; }
function SelectChips({ value, options, labels = options, onChange }: { value: string; options: string[]; labels?: string[]; onChange: (value: any) => void }) { return <View style={styles.chipWrap}>{options.map((option, index) => <Pressable key={option} onPress={() => onChange(option)} style={[styles.chip, value === option && styles.selectedChip]}><Text style={[styles.chipText, value === option && styles.selectedChipText]}>{labels[index] ?? option}</Text></Pressable>)}</View>; }
function confirmDelete(kind: string, id: string, refresh: () => Promise<void>) { const resource = kind === "transaction" ? "transactions" : kind === "category" ? "categories" : "accounts"; Alert.alert(`Delete ${kind}?`, "This action cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { await api(`/api/${resource}/${id}`, { method: "DELETE" }); await refresh(); } catch (error) { Alert.alert("Delete failed", error instanceof Error ? error.message : "Try again"); } } }]); }

const COLORS = { accent: "#d86642", ink: "#1e2825", muted: "#7d8781", income: "#318467", expense: "#c35b4a", blue: "#3f72af", paper: "#f7f4ee", white: "#fffdf8", line: "#e5e0d7" };
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: COLORS.paper }, content: { padding: 20, paddingBottom: 50 }, center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.paper }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }, kicker: { color: COLORS.accent, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: COLORS.ink, fontSize: 30, fontWeight: "800", marginTop: 7 }, hero: { color: COLORS.ink, fontSize: 38, fontWeight: "800", marginTop: 18, marginBottom: 8 }, signOut: { color: COLORS.muted, fontWeight: "700" }, muted: { color: COLORS.muted, fontSize: 13, marginTop: 4 }, tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.line, marginBottom: 22 }, tab: { paddingVertical: 11, marginRight: 16 }, activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.accent }, tabText: { color: COLORS.muted, textTransform: "capitalize", fontWeight: "700", fontSize: 12 }, activeTabText: { color: COLORS.ink }, filterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, sectionTitle: { color: COLORS.ink, fontSize: 19, fontWeight: "800", marginTop: 5, marginBottom: 10 }, summaryGrid: { flexDirection: "row", gap: 8, marginBottom: 22 }, summary: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: COLORS.line }, summaryTitle: { fontSize: 12, fontWeight: "800" }, summaryValue: { color: COLORS.ink, fontSize: 17, fontWeight: "800", marginTop: 10 }, cardGrid: { gap: 10, marginBottom: 22 }, accountCard: { backgroundColor: COLORS.ink, borderRadius: 14, padding: 17 }, cardLabel: { color: "#aeb9b0", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, cardTitle: { color: COLORS.white, fontSize: 17, fontWeight: "800", marginTop: 7 }, accountAmount: { color: COLORS.white, fontSize: 20, fontWeight: "800", marginTop: 13 }, panel: { backgroundColor: COLORS.white, padding: 15, borderRadius: 13, borderWidth: 1, borderColor: COLORS.line, marginBottom: 20 }, chartRow: { marginBottom: 13 }, chartLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }, track: { height: 8, backgroundColor: "#ebe7df", borderRadius: 4, overflow: "hidden" }, fill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.line }, rowCopy: { flex: 1 }, rowTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "700" }, rowAmount: { color: COLORS.income, fontSize: 14, fontWeight: "800", marginLeft: 10 }, expense: { color: COLORS.expense }, income: { color: COLORS.income }, transactionLine: { marginBottom: 2 }, actions: { flexDirection: "row", gap: 15, justifyContent: "flex-end", paddingBottom: 8 }, actionText: { color: COLORS.blue, fontWeight: "800", fontSize: 12 }, deleteText: { color: COLORS.expense, fontWeight: "800", fontSize: 12 }, managementRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.line }, smallButton: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 }, smallButtonText: { color: "white", fontWeight: "800", fontSize: 12 }, chips: { marginBottom: 10 }, chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 10 }, chip: { backgroundColor: "#ebe7df", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }, selectedChip: { backgroundColor: "#f5d7ca" }, chipText: { color: COLORS.muted, fontSize: 12, fontWeight: "700" }, selectedChipText: { color: "#a6482b" }, input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: "#d9d4ca", borderRadius: 9, padding: 13, marginTop: 10, color: COLORS.ink }, label: { color: COLORS.ink, fontWeight: "800", fontSize: 13, marginTop: 16, marginBottom: 7 }, primary: { backgroundColor: COLORS.accent, borderRadius: 10, padding: 15, alignItems: "center", marginTop: 14 }, primaryText: { color: "white", fontWeight: "800" }, login: { padding: 28, marginTop: 80 }, modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(30,40,37,0.35)" }, modal: { maxHeight: "88%", backgroundColor: COLORS.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 }, panelTitle: { color: COLORS.ink, fontSize: 21, fontWeight: "800" } });
