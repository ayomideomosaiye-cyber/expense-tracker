import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const BG = '#000';
const CARD = '#0f0f0f';
const TEXT = '#fff';
const MUTED = '#b0b0b0';
const BORDER = '#1f1f1f';
const ACCENT = '#00f5d4';
const ACCENT2 = '#00d9ff';
const ACCENT3 = '#7b2cbf';
const DANGER = '#ff6b6b';
const WARNING = '#ffb84d';

export default function Index() {
  const [activeTab, setActiveTab] = useState('Track');
  const [expenses, setExpenses] = useState<{ name: string; amount: number; category: string; date: string }[]>([]);
  const [input, setInput] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('none');
  const [budgets, setBudgets] = useState<{ [category: string]: number }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [incomes, setIncomes] = useState<{ source: string; amount: number; date: string }[]>([]);
  const [incomeInput, setIncomeInput] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categories, setCategories] = useState(['Food', 'Transport', 'Data', 'Other']);

  useEffect(() => {
    AsyncStorage.getItem('expenses').then((saved) => {
      if (saved) setExpenses(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    AsyncStorage.getItem('incomes').then((saved) => {
      if (saved) setIncomes(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    AsyncStorage.getItem('categories').then((saved) => {
      if (saved) setCategories(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  function addExpense() {
    if (input.trim() === '' || amount.trim() === '' || Number(amount) <= 0) {
      return;
    }
    if (editingIndex !== null && expenses[editingIndex]) {
      const updated = [...expenses];
      updated[editingIndex] = { name: input, amount: Number(amount), category, date: expenses[editingIndex].date };
      setExpenses(updated);
      setEditingIndex(null);
      showToast('Changes saved!');
    } else {
      setExpenses([...expenses, { name: input, amount: Number(amount), category, date: new Date().toLocaleDateString() }]);
      showToast('Expense added!');
    }
    setInput('');
    setAmount('');
  }

  function addIncome() {
    if (incomeInput.trim() === '' || incomeAmount.trim() === '' || Number(incomeAmount) <= 0) {
      return;
    }
    setIncomes([...incomes, { source: incomeInput, amount: Number(incomeAmount), date: new Date().toLocaleDateString() }]);
    setIncomeInput('');
    setIncomeAmount('');
    showToast('Income added!');
  }

  function deleteIncome(indexToRemove: number) {
    confirmAction('Delete this income?', () => {
      setIncomes(incomes.filter((item, index) => index !== indexToRemove));
      showToast('Income deleted!');
    });
  }

  function deleteExpense(indexToRemove: number) {
    confirmAction('Delete this expense?', () => {
      if (indexToRemove === editingIndex) {
        setEditingIndex(null);
        setInput('');
        setAmount('');
      }
      setExpenses(expenses.filter((item, index) => index !== indexToRemove));
      showToast('Expense deleted!');
    });
  }

  function confirmAction(message: string, onConfirm: () => void) {
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        onConfirm();
      }
    } else {
      Alert.alert('Are you sure?', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm },
      ]);
    }
  }

  function formatCurrency(amount: number) {
    return amount.toLocaleString();
  }

  function getCategoryColor(cat: string) {
    if (categoryColors[cat]) {
      return categoryColors[cat];
    }
    const index = categories.indexOf(cat) % fallbackColors.length;
    return fallbackColors[index];
  }

  function startEdit(index: number) {
    const item = expenses[index];
    setInput(item.name);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setEditingIndex(index);
    setActiveTab('Track');
  }

  function setCategoryBudget(cat: string, value: string) {
    setBudgets({ ...budgets, [cat]: Number(value) });
  }

  function addCategory() {
    const trimmed = newCategoryInput.trim();
    if (trimmed === '' || categories.includes(trimmed)) {
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCategoryInput('');
    showToast('Category added!');
  }

  function clearAll() {
    setExpenses([]);
  }

  function showToast(message: string) {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2000);
  }

  async function exportData() {
    await Clipboard.setStringAsync(JSON.stringify(expenses, null, 2));
    showToast('Copied to clipboard!');
  }

  const categoryColors: { [key: string]: string } = {
    Food: ACCENT,
    Transport: ACCENT2,
    Data: ACCENT3,
    Other: WARNING,
  };
  const fallbackColors = ['#ff7edb', '#4dd4ac', '#f7b32b', '#5bc0de', '#c77dff'];

  const categoryTotals = categories.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  }));
  const maxCategoryTotal = Math.max(...categoryTotals.map((c) => c.total), 1);
  const highestExpense = expenses.length > 0
    ? expenses.reduce((biggest, item) => (item.amount > biggest.amount ? item : biggest), expenses[0])
    : null;
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <Text style={styles.title}>Expense Tracker</Text>

      <View style={styles.tabBar}>
        {['Track', 'Budgets', 'Income', 'Insights'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Track' && (
        <>
          {highestExpense && (
            <Text style={styles.mutedText}>
              💰 Biggest spend: {highestExpense.name} — ₦{formatCurrency(highestExpense.amount)}
            </Text>
          )}

          <TextInput
            placeholder="Enter an expense"
            placeholderTextColor={MUTED}
            value={input}
            onChangeText={setInput}
            style={styles.input}
          />
          <TextInput
            placeholder="Amount"
            placeholderTextColor={MUTED}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.row}>
            {[200, 500, 1000, 2000, 5000].map((preset) => (
              <Text key={preset} onPress={() => setAmount(preset.toString())} style={styles.presetPill}>
                ₦{preset}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            {categories.map((cat) => (
              <Text
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.pill, category === cat && styles.pillActiveAccent]}
              >
                {cat}
              </Text>
            ))}
          </View>

          <View style={styles.row}>
            <TextInput
              placeholder="New category name"
              placeholderTextColor={MUTED}
              value={newCategoryInput}
              onChangeText={setNewCategoryInput}
              style={[styles.input, { width: 180, marginRight: 8, marginBottom: 0 }]}
            />
            <TouchableOpacity onPress={addCategory} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={addExpense} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{editingIndex !== null ? "Save Changes" : "Add Expense"}</Text>
          </TouchableOpacity>

          {expenses.length === 0 && (
            <Text style={styles.emptyText}>No expenses yet, drop your first one above!</Text>
          )}

          {expenses.length > 0 && (
            <>
              <TextInput
                placeholder="Search expenses..."
                placeholderTextColor={MUTED}
                value={searchText}
                onChangeText={setSearchText}
                style={styles.input}
              />
              <View style={styles.row}>
                {['All', ...categories].map((cat) => (
                  <Text
                    key={cat}
                    onPress={() => setFilterCategory(cat)}
                    style={[styles.pill, filterCategory === cat && styles.pillActiveAccent2]}
                  >
                    {cat}
                  </Text>
                ))}
              </View>
              <View style={styles.row}>
                {['none', 'amount', 'date'].map((option) => (
                  <Text
                    key={option}
                    onPress={() => setSortBy(option)}
                    style={[styles.sortText, sortBy === option && styles.sortTextActive]}
                  >
                    {option === 'none' ? 'Default' : `Sort by ${option}`}
                  </Text>
                ))}
              </View>
            </>
          )}

          {expenses
            .map((item, index) => ({ ...item, originalIndex: index }))
            .filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
            .filter((item) => filterCategory === 'All' || item.category === filterCategory)
            .sort((a, b) => {
              if (sortBy === 'amount') return b.amount - a.amount;
              if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
              return 0;
            })
            .map((item) => (
              <View key={item.originalIndex} style={styles.listRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.cardText}>{item.name} — ₦{formatCurrency(item.amount)} · {item.date} </Text>
                  <Text style={[styles.badge, { backgroundColor: getCategoryColor(item.category) }]}>
                    {item.category}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text onPress={() => startEdit(item.originalIndex)} style={[styles.linkText, { color: ACCENT2, marginRight: 10 }]}>Edit</Text>
                  <Text onPress={() => deleteExpense(item.originalIndex)} style={[styles.linkText, { color: DANGER }]}>Delete</Text>
                </View>
              </View>
            ))}

          <Text style={styles.totalText}>
            Total: ₦{formatCurrency(expenses.reduce((sum, item) => sum + item.amount, 0))}
          </Text>

          {expenses.length > 0 && (
            <Text onPress={clearAll} style={[styles.linkText, { color: DANGER, marginTop: 10 }]}>Clear All</Text>
          )}
          {expenses.length > 0 && (
            <Text onPress={exportData} style={[styles.linkText, { color: ACCENT2, marginTop: 6 }]}>Export Data</Text>
          )}
        </>
      )}

      {activeTab === 'Budgets' && (
        <>
          {categories.map((cat) => (
            <View key={cat} style={styles.budgetRow}>
              <Text style={[styles.cardText, { width: 90 }]}>{cat}</Text>
              <TextInput
                placeholder="₦ limit"
                placeholderTextColor={MUTED}
                keyboardType="numeric"
                value={budgets[cat]?.toString() || ''}
                onChangeText={(value) => setCategoryBudget(cat, value)}
                style={[styles.input, { width: 100, marginBottom: 0, padding: 6 }]}
              />
            </View>
          ))}

          {Object.keys(budgets).filter((cat) => budgets[cat] > 0).map((cat) => {
            const spent = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
            const limit = budgets[cat];
            const percent = Math.min((spent / limit) * 100, 100);
            return (
              <View key={cat} style={styles.chartRow}>
                <Text style={[styles.cardText, { color: spent > limit ? DANGER : TEXT }]}>
                  {cat}: ₦{formatCurrency(spent)} / ₦{formatCurrency(limit)}
                </Text>
                <View style={styles.trackSmall}>
                  <View style={[styles.fill, { width: `${percent}%`, backgroundColor: spent > limit ? DANGER : ACCENT }]} />
                </View>
                {percent >= 100 ? (
                  <Text style={styles.warningText}>⚠ Budget exceeded</Text>
                ) : percent >= 80 ? (
                  <Text style={[styles.warningText, { color: WARNING }]}>⚠ Approaching limit</Text>
                ) : null}
              </View>
            );
          })}
        </>
      )}

      {activeTab === 'Income' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardText}>Income: ₦{formatCurrency(totalIncome)}</Text>
            <Text style={styles.cardText}>Expenses: ₦{formatCurrency(totalExpenses)}</Text>
            <Text style={[styles.cardText, { fontWeight: 'bold', color: remainingBalance < 0 ? DANGER : ACCENT, marginTop: 4 }]}>
              Balance: ₦{formatCurrency(remainingBalance)}
            </Text>
            {remainingBalance < 0 ? (
              <Text style={styles.warningText}>
                ⚠ You've spent more than you've earned — consider removing some expenses.
              </Text>
            ) : totalIncome > 0 && remainingBalance / totalIncome < 0.2 ? (
              <Text style={[styles.warningText, { color: WARNING }]}>
                ⚠ You're close to your limit — less than 20% of your income remains.
              </Text>
            ) : null}
          </View>

          <TextInput
            placeholder="Source (e.g. Salary)"
            placeholderTextColor={MUTED}
            value={incomeInput}
            onChangeText={setIncomeInput}
            style={styles.input}
          />
          <TextInput
            placeholder="Amount"
            placeholderTextColor={MUTED}
            value={incomeAmount}
            onChangeText={setIncomeAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <TouchableOpacity onPress={addIncome} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add Income</Text>
          </TouchableOpacity>

          {incomes.length === 0 ? (
            <Text style={styles.emptyText}>No income added yet.</Text>
          ) : (
            incomes.map((item, index) => (
              <View key={index} style={[styles.listRow, { marginTop: 8 }]}>
                <Text style={styles.cardText}>{item.source} — ₦{formatCurrency(item.amount)} · {item.date}</Text>
                <Text onPress={() => deleteIncome(index)} style={[styles.linkText, { color: DANGER }]}>Delete</Text>
              </View>
            ))
          )}
        </>
      )}

      {activeTab === 'Insights' && (
        <>
          {highestExpense && (
            <Text style={styles.mutedText}>
              💰 Biggest spend: {highestExpense.name} — ₦{formatCurrency(highestExpense.amount)}
            </Text>
          )}
          <Text style={styles.sectionHeading}>Spending by Category</Text>
          {categoryTotals.map(({ category, total }) => (
            <TouchableOpacity
              key={category}
              onPress={() => { setFilterCategory(category); setActiveTab('Track'); }}
              style={styles.chartRow}
            >
              <Text style={styles.cardText}>{category}: ₦{formatCurrency(total)}</Text>
              <View style={styles.trackLarge}>
                <View style={[styles.fill, { width: `${(total / maxCategoryTotal) * 100}%`, backgroundColor: ACCENT2 }]} />
              </View>
            </TouchableOpacity>
          ))}
          <Text style={[styles.mutedText, { fontSize: 12 }]}>Tap a category to jump to its filtered list on Track.</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: ACCENT, marginBottom: 14 },
  tabBar: { flexDirection: 'row', marginBottom: 20, backgroundColor: CARD, borderRadius: 10, padding: 4, width: 320 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: ACCENT },
  tabText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  mutedText: { color: MUTED, marginBottom: 10 },
  cardText: { color: TEXT },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 14, width: 250, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  input: { borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, color: TEXT, padding: 10, width: 250, marginBottom: 10, borderRadius: 8 },
  row: { flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' },
  pill: { marginRight: 8, marginBottom: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, color: TEXT },
  pillActiveAccent: { borderColor: ACCENT, backgroundColor: ACCENT, color: '#000' },
  pillActiveAccent2: { borderColor: ACCENT2, backgroundColor: ACCENT2, color: '#000' },
  presetPill: { marginRight: 8, marginBottom: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, color: MUTED },
  smallButton: { backgroundColor: ACCENT, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  smallButtonText: { color: '#000', fontWeight: '700' },
  primaryButton: { backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 8, width: 250, marginBottom: 10 },
  primaryButtonText: { color: '#000', fontWeight: '700', textAlign: 'center' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  emptyText: { marginTop: 10, marginBottom: 10, color: MUTED, fontStyle: 'italic' },
  sortText: { marginRight: 10, color: MUTED },
  sortTextActive: { color: TEXT, fontWeight: 'bold', textDecorationLine: 'underline' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 250, marginBottom: 4 },
  badge: { color: '#000', fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontWeight: '600', marginLeft: 4 },
  linkText: { textDecorationLine: 'underline' },
  totalText: { fontWeight: 'bold', color: TEXT, marginTop: 10, fontSize: 16 },
  sectionHeading: { fontWeight: 'bold', color: TEXT, marginTop: 6, marginBottom: 10 },
  warningText: { color: DANGER, fontSize: 12, marginTop: 2 },
  chartRow: { marginTop: 6, marginBottom: 8, width: 250 },
  trackLarge: { height: 14, backgroundColor: BORDER, borderRadius: 4, marginTop: 4 },
  trackSmall: { height: 8, backgroundColor: BORDER, borderRadius: 4, marginTop: 4 },
  fill: { height: '100%', borderRadius: 4 },
  toast: { backgroundColor: ACCENT, padding: 10, borderRadius: 8, marginBottom: 10, width: 250 },
  toastText: { color: '#000', textAlign: 'center', fontWeight: '600' },
});