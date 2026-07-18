(() => {
  'use strict';

  const VERSION = '1.8.62-dedup';
  const DB_NAME = 'offline-finance-tracker';
  const DB_VERSION = 1;
  const MIN_REPORT_MONTH = '2025-07';
  const STORE_NAMES = ['transactions', 'accounts', 'categories', 'assets', 'settings'];

  const TRANSACTION_TYPES = [
    { id: 'Expense', title: 'Expense', hint: 'Food, rent, travel, shopping' },
    { id: 'Income', title: 'Income', hint: 'Salary, interest, returns' },
    { id: 'Investment', title: 'Investment', hint: 'MF, stocks, FD, NPS' },
    { id: 'Transfer', title: 'Transfer', hint: 'Move money between accounts' },
    { id: 'Credit Card Payment', title: 'Card Payment', hint: 'Pay credit card bill' }
  ];

  const REPORT_TYPES = [
    { id: 'dashboard', label: 'Dashboard overview', group: 'overview' },
    { id: 'monthlyMetadata', label: 'Monthly trend / metadata', group: 'overview' },
    { id: 'cashflow', label: 'Cashflow & savings rate', group: 'overview' },
    { id: 'openingBalances', label: 'Opening balances', group: 'overview' },
    { id: 'income', label: 'Income by category', group: 'income' },
    { id: 'incomeTrend', label: 'Income monthly trend', group: 'income' },
    { id: 'expenses', label: 'Expenses by category', group: 'expenses' },
    { id: 'expenseTrend', label: 'Expense monthly trend', group: 'expenses' },
    { id: 'topExpenses', label: 'Largest expenses', group: 'expenses' },
    { id: 'budget', label: 'Budget vs actual', group: 'expenses' },
    { id: 'investmentOverview', label: 'Investment overview', group: 'investments' },
    { id: 'investmentSplit', label: 'Investment split', group: 'investments' },
    { id: 'mutualFunds', label: 'Mutual funds', group: 'investments' },
    { id: 'stocks', label: 'Stocks', group: 'investments' },
    { id: 'fixedDeposits', label: 'Fixed deposits', group: 'investments' },
    { id: 'otherInvestments', label: 'Other investments', group: 'investments' },
    { id: 'maturityCalendar', label: 'Maturity / review calendar', group: 'investments' },
    { id: 'savings', label: 'Savings / bank balances', group: 'accounts' },
    { id: 'creditCards', label: 'Credit cards', group: 'accounts' },
    { id: 'accountFlow', label: 'Account flow report', group: 'accounts' },
    { id: 'workbookSummary', label: 'Workbook-style monthly summary', group: 'allReports' },
    { id: 'workbookMatrices', label: 'Workbook-style detailed matrices', group: 'allReports' },
    { id: 'all', label: 'All reports', group: 'allReports' }
  ];

  const REPORT_GROUPS = [
    { id: 'favorites', title: 'Favorites', hint: 'Starred reports for quick access' },
    { id: 'overview', title: 'Overview', hint: 'Dashboard, monthly trend, opening balances' },
    { id: 'income', title: 'Income', hint: 'Sources, monthly trend' },
    { id: 'expenses', title: 'Expenses', hint: 'Categories, top spends, budget' },
    { id: 'investments', title: 'Investments', hint: 'MFs, stocks, FDs, maturity' },
    { id: 'accounts', title: 'Accounts & cards', hint: 'Balances, flows, cards' },
    { id: 'allReports', title: 'All reports', hint: 'Full report pack and workbook matrices' }
  ];

  const DASHBOARD_WIDGETS = [
    { id: 'periodKpis', label: 'Period KPI cards', hint: 'Income, expenses, investments, and net cashflow', size: 'full' },
    { id: 'positionKpis', label: 'Position KPI cards', hint: 'Cash/bank, card outstanding, invested value, and net worth', size: 'full' },
    { id: 'financeSplit', label: 'Finance overview split', hint: 'Savings, cash, FD, MF, stock, and other asset allocation', size: 'half' },
    { id: 'activitySplit', label: 'Month activity split', hint: 'Income, expense, and investment split for the selected month', size: 'half' },
    { id: 'expenseBreakdown', label: 'Expense breakdown', hint: 'Expense categories for the selected month', size: 'half' },
    { id: 'incomeBreakdown', label: 'Income breakdown', hint: 'Income categories for the selected month', size: 'half' },
    { id: 'creditCards', label: 'Credit cards', hint: 'Card spend and outstanding snapshot', size: 'half' },
    { id: 'topInvestments', label: 'Top investments', hint: 'Largest investments as of the selected month', size: 'half' }
  ];

  const DEFAULT_REPORT_DESCRIPTIONS = {
    dashboard: 'High-level dashboard for the selected month, including income, expenses, investments, cash/bank, card outstanding, and key activity splits.',
    monthlyMetadata: 'Workbook-style month-by-month trend report. Historical months stay visible, while live balances still follow the Go Live Date rule.',
    cashflow: 'Shows income left after expenses and investments. Credit-card bill payments are excluded from expenses to avoid double counting.',
    openingBalances: 'Lists opening account balances and initial investments that form the starting inventory at the Go Live Date.',
    income: 'Summarizes income for the selected period by category/source and lists the largest income entries.',
    incomeTrend: 'Shows income month by month, with incomplete months excluded from average calculations when configured.',
    expenses: 'Summarizes expenses for the selected period by category and paid-from account/card. Credit-card bill payments are excluded.',
    expenseTrend: 'Shows expenses month by month, with incomplete months excluded from average calculations when configured.',
    topExpenses: 'Highlights the largest and high-value expense entries for the selected period.',
    budget: 'Compares category budgets with actual expenses for the selected month.',
    investmentOverview: 'Summarizes opening investments, period additions, current value, and gain/loss by investment type.',
    investmentSplit: 'Shows the investment allocation split across mutual funds, stocks, fixed deposits, and other investments.',
    mutualFunds: 'Tracks mutual funds already held at go-live plus live investment entries after go-live.',
    stocks: 'Tracks stocks already held at go-live plus live investment entries after go-live.',
    fixedDeposits: 'Tracks FD principal, maturity value, interest, maturity date, and live FD additions after go-live.',
    otherInvestments: 'Tracks NSC, SGB, NPS, insurance, PPF, and other investment instruments.',
    maturityCalendar: 'Lists upcoming maturity/review dates for FDs and other assets where maturity date is available.',
    savings: 'Shows savings, cash, and company/reimbursement balances with inflows and outflows for the selected period.',
    creditCards: 'Shows credit-card spending, bill payments, and outstanding balances. Bill payments reduce outstanding but are not expenses.',
    accountFlow: 'Shows opening balance, inflow, outflow, net movement, and current balance for each account/card.',
    workbookSummary: 'Compact workbook-style monthly summary of income, expenses, investments, card payments, and net cashflow.',
    workbookMatrices: 'Detailed workbook-style monthly matrices by category, investment type, account, and card.',
    all: 'Full report pack combining the key dashboard, workbook summaries, income, expense, account, and investment reports.'
  };

  const SETUP_SECTIONS = [
    { id: 'start', title: 'General settings', hint: 'Go-live date, currency, averages' },
    { id: 'investments', title: 'Initial investments & accounts', hint: 'Opening balances, MFs, stocks, FDs' },
    { id: 'master', title: 'Manage Master Data', hint: 'Add, preview, edit, defaults' },
    { id: 'sync', title: 'Google sync', hint: 'Drive/Sheets backup and multi-device' }
  ];

  const DEFAULT_SETTINGS = {
    currency: 'INR',
    theme: 'teal',
    firstDayOfMonth: 1,
    trackingStartMonth: '2026-07',
    goLiveDate: '2026-07-01',
    syncUrl: '',
    syncSecret: '',
    autoSync: false,
    lastSyncAt: '',
    lastSyncStatus: '',
    deviceId: '',
    deviceName: '',
    excludedAverageMonths: '',
    defaultExpenseCategoryId: '',
    defaultIncomeCategoryId: '',
    defaultInvestmentCategoryId: '',
    defaultSavingsAccountId: '',
    defaultCashAccountId: '',
    defaultCreditCardAccountId: '',
    defaultCompanyAccountId: '',
    defaultMutualFundAssetId: '',
    defaultStockAssetId: '',
    defaultFdAssetId: '',
    defaultOtherInvestmentAssetId: '',
    favoriteReportIds: '',
    reportDescriptions: '{}',
    dashboardWidgetOrder: '',
    reportGroupOrder: '',
    reportPillOrder: '{}',
    inactiveAccountIds: '',
    inactiveCategoryIds: '',
    inactiveAssetIds: ''
  };

  const DEFAULT_ACCOUNTS = [
    { id: 'acc-hdfc-bank', name: 'HDFC Bank', accountType: 'Savings', openingBalance: 0, notes: '' },
    { id: 'acc-state-bank-of-india', name: 'State Bank of India', accountType: 'Savings', openingBalance: 0, notes: '' },
    { id: 'acc-yes-bank', name: 'Yes Bank', accountType: 'Savings', openingBalance: 0, notes: '' },
    { id: 'acc-federal-bank', name: 'Federal Bank', accountType: 'Savings', openingBalance: 0, notes: '' },
    { id: 'acc-cash', name: 'Cash', accountType: 'Cash', openingBalance: 0, notes: '' },
    { id: 'acc-company', name: 'Company / Reimbursement', accountType: 'Company', openingBalance: 0, notes: '' },
    { id: 'acc-icici-amazon-pay', name: 'ICICI Amazon Pay', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-icici-platinum', name: 'ICICI Platinum', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-hdfc-pixel', name: 'HDFC Pixel', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-hdfc-regalia-gold', name: 'HDFC Regalia Gold', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-hdfc-swiggy', name: 'HDFC Swiggy', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-federal-bank-imperio', name: 'Federal Bank Imperio', accountType: 'Credit Card', openingBalance: 0, notes: '' },
    { id: 'acc-federal-bank-scapia', name: 'Federal Bank Scapia', accountType: 'Credit Card', openingBalance: 0, notes: '' }
  ];

  const DEFAULT_CATEGORIES = [
    ...['Food', 'Cab', 'Grocery', 'Shopping', 'Gift', 'Entertainment', 'Rent', 'Phone/Internet', 'Medical', 'Travel', 'Other Expenses']
      .map(name => ({ id: slug('cat-exp-' + name), name, transactionType: 'Expense', includeInReports: true, monthlyBudget: 0 })),
    { id: 'cat-exp-credit-card-bill', name: 'Credit Card Bill', transactionType: 'Expense', includeInReports: false, monthlyBudget: 0 },
    ...['Salary', 'FD Interest', 'Savings Interest', 'Stock Returns', 'MF Returns', 'Other Income']
      .map(name => ({ id: slug('cat-inc-' + name), name, transactionType: 'Income', includeInReports: true, monthlyBudget: 0 })),
    ...['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Other Investments']
      .map(name => ({ id: slug('cat-inv-' + name), name, transactionType: 'Investment', includeInReports: true, monthlyBudget: 0 })),
    { id: 'cat-transfer', name: 'Transfer', transactionType: 'Transfer', includeInReports: false, monthlyBudget: 0 },
    { id: 'cat-card-payment', name: 'Credit Card Payment', transactionType: 'Credit Card Payment', includeInReports: false, monthlyBudget: 0 }
  ];

  const DEFAULT_ASSETS = [
    ...[
      'HDFC Flexi Cap',
      'Quant Small Cap',
      'Canara Robeco Flexi Cap',
      'Parag Parikh Flexi Cap',
      'SBI Multicap',
      'Quant Flexi Cap',
      'Quant ELSS Tax Saver (Zerodha)',
      'Canara Robeco ELSS Tax Saver (Zerodha)',
      'Quant ELSS Tax Saver (Groww)',
      'Canara Robeco ELSS Tax Saver (Groww)',
      'Mirae Asset (Groww)'
    ].map(name => ({ id: slug('asset-mf-' + name), name, investmentType: 'Mutual Funds', openingAmount: 0, currentValue: 0, maturityDate: '', notes: '' })),
    ...['Airtel', 'Federal Bank', 'Infosys', 'Jio Financial', 'LT', 'Reliance', 'TCS', 'Wipro', 'RLN KP', 'FDRL KP']
      .map(name => ({ id: slug('asset-stock-' + name), name, investmentType: 'Stocks', openingAmount: 0, currentValue: 0, maturityDate: '', notes: '' })),
    ...['HDFC Bank FD', 'State Bank of India FD', 'Yes Bank FD', 'Federal Bank FD']
      .map(name => ({ id: slug('asset-fd-' + name), name, investmentType: 'Fixed Deposits', openingAmount: 0, currentValue: 0, maturityDate: '', fdBankAccountId: defaultFdBankAccountIdForName(name), fdAccountNumber: '', fdPrincipal: 0, fdMaturityAmount: 0, fdInterestAmount: 0, notes: '' })),
    ...['NSC', 'SGB', 'TATA AIA LIFE INSURANCE', 'NPS', 'PPF']
      .map(name => ({ id: slug('asset-other-' + name), name, investmentType: 'Other Investments', openingAmount: 0, currentValue: 0, notes: '' }))
  ];

  let db;
  let state = {
    view: 'entry',
    editId: null,
    selectedType: 'Expense',
    selectedMonth: currentMonthKey(),
    selectedReport: 'dashboard',
    selectedReportCategory: 'overview',
    setupSection: 'start',
    setupQuickAdd: '',
    recordFilter: { month: currentMonthKey(), type: 'All', search: '', sort: 'dateDesc' },
    data: {
      transactions: [],
      accounts: [],
      categories: [],
      assets: [],
      settings: DEFAULT_SETTINGS
    },
    installPrompt: null,
    sync: { busy: false, pendingCount: 0, lastError: '' }
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    db = await openDatabase();
    await seedIfEmpty();
    await loadAll();
    await ensureDefaultMasterItems();
    await loadAll();
    await ensureDeviceSettings();
    await loadAll();
    await consolidateDuplicateMasterData();
    await loadAll();
    bindGlobalEvents();
    registerServiceWorker();
    window.addEventListener('online', () => scheduleAutoSync());
    render();
    if (syncConfigured() && state.data.settings.autoSync && navigator.onLine) scheduleAutoSync();
    toast('Ready for offline tracking');
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = event => {
        const database = event.target.result;
        for (const store of STORE_NAMES) {
          if (!database.objectStoreNames.contains(store)) {
            database.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function tx(storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  function getAll(storeName) {
    return new Promise((resolve, reject) => {
      const request = tx(storeName).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  function put(storeName, value) {
    return new Promise((resolve, reject) => {
      const request = tx(storeName, 'readwrite').put(value);
      request.onsuccess = () => resolve(value);
      request.onerror = () => reject(request.error);
    });
  }

  function remove(storeName, id) {
    return new Promise((resolve, reject) => {
      const request = tx(storeName, 'readwrite').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  function clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const request = tx(storeName, 'readwrite').clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  function withLocalChange(item, options = {}) {
    const now = options.now || new Date().toISOString();
    return {
      ...item,
      createdAt: item.createdAt || now,
      updatedAt: now,
      deviceId: state.data.settings.deviceId || item.deviceId || '',
      syncPending: true,
      isDeleted: false,
      deletedAt: ''
    };
  }

  function withRemoteChange(item) {
    return { ...item, syncPending: false };
  }

  function markDeleted(item) {
    const now = new Date().toISOString();
    return {
      ...(item || {}),
      id: item?.id || newId('deleted'),
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
      syncPending: true,
      deviceId: state.data.settings.deviceId || item?.deviceId || ''
    };
  }

  async function putLocal(storeName, item, options = {}) {
    const saved = await put(storeName, withLocalChange(item, options));
    return saved;
  }

  async function markStoreItemsSynced(storeName, ids) {
    const wanted = new Set(ids.map(String));
    const rows = await getAll(storeName);
    await Promise.all(rows.filter(row => wanted.has(String(row.id))).map(row => put(storeName, { ...row, syncPending: false })));
  }

  async function seedIfEmpty() {
    const [accounts, categories, assets] = await Promise.all([
      getAll('accounts'), getAll('categories'), getAll('assets')
    ]);
    if (accounts.length === 0) await Promise.all(DEFAULT_ACCOUNTS.map(item => put('accounts', item)));
    if (categories.length === 0) await Promise.all(DEFAULT_CATEGORIES.map(item => put('categories', item)));
    if (assets.length === 0) await Promise.all(DEFAULT_ASSETS.map(item => put('assets', item)));
    const settings = await getAll('settings');
    if (settings.length === 0) await put('settings', { id: 'default', ...DEFAULT_SETTINGS });
  }

  async function ensureDefaultMasterItems() {
    const accounts = await getAll('accounts');
    const assets = await getAll('assets');
    const activeAccounts = accounts.filter(notDeleted);
    const activeAssets = assets.filter(notDeleted);
    const hasAccount = name => activeAccounts.some(account => norm(account.name) === norm(name));
    const hasAsset = name => activeAssets.some(asset => norm(asset.name) === norm(name));
    const accountDefaults = [
      { id: 'acc-yes-bank', name: 'Yes Bank', accountType: 'Savings', openingBalance: 0, notes: '' },
      { id: 'acc-state-bank-of-india', name: 'State Bank of India', accountType: 'Savings', openingBalance: 0, notes: '' }
    ];
    const assetDefaults = [
      { id: 'asset-fd-yes-bank-fd', name: 'Yes Bank FD', investmentType: 'Fixed Deposits', openingAmount: 0, currentValue: 0, maturityDate: '', fdBankAccountId: 'acc-yes-bank', fdAccountNumber: '', fdPrincipal: 0, fdMaturityAmount: 0, fdInterestAmount: 0, notes: '' },
      { id: 'asset-fd-state-bank-of-india-fd', name: 'State Bank of India FD', investmentType: 'Fixed Deposits', openingAmount: 0, currentValue: 0, maturityDate: '', fdBankAccountId: 'acc-state-bank-of-india', fdAccountNumber: '', fdPrincipal: 0, fdMaturityAmount: 0, fdInterestAmount: 0, notes: '' }
    ];
    for (const account of accountDefaults) {
      if (!hasAccount(account.name)) await putLocal('accounts', account);
    }
    for (const asset of assetDefaults) {
      if (!hasAsset(asset.name)) await putLocal('assets', asset);
    }
  }

  async function loadAll() {
    const [transactions, accounts, categories, assets, settingsRows] = await Promise.all([
      getAll('transactions'), getAll('accounts'), getAll('categories'), getAll('assets'), getAll('settings')
    ]);
    const visibleTransactions = transactions.filter(notDeleted);
    const visibleAccounts = accounts.filter(notDeleted);
    const visibleCategories = categories.filter(notDeleted);
    const visibleAssets = assets.filter(notDeleted).map(normalizeAssetRecord);
    state.data.transactions = visibleTransactions.map(normalizeTransactionRecord).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
    state.data.accounts = visibleAccounts.sort((a, b) => String(a.accountType).localeCompare(String(b.accountType)) || a.name.localeCompare(b.name));
    state.data.categories = visibleCategories.sort((a, b) => String(a.transactionType).localeCompare(String(b.transactionType)) || a.name.localeCompare(b.name));
    state.data.assets = visibleAssets.sort((a, b) => String(a.investmentType).localeCompare(String(b.investmentType)) || a.name.localeCompare(b.name));
    state.data.settings = { ...DEFAULT_SETTINGS, ...(settingsRows.find(s => s.id === 'default') || {}) };
    state.sync.pendingCount = [transactions, accounts, categories, assets, settingsRows]
      .flat()
      .filter(item => item && item.syncPending)
      .length;
  }

  function notDeleted(item) {
    return !(item?.isDeleted || item?.deletedAt);
  }

  async function ensureDeviceSettings() {
    const settings = state.data.settings || DEFAULT_SETTINGS;
    const patch = {};
    if (!settings.deviceId) patch.deviceId = newId('dev');
    if (!settings.deviceName) patch.deviceName = guessDeviceName();
    if (Object.keys(patch).length) {
      await put('settings', { ...settings, ...patch, id: 'default' });
    }
  }

  function guessDeviceName() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'Android phone';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Mac/i.test(ua)) return 'Mac desktop';
    if (/Windows/i.test(ua)) return 'Windows desktop';
    return 'My device';
  }

  function bindGlobalEvents() {
    document.querySelector('.bottom-nav').addEventListener('click', event => {
      const button = event.target.closest('[data-view]');
      if (!button) return;
      state.view = button.dataset.view;
      state.editId = null;
      render();
    });

    document.getElementById('backupBtn').addEventListener('click', () => document.getElementById('backupDialog').showModal());
    document.getElementById('syncNowTopBtn')?.addEventListener('click', () => {
      if (!syncConfigured()) {
        state.view = 'manage';
        state.setupSection = 'sync';
        render();
        toast('Add your Google sync URL and key first');
        return;
      }
      syncNow({ forceAll: false });
    });
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
    document.getElementById('importJsonInput').addEventListener('change', importJson);
    document.getElementById('importExcelInput').addEventListener('change', importExcel);
    document.getElementById('resetDataBtn').addEventListener('click', resetAllData);

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      state.installPrompt = event;
      const installBtn = document.getElementById('installBtn');
      installBtn.hidden = false;
    });

    document.getElementById('installBtn').addEventListener('click', async () => {
      if (!state.installPrompt) return;
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      document.getElementById('installBtn').hidden = true;
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    navigator.serviceWorker.register('./sw.js').catch(() => {
      console.warn('Service worker registration failed. The app still stores data locally.');
    });
  }

  function render() {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === state.view));
    const main = document.getElementById('main');
    const views = {
      entry: renderEntry,
      home: renderHome,
      accounts: renderAccounts,
      reports: renderReports,
      records: renderRecords,
      manage: renderManage
    };
    main.innerHTML = `<section class="view">${views[state.view]()}</section>`;
    bindViewEvents();
  }

  function bindViewEvents() {
    if (state.view === 'entry') bindEntryEvents();
    if (state.view === 'home') bindHomeEvents();
    if (state.view === 'accounts') bindAccountsEvents();
    if (state.view === 'reports') bindReportsEvents();
    if (state.view === 'records') bindRecordsEvents();
    if (state.view === 'manage') bindManageEvents();
    bindRecordActionButtons();
    document.querySelectorAll('[data-recent-more]').forEach(button => button.addEventListener('click', () => {
      state.view = 'records';
      render();
    }));
  }

  function renderEntry() {
    const edit = state.editId ? state.data.transactions.find(t => t.id === state.editId) : null;
    const type = edit?.type || state.selectedType;
    return `
      <div class="card">
        <div class="card-title-row">
          <div>
            <h2>${edit ? 'Edit transaction' : 'Quick entry'}</h2>
            <p class="muted">Choose the flow first. The form changes based on what you are entering.</p>
          </div>
          ${edit ? '<button id="cancelEditBtn" class="ghost small">Cancel edit</button>' : ''}
        </div>
        <div class="type-grid" role="list">
          ${TRANSACTION_TYPES.map(item => `
            <button type="button" class="type-tile ${type === item.id ? 'active' : ''}" data-tx-type="${escapeHtml(item.id)}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.hint)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="card">
        ${transactionFormHtml(type, edit)}
      </div>
      <div class="grid two">
        ${renderMiniSummaryCard()}
        ${renderRecentCard()}
      </div>
    `;
  }

  function transactionFormHtml(type, edit = null) {
    const todayValue = edit?.date || todayISO();
    const amountValue = edit?.amount ?? '';
    const notesValue = edit?.notes || '';
    const isInvestment = type === 'Investment';
    const selectedAccountIds = [edit?.fromAccountId, edit?.toAccountId].filter(Boolean);
    const selectedAssetId = edit?.assetId || '';
    const normalAccounts = entryAccounts(a => a.accountType !== 'Credit Card', selectedAccountIds);
    const creditCards = entryAccounts(a => a.accountType === 'Credit Card', selectedAccountIds);
    const spendAccounts = type === 'Expense' || type === 'Investment' ? entryAccounts(() => true, selectedAccountIds) : normalAccounts;
    const investmentTypes = ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Other Investments'];
    const selectedInvestmentType = edit?.investmentType || defaultInvestmentTypeForEntry(investmentTypes) || investmentTypes[0] || 'Mutual Funds';
    const assetOptions = entryAssetsForType(selectedInvestmentType, selectedAssetId);

    return `
      <form id="transactionForm" class="form-grid">
        <input type="hidden" name="id" value="${escapeAttr(edit?.id || '')}">
        <input type="hidden" name="type" value="${escapeAttr(type)}">

        <div class="field">
          <label for="date">Date</label>
          <input id="date" name="date" type="date" required value="${escapeAttr(todayValue)}">
        </div>
        <div class="field">
          <label for="amount">Amount</label>
          <input id="amount" name="amount" type="number" inputmode="decimal" step="0.01" min="0" required placeholder="0.00" value="${escapeAttr(amountValue)}">
        </div>

        ${categoryFieldHtml(type, edit)}

        ${type === 'Expense' ? `
          <div class="field">
            <label for="fromAccountId">Paid from</label>
            ${selectHtml('fromAccountId', spendAccounts, edit?.fromAccountId || defaultSpendAccountId(spendAccounts), 'Select account', true)}
          </div>
        ` : ''}

        ${type === 'Income' ? `
          <div class="field">
            <label for="toAccountId">Received in</label>
            ${selectHtml('toAccountId', normalAccounts, edit?.toAccountId || defaultNormalAccountId(normalAccounts), 'Select account', true)}
          </div>
        ` : ''}

        ${type === 'Investment' ? `
          <div class="field">
            <label for="fromAccountId">Paid from</label>
            ${selectHtml('fromAccountId', spendAccounts, edit?.fromAccountId || defaultSpendAccountId(spendAccounts), 'Select account', true)}
          </div>
          <div class="field">
            <label for="investmentType">Investment type</label>
            <select id="investmentType" name="investmentType" required>
              ${investmentTypes.map(v => `<option value="${escapeAttr(v)}" ${v === selectedInvestmentType ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="assetId">Asset / instrument</label>
            <div class="asset-picker-row">
              ${assetSelectHtml(assetOptions, edit?.assetId || defaultAssetIdForInvestmentType(selectedInvestmentType))}
              <button type="button" id="entryAddAssetBtn" class="secondary small">+ Add new</button>
            </div>
            <small class="muted">Choose an existing investment item, or add a new one without leaving this entry.</small>
          </div>
          ${renderEntryExistingFdBankField(selectedInvestmentType, selectedAssetId)}
          <div class="field">
            <label for="maturityDate">Maturity date / optional</label>
            <input id="maturityDate" name="maturityDate" type="date" value="${escapeAttr(edit?.maturityDate || '')}">
          </div>
        ` : ''}

        ${type === 'Transfer' ? `
          <div class="field">
            <label for="fromAccountId">From account</label>
            ${selectHtml('fromAccountId', normalAccounts, edit?.fromAccountId || defaultNormalAccountId(normalAccounts), 'Select account', true)}
          </div>
          <div class="field">
            <label for="toAccountId">To account</label>
            ${selectHtml('toAccountId', normalAccounts, edit?.toAccountId, 'Select account', true)}
          </div>
        ` : ''}

        ${type === 'Credit Card Payment' ? `
          <div class="field">
            <label for="fromAccountId">Paid from</label>
            ${selectHtml('fromAccountId', normalAccounts, edit?.fromAccountId || defaultNormalAccountId(normalAccounts), 'Select bank/cash', true)}
          </div>
          <div class="field">
            <label for="toAccountId">Credit card</label>
            ${selectHtml('toAccountId', creditCards, edit?.toAccountId || defaultAccountIdForType('Credit Card'), 'Select credit card', true)}
          </div>
        ` : ''}

        <div class="field full">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" placeholder="Optional comment, bill details, order id, etc.">${escapeHtml(notesValue)}</textarea>
        </div>
        <div class="field full row">
          <button type="submit" class="primary">${edit ? 'Update transaction' : 'Save transaction'}</button>
          <button type="button" id="clearFormBtn" class="ghost">Clear</button>
        </div>
      </form>
      <p class="muted tiny">Tip: enter credit-card purchases as Expense paid from the card. Enter the actual card bill payment as Card Payment so expense reports do not double count.</p>
    `;
  }

  function categoryFieldHtml(type, edit) {
    if (type === 'Transfer' || type === 'Credit Card Payment' || type === 'Investment') return '';
    const cats = entryCategoriesFor(type, edit?.categoryId || '');
    return `
      <div class="field">
        <label for="categoryId">Category</label>
        ${selectHtml('categoryId', cats, edit?.categoryId || defaultCategoryIdFor(type), 'Select category', true)}
      </div>
    `;
  }

  function selectHtml(name, items, selected, placeholder, required = false) {
    return `
      <select id="${escapeAttr(name)}" name="${escapeAttr(name)}" ${required ? 'required' : ''}>
        <option value="">${escapeHtml(placeholder)}</option>
        ${items.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selected ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
      </select>
    `;
  }

  function assetSelectHtml(items, selected = '') {
    return `
      <select id="assetId" name="assetId" required>
        ${assetOptionsHtml(items, selected)}
      </select>
    `;
  }

  function assetOptionsHtml(items, selected = '') {
    return `<option value="">Select asset</option>` +
      items.map(item => `<option value="${escapeAttr(item.id)}" ${item.id === selected ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
  }

  function renderEntryAddAssetDialog(investmentType) {
    const isFd = investmentType === 'Fixed Deposits';
    const title = isFd ? 'Add new fixed deposit' : `Add new ${investmentType || 'investment asset'}`;
    const namePlaceholder = isFd ? 'Example: FD - Yes Bank - Dec 2026' : 'Example: New mutual fund / stock';
    return `
      <form id="entryAssetDialogForm" class="entry-asset-dialog-form">
        <div class="modal-head">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <p class="muted tiny">This creates a reusable master-data item and selects it in the current entry.</p>
          </div>
          <button type="button" class="icon-btn" id="entryAssetDialogClose" aria-label="Close">x</button>
        </div>
        <div class="form-grid">
          <div class="field full"><label>Asset name</label><input name="newAssetName" placeholder="${escapeAttr(namePlaceholder)}" required></div>
          <div class="field"><label>Opening invested before this transaction / optional</label><input name="newAssetOpeningAmount" type="number" step="0.01" value="0"></div>
          <div class="field"><label>Manual current value / optional</label><input name="newAssetCurrentValue" type="number" step="0.01" value="0"></div>
          <div class="field"><label>Maturity date / optional</label><input name="newAssetMaturityDate" type="date"></div>
          <div class="field full"><label>Comments / optional</label><textarea name="newAssetNotes" placeholder="Folio, demat note, policy detail, broker, FD remarks, etc."></textarea></div>
        </div>
        <div id="entryAssetDialogFdFields" class="fd-detail-box" ${isFd ? '' : 'hidden'}>
          <h3>FD details</h3>
          <p class="muted tiny">For a new FD, select the linked bank, then enter principal plus maturity amount or interest amount; the other field auto-fills.</p>
          <div class="form-grid">
            <div class="field"><label>Linked Bank</label>${fdBankSelectHtml('entryFdBankAccountId', defaultAccountIdForType('Savings'), true)}</div>
            <div class="field"><label>FD account number</label><input name="entryFdAccountNumber" placeholder="FD account no."></div>
            <div class="field"><label>Principal</label><input name="entryFdPrincipal" type="number" step="0.01" value="" ${fdCalcAttributes('entryNewAsset', 'principal')}></div>
            <div class="field"><label>Maturity amount</label><input name="entryFdMaturityAmount" type="number" step="0.01" value="" ${fdCalcAttributes('entryNewAsset', 'maturity')}></div>
            <div class="field"><label>Interest amount</label><input name="entryFdInterestAmount" type="number" step="0.01" value="" ${fdCalcAttributes('entryNewAsset', 'interest')}></div>
          </div>
        </div>
        <div class="row form-actions">
          <button type="submit" class="primary">Add and select</button>
          <button type="button" id="entryAssetDialogCancel" class="ghost">Cancel</button>
        </div>
      </form>
    `;
  }


  function renderEntryExistingFdBankField(investmentType, selectedAssetId = '') {
    const isFd = investmentType === 'Fixed Deposits';
    const asset = assetById(selectedAssetId);
    const selectedBank = asset?.fdBankAccountId || defaultAccountIdForType('Savings');
    return `
      <div id="entryExistingFdBankBox" class="field" ${isFd && selectedAssetId ? '' : 'hidden'}>
        <label>Linked Bank</label>
        ${fdBankSelectHtml('existingFdBankAccountId', selectedBank, false)}
        <small class="muted">Sets or updates the linked bank for the selected FD master item.</small>
      </div>
    `;
  }

  function bindEntryEvents() {
    document.querySelectorAll('[data-tx-type]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedType = button.dataset.txType;
        state.editId = null;
        render();
      });
    });

    const form = document.getElementById('transactionForm');
    form?.addEventListener('submit', saveTransaction);

    document.getElementById('clearFormBtn')?.addEventListener('click', () => {
      state.editId = null;
      render();
    });
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
      state.editId = null;
      render();
    });

    const syncEntryAssetControls = () => {
      const assetSelect = document.getElementById('assetId');
      const investmentTypeSelect = document.getElementById('investmentType');
      const existingFdBankBox = document.getElementById('entryExistingFdBankBox');
      const addButton = document.getElementById('entryAddAssetBtn');
      if (!assetSelect) return;
      const isFdType = investmentTypeSelect?.value === 'Fixed Deposits';
      if (addButton) {
        addButton.textContent = isFdType ? '+ Add FD' : '+ Add new';
        addButton.title = isFdType ? 'Add a new fixed deposit master item' : 'Add a new investment master item';
      }
      if (existingFdBankBox) {
        existingFdBankBox.hidden = !isFdType || !assetSelect.value;
        const existingSelect = existingFdBankBox.querySelector('[name="existingFdBankAccountId"]');
        const selectedAsset = assetById(assetSelect.value);
        if (existingSelect && selectedAsset) existingSelect.value = selectedAsset.fdBankAccountId || defaultAccountIdForType('Savings') || '';
      }
    };

    document.getElementById('investmentType')?.addEventListener('change', event => {
      const edit = state.editId ? state.data.transactions.find(t => t.id === state.editId) : null;
      const selected = event.target.value;
      const assetSelect = document.getElementById('assetId');
      if (assetSelect) {
        const selectedId = edit?.investmentType === selected ? edit.assetId || '' : defaultAssetIdForInvestmentType(selected);
        const options = entryAssetsForType(selected, selectedId);
        assetSelect.innerHTML = assetOptionsHtml(options, selectedId);
      }
      syncEntryAssetControls();
    });
    document.getElementById('assetId')?.addEventListener('change', syncEntryAssetControls);
    document.getElementById('entryAddAssetBtn')?.addEventListener('click', () => {
      const investmentType = document.getElementById('investmentType')?.value || 'Other Investments';
      openEntryAddAssetDialog(investmentType, syncEntryAssetControls);
    });
    bindFdAutoCalc(document);
    syncEntryAssetControls();
  }

  function ensureEntryAssetDialog() {
    let dialog = document.getElementById('entryAssetDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'entryAssetDialog';
      dialog.className = 'modal asset-modal';
      document.body.appendChild(dialog);
    }
    return dialog;
  }

  function openEntryAddAssetDialog(investmentType, afterSave) {
    const dialog = ensureEntryAssetDialog();
    dialog.innerHTML = renderEntryAddAssetDialog(investmentType);
    const form = dialog.querySelector('#entryAssetDialogForm');
    const close = () => dialog.open ? dialog.close() : null;
    dialog.querySelector('#entryAssetDialogClose')?.addEventListener('click', close);
    dialog.querySelector('#entryAssetDialogCancel')?.addEventListener('click', close);
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.investmentType = investmentType;
      const newAsset = await createAssetFromEntryData(data);
      if (!newAsset) return;
      await loadAll();
      const assetSelect = document.getElementById('assetId');
      if (assetSelect) {
        const options = entryAssetsForType(investmentType, newAsset.id);
        assetSelect.innerHTML = assetOptionsHtml(options, newAsset.id);
        assetSelect.value = newAsset.id;
      }
      close();
      afterSave?.();
      toast(`${newAsset.name} added and selected`);
    });
    bindFdAutoCalc(dialog);
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', 'open');
    dialog.querySelector('[name="newAssetName"]')?.focus();
  }

  async function createAssetFromEntryData(data) {
    const investmentType = data.investmentType || 'Other Investments';
    const name = String(data.newAssetName || '').trim();
    if (!name) {
      toast('Enter the new asset name or choose an existing asset');
      return null;
    }
    const duplicate = state.data.assets.find(asset => norm(asset.name) === norm(name) && assetInvestmentType(asset) === investmentType);
    if (duplicate) return duplicate;
    const isFd = investmentType === 'Fixed Deposits';
    let fdPrincipal = isFd ? num(data.entryFdPrincipal) : 0;
    let fdMaturity = isFd ? num(data.entryFdMaturityAmount) : 0;
    let fdInterest = isFd ? num(data.entryFdInterestAmount) : 0;
    if (isFd && fdPrincipal && fdMaturity && !fdInterest) fdInterest = fdMaturity - fdPrincipal;
    if (isFd && fdPrincipal && fdInterest && !fdMaturity) fdMaturity = fdPrincipal + fdInterest;
    const asset = {
      id: newId('asset'),
      name,
      investmentType,
      openingAmount: isFd ? (fdPrincipal || num(data.newAssetOpeningAmount)) : num(data.newAssetOpeningAmount),
      currentValue: num(data.newAssetCurrentValue),
      maturityDate: data.newAssetMaturityDate || '',
      fdBankAccountId: isFd ? String(data.entryFdBankAccountId || '').trim() : '',
      fdAccountNumber: isFd ? String(data.entryFdAccountNumber || '').trim() : '',
      fdPrincipal: isFd ? fdPrincipal : 0,
      fdMaturityAmount: isFd ? fdMaturity : 0,
      fdInterestAmount: isFd ? fdInterest : 0,
      notes: String(data.newAssetNotes || '').trim()
    };
    await putLocal('assets', asset);
    return asset;
  }

  async function saveTransaction(event) {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const type = data.type;
    const amount = Number(data.amount);
    if (!data.date || !Number.isFinite(amount) || amount <= 0) {
      toast('Please enter a valid date and amount');
      return;
    }
    if (type === 'Transfer' && data.fromAccountId === data.toAccountId) {
      toast('From and To account cannot be the same');
      return;
    }

    if (type === 'Investment' && data.assetId === '__new__') {
      const newAsset = await createAssetFromEntryData(data);
      if (!newAsset) return;
      data.assetId = newAsset.id;
      if (!data.maturityDate && newAsset.maturityDate) data.maturityDate = newAsset.maturityDate;
    } else if (type === 'Investment' && data.investmentType === 'Fixed Deposits' && data.assetId) {
      const linkedBank = String(data.existingFdBankAccountId || '').trim();
      const asset = state.data.assets.find(a => a.id === data.assetId);
      if (asset && linkedBank && asset.fdBankAccountId !== linkedBank) {
        await putLocal('assets', { ...asset, fdBankAccountId: linkedBank });
      }
    }
    const now = new Date().toISOString();
    const existing = data.id ? state.data.transactions.find(t => t.id === data.id) : null;
    const record = {
      id: data.id || newId('txn'),
      date: data.date,
      type,
      amount,
      categoryId: data.categoryId || defaultCategoryFor(type)?.id || '',
      fromAccountId: data.fromAccountId || '',
      toAccountId: data.toAccountId || '',
      investmentType: data.investmentType || '',
      assetId: data.assetId || '',
      maturityDate: data.maturityDate || '',
      notes: data.notes?.trim() || '',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    await putLocal('transactions', record);
    await loadAll();
    state.editId = null;
    state.selectedType = type;
    render();
    scheduleAutoSync();
    toast(existing ? 'Transaction updated' : 'Transaction saved');
  }

  function renderHome() {
    const summary = getMonthSummary(state.selectedMonth);
    const allBalances = accountBalances();
    const normalBalance = allBalances.filter(row => row.account.accountType !== 'Credit Card').reduce((sum, row) => sum + row.balance, 0);
    const cardOutstanding = allBalances.filter(row => row.account.accountType === 'Credit Card').reduce((sum, row) => sum + row.balance, 0);
    const invested = investmentRows().reduce((sum, row) => sum + row.invested, 0);
    const netWorth = normalBalance + invested - cardOutstanding;

    return `
      <div class="grid four">
        ${kpi('Cash + bank', money(normalBalance), 'Current liquid balance', normalBalance >= 0 ? 'good' : 'danger')}
        ${kpi('Card outstanding', money(cardOutstanding), 'Credit card liability', cardOutstanding > 0 ? 'warn' : 'good')}
        ${kpi('Invested', money(invested), 'Opening + investment entries', 'good')}
        ${kpi('Net worth', money(netWorth), 'Accounts + invested - cards', netWorth >= 0 ? 'good' : 'danger')}
      </div>

      <div class="card">
        <div class="card-title-row">
          <div>
            <h2>Month summary</h2>
            <p class="muted">Income, expenses, investments, and cash movement for selected month.</p>
          </div>
          ${monthSelectHtml('homeMonth', state.selectedMonth)}
        </div>
        <div class="grid four">
          ${kpi('Income', money(summary.income), '', 'good')}
          ${kpi('Expenses', money(summary.expense), '', summary.expense > summary.income ? 'danger' : '')}
          ${kpi('Investments', money(summary.investment), '', 'investment')}
          ${kpi('Net cashflow', money(summary.freeCashFlow), 'Income - expenses - investments; card bill payments excluded', summary.freeCashFlow >= 0 ? 'good' : 'danger')}
        </div>
      </div>

      <div class="grid two">
        ${renderExpenseBreakdown(state.selectedMonth)}
        ${renderRecentCard(8)}
      </div>
    `;
  }

  function bindHomeEvents() {
    document.getElementById('homeMonth')?.addEventListener('change', event => {
      state.selectedMonth = event.target.value;
      render();
    });
  }

  function renderAccounts() {
    const rows = accountBalances();
    const groups = groupBy(rows, row => row.account.accountType);
    return `
      <div class="card">
        <div class="card-title-row">
          <div>
            <h2>Accounts</h2>
            <p class="muted">Balances are calculated from opening balance plus your transactions.</p>
          </div>
          <button class="secondary small" data-view-jump="manage">Add account</button>
        </div>
        <div class="grid two">
          ${Object.keys(groups).sort().map(type => `
            <div class="subcard">
              <h3>${escapeHtml(type)}</h3>
              <div class="bar-list">
                ${groups[type].map(row => accountRowHtml(row)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h2>Investment assets</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Asset</th><th class="right">Invested</th><th class="right">Manual value</th><th>FD details</th></tr></thead>
            <tbody>
              ${investmentRows().map(row => `
                <tr>
                  <td>${escapeHtml(assetInvestmentType(row.asset))}</td>
                  <td>${escapeHtml(row.asset.name)}</td>
                  <td class="right amount investment">${money(row.invested)}</td>
                  <td class="right">${row.asset.currentValue ? money(num(row.asset.currentValue)) : '<span class="muted">-</span>'}</td>
                  <td>${isFixedDepositAsset(row.asset) ? escapeHtml(fdDetailsText(row.asset)) : '<span class="muted">-</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function accountRowHtml(row) {
    const max = Math.max(1, ...accountBalances().map(item => Math.abs(item.balance)));
    const pct = Math.min(100, Math.round(Math.abs(row.balance) / max * 100));
    const danger = row.account.accountType === 'Credit Card' && row.balance > 0;
    return `
      <div class="bar-row">
        <div>
          <strong>${escapeHtml(row.account.name)}</strong>
          <div class="muted tiny">Opening: ${money(num(row.account.openingBalance))}</div>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; ${danger ? 'background:var(--warn);' : ''}"></div></div>
        <div class="right amount ${danger ? 'card' : ''}">${money(row.balance)}</div>
      </div>
    `;
  }

  function bindAccountsEvents() {
    document.querySelector('[data-view-jump="manage"]')?.addEventListener('click', () => {
      state.view = 'manage';
      render();
    });
  }

  function renderReports() {
    const month = state.selectedMonth;
    let report = state.selectedReport || 'dashboard';
    let category = state.selectedReportCategory || reportGroupFor(report);
    let groupReports = reportTypesForCategory(category);
    const isEmptyFavorites = category === 'favorites' && groupReports.length === 0;

    if (!isEmptyFavorites) {
      if (!groupReports.some(item => item.id === report)) {
        report = groupReports[0]?.id || 'dashboard';
        state.selectedReport = report;
      }
    }

    const selectedReportMeta = reportTypeById(report);
    const selectedDescription = reportDescription(report);
    return `
      <div class="card">
        <div class="card-title-row">
          <div>
            <h2>Dashboard</h2>
            <p class="muted">Dashboards and reports are grouped to match the original workbook. Drag category/report pills to reorder them. Favorite reports, custom descriptions, and personal order are saved in settings.</p>
          </div>
        </div>
        <div class="type-grid report-category-grid draggable-pill-zone" aria-label="Report categories. Drag to reorder.">
          ${orderedReportGroups().map(group => `
            <button type="button" class="type-tile draggable-pill ${group.id === category ? 'active' : ''}" draggable="true" data-report-category="${escapeAttr(group.id)}" data-pill-kind="group" data-pill-id="${escapeAttr(group.id)}" title="Drag to reorder report categories">
              <span class="drag-grip" aria-hidden="true">⋮⋮</span>
              <strong>${escapeHtml(group.title)}</strong>
              <span>${escapeHtml(group.id === 'favorites' ? favoriteGroupHint() : group.hint)}</span>
            </button>
          `).join('')}
        </div>
        ${isEmptyFavorites ? renderNoFavoritesMessage() : `
          <div class="report-shortcut-list draggable-pill-zone" aria-label="Reports in selected group. Drag to reorder.">
            ${groupReports.map(item => `
              <button type="button" class="report-shortcut draggable-pill ${item.id === report ? 'active' : ''}" draggable="true" data-report-shortcut="${escapeAttr(item.id)}" data-pill-kind="report" data-pill-id="${escapeAttr(item.id)}" title="Drag to reorder reports in this group">
                <span class="drag-grip" aria-hidden="true">⋮⋮</span>
                <span class="favorite-symbol ${isFavoriteReport(item.id) ? 'on' : ''}" aria-hidden="true">${isFavoriteReport(item.id) ? '★' : '☆'}</span>
                ${escapeHtml(item.label)}
              </button>
            `).join('')}
          </div>
          <div class="report-controls v5-report-controls single-control">
            <div class="field">
              <label for="reportMonth">Month</label>
              ${monthSelectHtml('reportMonth', month, true)}
            </div>
          </div>
          <div class="report-personalization-card">
            <div class="row between report-description-head">
              <div>
                <p class="muted tiny report-context">Showing: ${escapeHtml(selectedReportMeta?.label || 'Dashboard overview')} · ${periodLabel(month)}</p>
                <p class="report-description-text">${escapeHtml(selectedDescription)}</p>
              </div>
              <button type="button" class="secondary small favorite-current-btn ${isFavoriteReport(report) ? 'is-favorite' : ''}" data-toggle-current-favorite="${escapeAttr(report)}">${isFavoriteReport(report) ? '★ Favorite' : '☆ Add favorite'}</button>
            </div>
            <details class="report-description-editor">
              <summary>Edit report description</summary>
              <form id="reportDescriptionForm" class="stack gap">
                <textarea name="reportDescription" rows="3" placeholder="Write a short description for this report">${escapeHtml(selectedDescription)}</textarea>
                <div class="row">
                  <button class="primary small" type="submit">Save description</button>
                  <button class="ghost small" type="button" id="resetReportDescriptionBtn">Reset to default</button>
                </div>
              </form>
            </details>
          </div>
        `}
      </div>
      ${isEmptyFavorites ? '' : renderReportBody(report, month)}
    `;
  }

  function bindReportsEvents() {
    document.querySelectorAll('[data-report-category]').forEach(button => button.addEventListener('click', () => {
      const nextCategory = button.dataset.reportCategory || 'overview';
      state.selectedReportCategory = nextCategory;
      const groupReports = reportTypesForCategory(nextCategory);
      if (groupReports.length) state.selectedReport = groupReports[0].id;
      render();
    }));
    document.querySelectorAll('[data-report-shortcut]').forEach(button => button.addEventListener('click', () => {
      state.selectedReport = button.dataset.reportShortcut || 'dashboard';
      state.selectedReportCategory = reportGroupFor(state.selectedReport);
      render();
    }));
    document.getElementById('reportMonth')?.addEventListener('change', event => {
      state.selectedMonth = event.target.value;
      render();
    });
    document.querySelector('[data-toggle-current-favorite]')?.addEventListener('click', async event => {
      await toggleFavoriteReport(event.currentTarget.dataset.toggleCurrentFavorite || state.selectedReport || 'dashboard');
    });
    document.getElementById('reportDescriptionForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await saveReportDescription(state.selectedReport || 'dashboard', String(form.get('reportDescription') || ''));
    });
    document.getElementById('resetReportDescriptionBtn')?.addEventListener('click', async () => {
      await resetReportDescription(state.selectedReport || 'dashboard');
    });
    bindReportPillOrdering();
    bindDashboardWidgetOrdering();
  }

  function reportTypeById(id) {
    return findReportType(id) || REPORT_TYPES[0];
  }

  function findReportType(id) {
    return REPORT_TYPES.find(report => report.id === id);
  }

  function reportGroupFor(id) {
    if (isFavoriteReport(id) && state.selectedReportCategory === 'favorites') return 'favorites';
    return reportTypeById(id)?.group || 'overview';
  }

  function reportTypesForCategory(category) {
    if (category === 'favorites') {
      return favoriteReportIds().map(id => findReportType(id)).filter(Boolean);
    }
    return applyReportOrder(category, REPORT_TYPES.filter(report => report.group === category));
  }

  function orderedReportGroups() {
    return applySavedOrder(REPORT_GROUPS, String(state.data.settings.reportGroupOrder || '').split(',').map(value => value.trim()), group => group.id);
  }

  function reportPillOrderMap() {
    return parseJsonObject(state.data.settings.reportPillOrder, {});
  }

  function applyReportOrder(category, reports) {
    const orderMap = reportPillOrderMap();
    const savedOrder = Array.isArray(orderMap[category]) ? orderMap[category] : String(orderMap[category] || '').split(',').map(value => value.trim());
    return applySavedOrder(reports, savedOrder, report => report.id);
  }

  function applySavedOrder(items, savedOrder, idGetter) {
    const byId = new Map(items.map(item => [String(idGetter(item)), item]));
    const ordered = [];
    for (const id of unique((savedOrder || []).map(String).filter(Boolean))) {
      if (byId.has(id)) {
        ordered.push(byId.get(id));
        byId.delete(id);
      }
    }
    return [...ordered, ...items.filter(item => byId.has(String(idGetter(item))))];
  }

  function favoriteReportIds() {
    const valid = new Set(REPORT_TYPES.map(report => report.id));
    return unique(String(state.data.settings.favoriteReportIds || '').split(',').map(value => value.trim()).filter(id => valid.has(id)));
  }

  function isFavoriteReport(id) {
    return favoriteReportIds().includes(id);
  }

  function favoriteGroupHint() {
    const count = favoriteReportIds().length;
    return count ? `${count} starred report${count === 1 ? '' : 's'}` : 'Star reports to create shortcuts';
  }

  function renderNoFavoritesMessage() {
    return `
      <div class="subcard favorites-empty">
        <h3>No favorite reports yet</h3>
        <p class="muted">Open any report and tap “Add favorite” to create a personal shortcut here. Favorites are useful for reports you check often, such as Expense monthly trend, Investment overview, or Credit cards.</p>
      </div>
    `;
  }

  function reportDescription(id) {
    const descriptions = reportDescriptionsMap();
    const custom = String(descriptions[id] || '').trim();
    return custom || defaultReportDescription(id);
  }

  function defaultReportDescription(id) {
    return DEFAULT_REPORT_DESCRIPTIONS[id] || reportTypeById(id)?.label || 'Report summary.';
  }

  function reportDescriptionsMap() {
    return parseJsonObject(state.data.settings.reportDescriptions, {});
  }

  function parseJsonObject(value, fallback = {}) {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value || '{}') : value;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  async function toggleFavoriteReport(reportId) {
    const id = findReportType(reportId) ? reportId : 'dashboard';
    const favorites = favoriteReportIds();
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    await putLocal('settings', { ...state.data.settings, id: 'default', favoriteReportIds: next.join(',') });
    await loadAll();
    if (state.selectedReportCategory === 'favorites' && !next.length) state.selectedReportCategory = 'favorites';
    if (state.selectedReportCategory === 'favorites' && !next.includes(state.selectedReport)) state.selectedReport = next[0] || 'dashboard';
    render();
    toast(next.includes(id) ? 'Added to favorites' : 'Removed from favorites');
  }

  async function saveReportDescription(reportId, description) {
    const id = findReportType(reportId) ? reportId : 'dashboard';
    const map = reportDescriptionsMap();
    const text = String(description || '').trim();
    if (!text || text === defaultReportDescription(id)) delete map[id];
    else map[id] = text;
    await putLocal('settings', { ...state.data.settings, id: 'default', reportDescriptions: JSON.stringify(map) });
    await loadAll();
    render();
    toast(text ? 'Report description saved' : 'Description reset');
  }

  async function resetReportDescription(reportId) {
    const id = findReportType(reportId) ? reportId : 'dashboard';
    const map = reportDescriptionsMap();
    delete map[id];
    await putLocal('settings', { ...state.data.settings, id: 'default', reportDescriptions: JSON.stringify(map) });
    await loadAll();
    render();
    toast('Description reset to default');
  }

  async function saveSettingsPatch(patch, message) {
    await putLocal('settings', { ...state.data.settings, id: 'default', ...patch });
    await loadAll();
    if (message) toast(message);
    if (syncConfigured() && state.data.settings.autoSync && navigator.onLine) scheduleAutoSync();
  }

  async function saveReportGroupOrder(ids) {
    const valid = new Set(REPORT_GROUPS.map(group => group.id));
    const next = mergeOrderIds(ids, REPORT_GROUPS.map(group => group.id), valid);
    await saveSettingsPatch({ reportGroupOrder: next.join(',') }, 'Report category order saved');
  }

  async function saveReportOrderForCategory(category, ids) {
    if (category === 'favorites') {
      const valid = new Set(REPORT_TYPES.map(report => report.id));
      const existing = favoriteReportIds();
      const next = mergeOrderIds(ids, existing, valid).filter(id => existing.includes(id));
      await saveSettingsPatch({ favoriteReportIds: next.join(',') }, 'Favorite report order saved');
      return;
    }
    const validReports = REPORT_TYPES.filter(report => report.group === category).map(report => report.id);
    const valid = new Set(validReports);
    const next = mergeOrderIds(ids, validReports, valid);
    const orderMap = reportPillOrderMap();
    orderMap[category] = next;
    await saveSettingsPatch({ reportPillOrder: JSON.stringify(orderMap) }, 'Report order saved');
  }

  function mergeOrderIds(candidateIds, fallbackIds, validSet) {
    const next = [];
    for (const id of candidateIds || []) {
      const clean = String(id || '').trim();
      if (clean && validSet.has(clean) && !next.includes(clean)) next.push(clean);
    }
    for (const id of fallbackIds || []) {
      if (validSet.has(id) && !next.includes(id)) next.push(id);
    }
    return next;
  }

  function reorderedIdsFromDrop(container, draggedId, targetId, selector) {
    const ids = [...container.querySelectorAll(selector)].map(el => el.dataset.pillId || el.dataset.dashboardWidget).filter(Boolean);
    if (!draggedId || !targetId || draggedId === targetId) return ids;
    const next = ids.filter(id => id !== draggedId);
    const targetIndex = next.indexOf(targetId);
    next.splice(targetIndex < 0 ? next.length : targetIndex, 0, draggedId);
    return next;
  }

  function bindReportPillOrdering() {
    document.querySelectorAll('.draggable-pill').forEach(pill => {
      pill.addEventListener('dragstart', event => {
        pill.classList.add('dragging');
        event.dataTransfer?.setData('text/plain', `pill:${pill.dataset.pillKind}:${pill.dataset.pillId}`);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      pill.addEventListener('dragend', () => pill.classList.remove('dragging'));
      pill.addEventListener('dragover', event => event.preventDefault());
      pill.addEventListener('drop', async event => {
        event.preventDefault();
        const raw = event.dataTransfer?.getData('text/plain') || '';
        const [, kind, draggedId] = raw.split(':');
        const targetKind = pill.dataset.pillKind;
        const targetId = pill.dataset.pillId;
        if (!draggedId || kind !== targetKind || draggedId === targetId) return;
        const container = pill.closest('.draggable-pill-zone');
        if (!container) return;
        if (kind === 'group') {
          const ids = reorderedIdsFromDrop(container, draggedId, targetId, '[data-pill-kind="group"]');
          await saveReportGroupOrder(ids);
        } else if (kind === 'report') {
          const ids = reorderedIdsFromDrop(container, draggedId, targetId, '[data-pill-kind="report"]');
          await saveReportOrderForCategory(state.selectedReportCategory || reportGroupFor(state.selectedReport), ids);
        }
        render();
      });
    });
  }

  function dashboardWidgetOrder() {
    const saved = String(state.data.settings.dashboardWidgetOrder || '').split(',').map(value => value.trim()).filter(Boolean);
    const valid = new Set(DASHBOARD_WIDGETS.map(widget => widget.id));
    return mergeOrderIds(saved, DASHBOARD_WIDGETS.map(widget => widget.id), valid);
  }

  function dashboardWidgetMeta(id) {
    return DASHBOARD_WIDGETS.find(widget => widget.id === id) || DASHBOARD_WIDGETS[0];
  }

  async function saveDashboardWidgetOrder(ids) {
    const valid = new Set(DASHBOARD_WIDGETS.map(widget => widget.id));
    const next = mergeOrderIds(ids, DASHBOARD_WIDGETS.map(widget => widget.id), valid);
    await saveSettingsPatch({ dashboardWidgetOrder: next.join(',') }, 'Dashboard layout saved');
  }

  async function resetDashboardLayout() {
    await saveSettingsPatch({ dashboardWidgetOrder: '' }, 'Dashboard layout reset');
    render();
  }

  function bindDashboardWidgetOrdering() {
    document.querySelectorAll('[data-dashboard-widget]').forEach(widget => {
      widget.addEventListener('dragstart', event => {
        widget.classList.add('dragging');
        event.dataTransfer?.setData('text/plain', `widget:${widget.dataset.dashboardWidget}`);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      });
      widget.addEventListener('dragend', () => widget.classList.remove('dragging'));
      widget.addEventListener('dragover', event => event.preventDefault());
      widget.addEventListener('drop', async event => {
        event.preventDefault();
        const raw = event.dataTransfer?.getData('text/plain') || '';
        const [, draggedId] = raw.split(':');
        const targetId = widget.dataset.dashboardWidget;
        if (!draggedId || draggedId === targetId) return;
        const container = widget.closest('.dashboard-widget-board');
        if (!container) return;
        const ids = reorderedIdsFromDrop(container, draggedId, targetId, '[data-dashboard-widget]');
        await saveDashboardWidgetOrder(ids);
        render();
      });
    });
    document.getElementById('resetDashboardLayoutBtn')?.addEventListener('click', resetDashboardLayout);
  }

  function reportSelectHtml(id, selected, category = reportGroupFor(selected)) {
    const items = reportTypesForCategory(category);
    return `
      <select id="${escapeAttr(id)}">
        ${items.map(r => `<option value="${escapeAttr(r.id)}" ${r.id === selected ? 'selected' : ''}>${escapeHtml(r.label)}</option>`).join('')}
      </select>
    `;
  }

  function renderReportBody(report, month) {
    switch (report) {
      case 'income': return renderIncomeReport(month);
      case 'incomeTrend': return renderIncomeTrendReport(month);
      case 'expenses': return renderExpensesReport(month);
      case 'expenseTrend': return renderExpenseTrendReport(month);
      case 'topExpenses': return renderTopExpensesReport(month);
      case 'savings': return renderSavingsReport(month);
      case 'creditCards': return renderCreditCardsReportFull(month);
      case 'accountFlow': return renderAccountFlowReport(month);
      case 'investmentOverview': return renderInvestmentOverviewReport(month);
      case 'investmentSplit': return renderInvestmentSplitReport(month);
      case 'mutualFunds': return renderInvestmentTypeReport('Mutual Funds', month);
      case 'fixedDeposits': return renderInvestmentTypeReport('Fixed Deposits', month);
      case 'stocks': return renderInvestmentTypeReport('Stocks', month);
      case 'otherInvestments': return renderInvestmentTypeReport('Other Investments', month);
      case 'maturityCalendar': return renderMaturityCalendarReport();
      case 'cashflow': return renderCashflowReport(month);
      case 'monthlyMetadata': return renderMonthlyMetadataReport(month);
      case 'openingBalances': return renderOpeningBalancesReport();
      case 'budget': return renderBudgetReport(month);
      case 'workbookSummary': return renderWorkbookSummaryReport();
      case 'workbookMatrices': return renderWorkbookMatricesReport();
      case 'all': return renderAllReports(month);
      case 'dashboard':
      default: return renderDashboardReport(month);
    }
  }

  function renderDashboardReport(month) {
    const order = dashboardWidgetOrder();
    return `
      <div class="card dashboard-customize-card">
        <div class="card-title-row">
          <div>
            <h2>Dashboard layout</h2>
            <p class="muted tiny">Drag widgets to personalize your dashboard. The layout is saved in this browser and can sync through Google Sheets when the v8 backend is deployed.</p>
          </div>
          <button type="button" class="ghost small" id="resetDashboardLayoutBtn">Reset layout</button>
        </div>
      </div>
      <div class="dashboard-widget-board" id="dashboardWidgetBoard">
        ${order.map(id => renderDashboardWidgetShell(id, month)).join('')}
      </div>
    `;
  }

  function renderDashboardWidgetShell(id, month) {
    const meta = dashboardWidgetMeta(id);
    return `
      <section class="dashboard-widget-shell ${meta.size === 'full' ? 'full' : ''}" draggable="true" data-dashboard-widget="${escapeAttr(id)}">
        <div class="dashboard-widget-dragbar">
          <span class="drag-grip" aria-hidden="true">⋮⋮</span>
          <div>
            <strong>${escapeHtml(meta.label)}</strong>
            <span>${escapeHtml(meta.hint)}</span>
          </div>
        </div>
        <div class="dashboard-widget-content">
          ${renderDashboardWidgetContent(id, month)}
        </div>
      </section>
    `;
  }

  function renderDashboardWidgetContent(id, month) {
    const summary = getPeriodSummary(month);
    const totals = overallPosition(month);
    switch (id) {
      case 'periodKpis':
        return `<div class="grid four">
          ${kpi('Income', money(summary.income), periodLabel(month), 'good')}
          ${kpi('Expenses', money(summary.expense), 'Credit card bill excluded', summary.expense > summary.income ? 'danger' : '')}
          ${kpi('Investments', money(summary.investment), 'New investment entries', 'investment')}
          ${kpi('Net cashflow', money(summary.freeCashFlow), 'Income - expenses - investments; card bill payments excluded', summary.freeCashFlow >= 0 ? 'good' : 'danger')}
        </div>`;
      case 'positionKpis':
        return `<div class="grid four">
          ${kpi('Cash + bank', money(totals.normalBalance), 'Opening + movements', totals.normalBalance >= 0 ? 'good' : 'danger')}
          ${kpi('Card outstanding', money(totals.cardOutstanding), 'Liability', totals.cardOutstanding > 0 ? 'warn' : 'good')}
          ${kpi('Invested value', money(totals.investedValue), 'Manual current value when available', 'good')}
          ${kpi('Net worth', money(totals.netWorth), 'Cash + investments - cards', totals.netWorth >= 0 ? 'good' : 'danger')}
        </div>`;
      case 'financeSplit': return renderFinanceOverviewPie(month);
      case 'activitySplit': return renderMonthlyActivityPie(month);
      case 'expenseBreakdown': return renderExpenseBreakdown(month);
      case 'incomeBreakdown': return renderIncomeBreakdown(month);
      case 'creditCards': return renderCreditCardReport(month);
      case 'topInvestments': return renderInvestmentReport(month);
      default: return renderExpenseBreakdown(month);
    }
  }

  function renderIncomeReport(month) {
    const rows = categoryTotals('Income', month).filter(r => r.total > 0);
    const txns = transactionsFor(month).filter(t => ['Income', 'Contribution'].includes(t.type)).sort((a, b) => num(b.amount) - num(a.amount));
    const total = sum(rows.map(r => r.total));
    const tableRows = rows.map(r => [categoryById(r.categoryId)?.name || 'Uncategorized', money(r.total), pctText(r.total, total)]);
    return `
      <div class="grid four">
        ${kpi('Total income', money(total), periodLabel(month), 'good')}
        ${kpi('Income entries', String(txns.length), 'Transactions counted')}
        ${kpi('Top source', rows[0] ? categoryById(rows[0].categoryId)?.name || 'Uncategorized' : '-', rows[0] ? money(rows[0].total) : '')}
        ${kpi('Average entry', money(txns.length ? sum(txns.map(t => t.amount)) / txns.length : 0), '')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Income by category</h2>${rows.length ? barList(rows, r => categoryById(r.categoryId)?.name || 'Uncategorized') : empty('No income found for this period.')}</div>
        <div class="card"><h2>Income table</h2>${tableHtml(['Category','Amount','Share'], tableRows, 'No income rows.')}</div>
      </div>
      <div class="card"><h2>Income entries</h2>${transactionTable(txns.slice(0, 25), 'No income entries for this period.')}</div>
    `;
  }

  function renderExpensesReport(month) {
    const rows = categoryTotals('Expense', month).filter(r => r.total > 0 && categoryById(r.categoryId)?.includeInReports !== false);
    const txns = transactionsFor(month).filter(t => t.type === 'Expense' && categoryById(t.categoryId)?.includeInReports !== false).sort((a, b) => num(b.amount) - num(a.amount));
    const total = sum(rows.map(r => r.total));
    const sourceRows = groupTotals(txns, t => accountById(t.fromAccountId)?.name || 'Unknown').map(r => [r.label, money(r.total), pctText(r.total, total)]);
    const categoryRows = rows.map(r => [categoryById(r.categoryId)?.name || 'Uncategorized', money(r.total), pctText(r.total, total)]);
    return `
      <div class="grid four">
        ${kpi('Total expenses', money(total), periodLabel(month), total > getPeriodSummary(month).income ? 'danger' : '')}
        ${kpi('Expense entries', String(txns.length), 'Credit-card bill excluded')}
        ${kpi('Top category', rows[0] ? categoryById(rows[0].categoryId)?.name || 'Uncategorized' : '-', rows[0] ? money(rows[0].total) : '')}
        ${kpi('Avg expense entry', money(txns.length ? total / txns.length : 0), 'Total expenses / entries')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Expenses by category</h2>${rows.length ? barList(rows, r => categoryById(r.categoryId)?.name || 'Uncategorized') : empty('No expenses for this period.')}</div>
        <div class="card"><h2>Expenses by account/card</h2>${sourceRows.length ? tableHtml(['Paid from','Amount','Share'], sourceRows) : empty('No source-wise expense rows.')}</div>
      </div>
      <div class="card"><h2>Category table</h2>${tableHtml(['Category','Amount','Share'], categoryRows, 'No category rows.')}</div>
      <div class="card"><h2>Largest expense entries</h2>${transactionTable(txns.slice(0, 25), 'No expenses for this period.')}</div>
    `;
  }

  function renderSavingsReport(month) {
    const rows = state.data.accounts
      .filter(a => a.accountType !== 'Credit Card')
      .map(account => ({ account, ...accountPeriodFlow(account, month), balance: calcAccountBalance(account, month) }))
      .sort((a, b) => b.balance - a.balance);
    const tableRows = rows.map(r => [r.account.accountType, r.account.name, money(num(r.account.openingBalance)), money(r.inflow), money(r.outflow), money(r.inflow - r.outflow), money(r.balance), r.account.notes || '']);
    return `
      <div class="grid four">
        ${kpi('Current bank/cash', money(sum(rows.map(r => r.balance))), 'All non-card accounts', 'good')}
        ${kpi('Period inflow', money(sum(rows.map(r => r.inflow))), periodLabel(month), 'good')}
        ${kpi('Period outflow', money(sum(rows.map(r => r.outflow))), 'Expenses + investments + transfers + card payments', 'warn')}
        ${kpi('Net movement', money(sum(rows.map(r => r.inflow - r.outflow))), '')}
      </div>
      <div class="card">
        <h2>Savings / cash / company balances</h2>
        <p class="muted tiny">Opening balance is the amount already available when you start tracking. Current balance adds all entries saved in this app.</p>
        ${tableHtml(['Type','Account','Opening','Inflow','Outflow','Net movement','Current balance','Comments'], tableRows, 'No accounts found.')}
      </div>
      <div class="card"><h2>Balance bars</h2>${rows.length ? barList(rows, r => r.account.name, r => Math.abs(r.balance)) : empty('No accounts found.')}</div>
    `;
  }

  function renderCreditCardsReportFull(month) {
    let rows = state.data.accounts
      .filter(a => a.accountType === 'Credit Card')
      .map(account => ({ account, ...creditCardPeriodFlow(account, month), balance: calcAccountBalance(account, month) }));
    const rowsByBalance = [...rows].sort((a, b) => b.balance - a.balance);
    const rowsBySpend = [...rows].sort((a, b) => b.spends - a.spends);
    const tableRows = rowsByBalance.map(r => [r.account.name, money(num(r.account.openingBalance)), money(r.spends), money(r.payments), money(r.spends - r.payments), money(r.balance), r.account.notes || '']);
    const totalOutstanding = sum(rows.map(r => r.balance));
    return `
      <div class="grid four">
        ${kpi('Total outstanding', money(totalOutstanding), 'Current card liability', totalOutstanding > 0 ? 'warn' : 'good')}
        ${kpi('Period spends', money(sum(rows.map(r => r.spends))), periodLabel(month), 'danger')}
        ${kpi('Period payments', money(sum(rows.map(r => r.payments))), 'Bill payments made', 'good')}
        ${kpi('Most used card', rowsBySpend[0]?.account.name || '-', rowsBySpend[0] ? money(rowsBySpend[0].spends) : '')}
      </div>
      <div class="card"><h2>Credit card summary</h2>${tableHtml(['Card','Opening outstanding','Spends','Payments','Net change','Current outstanding','Comments'], tableRows, 'No credit cards found.')}</div>
      <div class="card"><h2>Card spend share</h2>${rowsBySpend.length ? barList(rowsBySpend, r => r.account.name, r => r.spends) : empty('No credit-card spend rows.')}</div>
    `;
  }

  function renderInvestmentTypeReport(investmentType, month) {
    const rows = investmentSummaryRows(investmentType, month).sort((a, b) => b.totalInvested - a.totalInvested);
    const totalInvested = sum(rows.map(r => r.totalInvested));
    const currentValue = sum(rows.map(r => r.currentValue));
    const isFd = investmentType === 'Fixed Deposits';
    const tableHeaders = isFd
      ? ['Asset','Linked bank','FD account no.','Principal','Period invested','Total invested','Maturity amount','Interest','Current value','Gain/Loss','Maturity date','Comments']
      : ['Asset','Opening invested','Period invested','Total invested','Current value','Gain/Loss','Maturity date','Comments'];
    const tableRows = rows.map(r => isFd ? [
      r.asset.name,
      fdBankName(r.asset),
      r.asset.fdAccountNumber || '',
      money(fdPrincipalAmount(r.asset) || r.openingAmount),
      money(r.periodInvested),
      money(r.totalInvested),
      fdMaturityAmount(r.asset) ? money(fdMaturityAmount(r.asset)) : '',
      fdInterestAmount(r.asset) ? money(fdInterestAmount(r.asset)) : '',
      money(r.currentValue),
      money(r.gainLoss),
      r.asset.maturityDate ? formatDate(r.asset.maturityDate) : '',
      r.asset.notes || ''
    ] : [
      r.asset.name,
      money(r.openingAmount),
      money(r.periodInvested),
      money(r.totalInvested),
      money(r.currentValue),
      money(r.gainLoss),
      r.asset.maturityDate ? formatDate(r.asset.maturityDate) : '',
      r.asset.notes || ''
    ]);
    const txns = transactionsFor(month).filter(t => t.type === 'Investment' && normalizeInvestmentType(t.investmentType) === investmentType).sort((a, b) => num(b.amount) - num(a.amount));
    return `
      <div class="grid four">
        ${kpi(isFd ? 'Opening principal' : 'Opening invested', money(sum(rows.map(r => r.openingAmount))), 'Before app start')}
        ${kpi('Period invested', money(sum(rows.map(r => r.periodInvested))), periodLabel(month), 'investment')}
        ${kpi('Total invested', money(totalInvested), 'Opening + entries', 'good')}
        ${kpi(isFd ? 'Maturity value' : 'Current value', money(isFd ? sum(rows.map(r => fdMaturityAmount(r.asset) || r.currentValue)) : currentValue), isFd ? 'From principal + interest / maturity' : 'Manual value if entered', currentValue >= totalInvested ? 'good' : 'danger')}
      </div>
      <div class="card">
        <h2>${escapeHtml(investmentType)} summary</h2>
        <p class="muted tiny">Use Setup to enter investments already held as of your go-live date. Historical transactions before go live still appear as monthly activity, but are not added to total invested/live inventory. Maturity date is optional for mutual funds and stocks. For FDs, enter principal plus either maturity amount or interest amount; the other value auto-fills.</p>
        ${tableHtml(tableHeaders, tableRows, `No ${investmentType.toLowerCase()} assets found.`)}
      </div>
      <div class="card"><h2>${escapeHtml(investmentType)} allocation</h2>${rows.length ? barList(rows, r => r.asset.name, r => investmentDisplayValue({ asset: r.asset, invested: r.totalInvested, currentValue: r.currentValue })) : empty('No investment assets found.')}</div>
      ${isFd ? renderFdAllocationByBank(rows) : ''}
      <div class="card"><h2>Investment entries</h2>${transactionTable(txns.slice(0, 25), 'No investment entries for this period.')}</div>
    `;
  }


  function renderFdAllocationByBank(rows) {
    const grouped = groupTotals(rows, row => fdBankName(row.asset), row => investmentDisplayValue({ asset: row.asset, invested: row.totalInvested, currentValue: row.currentValue })).filter(row => row.total > 0);
    const total = sum(grouped.map(row => row.total));
    const tableRows = grouped.map(row => [row.label, money(row.total), pctText(row.total, total)]);
    return `
      <div class="card">
        <h2>FD allocation by bank</h2>
        <p class="muted tiny">FDs are grouped by the linked bank selected in Initial investments & accounts or Manage Master Data. Unlinked FDs are grouped separately.</p>
        ${grouped.length ? barList(grouped, row => row.label, row => row.total) : empty('No FD values entered yet.')}
        ${grouped.length ? tableHtml(['Bank','FD value','Share'], tableRows) : ''}
      </div>
    `;
  }

  function renderInvestmentSplitReport(month = 'All') {
    const investmentGroups = groupTotals(investmentReportRows(month), r => r.type, r => r.value).filter(r => r.total > 0);
    const total = sum(investmentGroups.map(r => r.total));
    const tableRows = investmentGroups.map(r => [r.label, money(r.total), pctText(r.total, total)]);
    return `
      <div class="grid four">
        ${kpi('Investment value', money(total), 'Manual current value when available', 'good')}
        ${kpi('Largest group', investmentGroups[0]?.label || '-', investmentGroups[0] ? money(investmentGroups[0].total) : '')}
        ${kpi('Groups', String(investmentGroups.length), 'Types with value')}
        ${kpi('Selected month', periodLabel(month), 'Balances as of this period')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Investment split</h2>${investmentGroups.length ? pieChartHtml(investmentGroups, r => r.label, r => r.total, { centerLabel: 'Investments', centerValue: money(total) }) : empty('No investment balances entered yet.')}</div>
        <div class="card"><h2>Investment split table</h2>${tableHtml(['Type','Amount','Share'], tableRows, 'No investment balances entered yet.')}</div>
      </div>
    `;
  }

  function renderMonthlyMetadataReport(month = 'All') {
    const rows = trendMonths().slice().reverse().map(m => {
      const s = getMonthSummary(m);
      return [formatMonth(m), money(s.income), money(s.expense), money(s.investment), money(s.cardPayment), money(s.freeCashFlow), money(s.bankCashMovement)];
    });
    return `
      <div class="card">
        <h2>Monthly trend / metadata</h2>
        <p class="muted tiny">Workbook metadata-style month-wise totals. The chart is shown first, latest months are shown first, and older months remain available by horizontal scrolling.</p>
        ${renderMonthTrend(month)}
      </div>
      <div class="card">
        <h2>Monthly metadata table</h2>
        ${tableHtml(['Month','Income','Expenses','Investments','Card payments','Net cashflow','Bank cash movement'], rows, 'No monthly data yet.')}
      </div>
    `;
  }

  function renderBudgetReport(month) {
    const rows = state.data.categories
      .filter(c => c.transactionType === 'Expense' && c.includeInReports !== false)
      .map(c => {
        const actual = sum(transactionsFor(month).filter(t => t.type === 'Expense' && t.categoryId === c.id).map(t => t.amount));
        const budget = num(c.monthlyBudget);
        return { category: c, budget, actual, variance: budget - actual };
      })
      .filter(r => r.budget > 0 || r.actual > 0)
      .sort((a, b) => b.actual - a.actual);
    const tableRows = rows.map(r => [r.category.name, money(r.budget), money(r.actual), money(r.variance), r.budget ? pctText(r.actual, r.budget) : '-']);
    return `
      <div class="grid four">
        ${kpi('Total budget', money(sum(rows.map(r => r.budget))), periodLabel(month))}
        ${kpi('Actual expense', money(sum(rows.map(r => r.actual))), 'Credit-card bill excluded')}
        ${kpi('Remaining', money(sum(rows.map(r => r.variance))), '', sum(rows.map(r => r.variance)) >= 0 ? 'good' : 'danger')}
        ${kpi('Categories tracked', String(rows.length), '')}
      </div>
      <div class="card"><h2>Budget vs actual</h2>${tableHtml(['Category','Budget','Actual','Remaining','Used'], tableRows, 'Add monthly budgets in Setup → Add category or edit category data via export/import.')}</div>
    `;
  }


  function renderCashflowReport(month) {
    const s = getPeriodSummary(month);
    const beforeInvestments = s.income - s.expense;
    const monthRows = trendMonths().slice().reverse().map(m => {
      const row = getMonthSummary(m);
      const retained = row.income - row.expense;
      return [formatMonth(m), money(row.income), money(row.expense), money(row.investment), money(row.cardPayment), money(row.freeCashFlow), money(row.bankCashMovement), pctText(retained, row.income)];
    });
    return `
      <div class="grid four">
        ${kpi('Income', money(s.income), periodLabel(month), 'good')}
        ${kpi('Expense', money(s.expense), 'Credit-card bill excluded', s.expense > s.income ? 'danger' : '')}
        ${kpi('Saved before investments', money(beforeInvestments), 'Income - expenses', beforeInvestments >= 0 ? 'good' : 'danger')}
        ${kpi('Savings rate', pctText(beforeInvestments, s.income), 'Before investments; card bill payments excluded from expense', beforeInvestments >= 0 ? 'good' : 'danger')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Net cashflow trend</h2>${renderCashflowNetTrend(month)}</div>
        <div class="card">
          <h2>Period cashflow</h2>
          ${tableHtml(['Metric','Amount'], [
            ['Income', money(s.income)],
            ['Expenses', money(s.expense)],
            ['Investments', money(s.investment)],
            ['Credit card payments', money(s.cardPayment)],
            ['Net cashflow', money(s.freeCashFlow)],
            ['Bank cash movement', money(s.bankCashMovement)]
          ])}
        </div>
      </div>
      <div class="card"><h2>Month-wise cashflow</h2>${tableHtml(['Month','Income','Expenses','Investments','Card payments','Net cashflow','Bank cash movement','Savings rate'], monthRows, 'No monthly data yet.')}</div>
    `;
  }

  function renderIncomeTrendReport(month = 'All') {
    const rows = knownMonths().sort().reverse().map(m => {
      const s = getMonthSummary(m);
      const top = categoryTotals('Income', m)[0];
      return {
        month: m,
        income: s.income,
        entries: transactionsFor(m).filter(t => ['Income', 'Contribution'].includes(t.type)).length,
        topCategory: top ? categoryById(top.categoryId)?.name || 'Uncategorized' : '-',
        topAmount: top ? top.total : 0
      };
    });
    const displayRows = month === 'All' ? rows : rows.filter(r => r.month === month);
    const periodTotal = sum(displayRows.map(r => r.income));
    const excluded = excludedAverageMonthSet();
    const averageRows = rows.filter(r => r.income > 0 && !excluded.has(r.month));
    const activeMonths = rows.filter(r => r.income > 0).length;
    const avgIncomeMonth = averageRows.length ? sum(averageRows.map(r => r.income)) / averageRows.length : 0;
    const top = categoryTotals('Income', month)[0];
    const categoryRows = categoryTotals('Income', month).map(r => [categoryById(r.categoryId)?.name || 'Uncategorized', money(r.total), pctText(r.total, periodTotal)]);
    const tableRows = displayRows.map(r => [formatMonth(r.month), money(r.income), String(r.entries), r.topCategory, money(r.topAmount), excluded.has(r.month) ? 'Excluded from averages' : 'Included']);
    return `
      <div class="grid four">
        ${kpi(month === 'All' ? 'Total income' : 'Selected month income', money(periodTotal), periodLabel(month), 'good')}
        ${kpi('Active income months', String(activeMonths), 'All data')}
        ${kpi('Avg income month', money(avgIncomeMonth), `${averageRows.length} months included; ${excluded.size} excluded`)}
        ${kpi('Top source', top ? categoryById(top.categoryId)?.name || 'Uncategorized' : '-', top ? money(top.total) : '')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Income trend</h2>${renderSingleMetricTrend(rows.filter(r => r.income > 0), 'income', month, 'Income', 'inc')}</div>
        <div class="card"><h2>${month === 'All' ? 'Income source mix' : 'Selected month source mix'}</h2>${categoryRows.length ? tableHtml(['Source','Amount','Share'], categoryRows) : empty('No income for this period.')}</div>
      </div>
      <div class="card"><h2>${month === 'All' ? 'Income by month' : 'Income for selected month'}</h2>${tableHtml(['Month','Income','Entries','Top source','Top source amount','Average status'], tableRows, 'No monthly income yet.')}</div>
    `;
  }

  function renderExpenseTrendReport(month = 'All') {
    const rows = knownMonths().sort().reverse().map(m => {
      const s = getMonthSummary(m);
      const top = categoryTotals('Expense', m).filter(r => categoryById(r.categoryId)?.includeInReports !== false)[0];
      return {
        month: m,
        expense: s.expense,
        entries: transactionsFor(m).filter(t => t.type === 'Expense' && categoryById(t.categoryId)?.includeInReports !== false).length,
        topCategory: top ? categoryById(top.categoryId)?.name || 'Uncategorized' : '-',
        topAmount: top ? top.total : 0,
        income: s.income
      };
    });
    const displayRows = month === 'All' ? rows : rows.filter(r => r.month === month);
    const periodTotal = sum(displayRows.map(r => r.expense));
    const excluded = excludedAverageMonthSet();
    const averageRows = rows.filter(r => r.expense > 0 && !excluded.has(r.month));
    const activeMonths = rows.filter(r => r.expense > 0).length;
    const avgExpenseMonth = averageRows.length ? sum(averageRows.map(r => r.expense)) / averageRows.length : 0;
    const top = categoryTotals('Expense', month).filter(r => categoryById(r.categoryId)?.includeInReports !== false)[0];
    const tableRows = displayRows.map(r => [formatMonth(r.month), money(r.expense), String(r.entries), r.topCategory, money(r.topAmount), pctText(r.expense, r.income), excluded.has(r.month) ? 'Excluded from averages' : 'Included']);
    const categoryRows = categoryTotals('Expense', month).filter(r => categoryById(r.categoryId)?.includeInReports !== false).map(r => [categoryById(r.categoryId)?.name || 'Uncategorized', money(r.total), pctText(r.total, periodTotal)]);
    return `
      <div class="grid four">
        ${kpi(month === 'All' ? 'Total expenses' : 'Selected month expenses', money(periodTotal), periodLabel(month), periodTotal > 0 ? 'warn' : '')}
        ${kpi('Active expense months', String(activeMonths), 'All data')}
        ${kpi('Avg expense month', money(avgExpenseMonth), `${averageRows.length} months included; ${excluded.size} excluded`)}
        ${kpi('Top category', top ? categoryById(top.categoryId)?.name || 'Uncategorized' : '-', top ? money(top.total) : '')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Expense trend</h2>${renderSingleMetricTrend(rows.filter(r => r.expense > 0), 'expense', month, 'Expense', 'exp')}</div>
        <div class="card"><h2>${month === 'All' ? 'Expense category mix' : 'Selected month category mix'}</h2>${categoryRows.length ? tableHtml(['Category','Amount','Share'], categoryRows) : empty('No expenses for this period.')}</div>
      </div>
      <div class="card"><h2>${month === 'All' ? 'Expenses by month' : 'Expenses for selected month'}</h2>${tableHtml(['Month','Expenses','Entries','Top category','Top category amount','Expense / income','Average status'], tableRows, 'No monthly expenses yet.')}</div>
    `;
  }

  function renderTopExpensesReport(month) {
    const txns = transactionsFor(month)
      .filter(t => t.type === 'Expense' && categoryById(t.categoryId)?.includeInReports !== false)
      .sort((a, b) => num(b.amount) - num(a.amount));
    const total = sum(txns.map(t => t.amount));
    const largest = txns[0];
    const avg = txns.length ? total / txns.length : 0;
    const highValue = txns.filter(t => num(t.amount) >= Math.max(5000, avg * 2));
    const byAccount = groupTotals(txns, t => accountById(t.fromAccountId)?.name || 'Unknown');
    return `
      <div class="grid four">
        ${kpi('Largest spend', largest ? money(largest.amount) : money(0), largest ? formatDate(largest.date) : '', largest ? 'danger' : '')}
        ${kpi('Average spend', money(avg), `${txns.length} entries`)}
        ${kpi('High-value entries', String(highValue.length), '>= max(5000, 2x average)', highValue.length ? 'warn' : 'good')}
        ${kpi('Top paid from', byAccount[0]?.label || '-', byAccount[0] ? money(byAccount[0].total) : '')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Spend by account/card</h2>${byAccount.length ? barList(byAccount, r => r.label, r => r.total) : empty('No expense entries found.')}</div>
        <div class="card"><h2>High-value entries</h2>${transactionTable(highValue.slice(0, 15), 'No high-value expenses for this period.')}</div>
      </div>
      <div class="card"><h2>Largest expense entries</h2>${transactionTable(txns.slice(0, 40), 'No expenses for this period.')}</div>
    `;
  }

  function renderInvestmentOverviewReport(month) {
    const types = ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Other Investments'];
    const rows = types.map(type => {
      const items = investmentSummaryRows(type, month);
      const opening = sum(items.map(r => r.openingAmount));
      const period = sum(items.map(r => r.periodInvested));
      const total = sum(items.map(r => r.totalInvested));
      const value = sum(items.map(r => investmentDisplayValue({ asset: r.asset, invested: r.totalInvested, currentValue: r.currentValue })));
      return { type, assets: items.length, opening, period, total, value, gainLoss: value - total };
    });
    const tableRows = rows.map(r => [r.type, String(r.assets), money(r.opening), money(r.period), money(r.total), money(r.value), money(r.gainLoss), pctText(r.gainLoss, r.total)]);
    const totalInvested = sum(rows.map(r => r.total));
    const totalValue = sum(rows.map(r => r.value));
    return `
      <div class="grid four">
        ${kpi('Opening invested', money(sum(rows.map(r => r.opening))), 'Before start month')}
        ${kpi('Period invested', money(sum(rows.map(r => r.period))), periodLabel(month), 'investment')}
        ${kpi('Total invested', money(totalInvested), 'Opening + entries', 'good')}
        ${kpi('Estimated value', money(totalValue), `Gain/Loss ${money(totalValue - totalInvested)}`, totalValue >= totalInvested ? 'good' : 'danger')}
      </div>
      <div class="grid two">
        <div class="card"><h2>Investment allocation</h2>${rows.some(r => r.total > 0) ? barList(rows.filter(r => r.total > 0), r => r.type, r => r.total) : empty('No invested amounts yet.')}</div>
        <div class="card"><h2>Investment value by type</h2>${rows.some(r => r.value > 0) ? barList(rows.filter(r => r.value > 0), r => r.type, r => r.value) : empty('No investment values yet.')}</div>
      </div>
      <div class="card"><h2>Investment overview table</h2>${tableHtml(['Type','Assets','Opening','Period invested','Total invested','Estimated value','Gain/Loss','Return %'], tableRows, 'No investment assets found.')}</div>
    `;
  }

  function renderMaturityCalendarReport() {
    const today = new Date();
    const items = state.data.assets
      .filter(asset => asset.maturityDate)
      .map(asset => {
        const days = Math.ceil((new Date(`${asset.maturityDate}T00:00:00`) - new Date(today.toDateString())) / 86400000);
        const row = investmentRows().find(item => item.asset.id === asset.id) || { invested: assetOpeningAmount(asset), currentValue: num(asset.currentValue) };
        const displayValue = isFixedDepositAsset(asset) ? (fdMaturityAmount(asset) || investmentDisplayValue(row)) : investmentDisplayValue(row);
        const status = days < 0 ? `Matured ${Math.abs(days)} days ago` : days === 0 ? 'Due today' : `Due in ${days} days`;
        return { asset, days, status, invested: row.invested, value: displayValue };
      })
      .sort((a, b) => a.days - b.days);
    const dueSoon = items.filter(item => item.days >= 0 && item.days <= 90);
    const matured = items.filter(item => item.days < 0);
    const tableRows = items.map(item => [assetInvestmentType(item.asset), item.asset.name, formatDate(item.asset.maturityDate), item.status, money(item.invested), money(item.value), item.asset.fdAccountNumber || '', item.asset.notes || '']);
    return `
      <div class="grid four">
        ${kpi('Items with dates', String(items.length), 'MF/stock dates are optional')}
        ${kpi('Due in 90 days', String(dueSoon.length), '', dueSoon.length ? 'warn' : 'good')}
        ${kpi('Already matured', String(matured.length), '', matured.length ? 'danger' : 'good')}
        ${kpi('Next item', items[0]?.asset.name || '-', items[0] ? formatDate(items[0].asset.maturityDate) : '')}
      </div>
      <div class="card">
        <h2>Maturity / review calendar</h2>
        <p class="muted tiny">Use this for FD maturity tracking and optional review dates for mutual funds, stocks, or other investments.</p>
        ${tableHtml(['Type','Asset','Maturity / review date','Status','Invested','Value / maturity amount','FD account no.','Comments'], tableRows, 'No maturity or review dates entered yet.')}
      </div>
    `;
  }

  function renderAccountFlowReport(month) {
    const rows = state.data.accounts.map(account => {
      if (account.accountType === 'Credit Card') {
        const flow = creditCardPeriodFlow(account, month);
        return { account, inflow: flow.spends, outflow: flow.payments, net: flow.spends - flow.payments, balance: calcAccountBalance(account, month), isCard: true };
      }
      const flow = accountPeriodFlow(account, month);
      return { account, inflow: flow.inflow, outflow: flow.outflow, net: flow.inflow - flow.outflow, balance: calcAccountBalance(account, month), isCard: false };
    }).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    const tableRows = rows.map(r => [r.account.accountType, r.account.name, money(num(r.account.openingBalance)), money(r.inflow), money(r.outflow), money(r.net), money(r.balance), r.account.notes || '']);
    return `
      <div class="grid four">
        ${kpi('Accounts', String(rows.length), '')}
        ${kpi('Money in / card spend', money(sum(rows.map(r => r.inflow))), periodLabel(month))}
        ${kpi('Money out / payments', money(sum(rows.map(r => r.outflow))), '')}
        ${kpi('Net movement', money(sum(rows.map(r => r.net))), '', sum(rows.map(r => r.net)) >= 0 ? 'good' : 'warn')}
      </div>
      <div class="card"><h2>Account flow report</h2>${tableHtml(['Type','Account','Opening','In / Spend','Out / Payment','Net movement','Current balance','Comments'], tableRows, 'No accounts found.')}</div>
    `;
  }

  function renderOpeningBalancesReport() {
    const accountRows = state.data.accounts.map(a => [a.accountType, a.name, money(num(a.openingBalance)), a.notes || '']);
    const assetRows = state.data.assets.map(a => [assetInvestmentType(a), a.name, money(assetOpeningAmount(a)), money(num(a.currentValue)), a.maturityDate ? formatDate(a.maturityDate) : '', isFixedDepositAsset(a) ? fdBankName(a) : '', a.fdAccountNumber || '', fdMaturityAmount(a) ? money(fdMaturityAmount(a)) : '', a.notes || '']);
    const trackingStart = goLiveMonth() ? formatMonth(goLiveMonth()) : '-';
    const goLive = goLiveDateISO() ? formatDate(goLiveDateISO()) : '-';
    return `
      <div class="grid four">
        ${kpi('Go-live date', goLive, 'Historical cutoff')}
        ${kpi('Tracking start', trackingStart, 'Go-live month')}
        ${kpi('Opening account balance', money(sum(state.data.accounts.map(a => num(a.openingBalance)))), 'All accounts')}
        ${kpi('Opening invested', money(sum(state.data.assets.map(assetOpeningAmount))), 'All investments')}
        ${kpi('Master items', String(state.data.accounts.length + state.data.assets.length), 'Accounts + assets')}
      </div>
      <div class="card"><h2>Historical data rule</h2><p class="muted">${escapeHtml(historicalSummaryText())}</p></div>
      <div class="grid two">
        <div class="card"><h2>Opening account balances</h2>${tableHtml(['Type','Account','Opening balance','Comments'], accountRows, 'No accounts found.')}</div>
        <div class="card"><h2>Opening investment assets</h2>${tableHtml(['Type','Asset','Opening invested','Manual current value','Date','FD linked bank','FD account no.','FD maturity amount','Comments'], assetRows, 'No investment assets found.')}</div>
      </div>
    `;
  }


  function renderFinanceOverviewPie(month = 'All') {
    const accountRows = accountBalances(month);
    const investmentReportRowsForMonth = investmentReportRows(month);
    const accountGroupValue = type => sum(accountRows
      .filter(row => row.account.accountType === type && row.balance > 0)
      .map(row => row.balance));
    const investmentTypeValue = type => sum(investmentReportRowsForMonth
      .filter(row => row.type === type)
      .map(row => row.value));
    const rows = [
      { label: 'Savings', value: accountGroupValue('Savings') },
      { label: 'Cash', value: accountGroupValue('Cash') },
      { label: 'Company / Reimbursement', value: accountGroupValue('Company') },
      { label: 'Mutual Funds', value: investmentTypeValue('Mutual Funds') },
      { label: 'Fixed Deposits', value: investmentTypeValue('Fixed Deposits') },
      { label: 'Stocks', value: investmentTypeValue('Stocks') },
      { label: 'Other Investments', value: investmentTypeValue('Other Investments') }
    ].filter(r => r.value > 0);
    return `
      <div class="card">
        <h2>Finance overview split</h2>
        <p class="muted tiny">Pie-style view of positive assets: savings, cash, company/reimbursement balances, FDs, mutual funds, stocks, and other investments. Credit cards are liabilities and are shown in net worth, not as positive assets.</p>
        ${rows.length ? pieChartHtml(rows, r => r.label, r => r.value, { centerLabel: 'Assets', centerValue: money(sum(rows.map(r => r.value))) }) : empty('No opening balances or investments entered yet.')}
      </div>
    `;
  }

  function renderMonthlyActivityPie(month = state.selectedMonth) {
    const s = getPeriodSummary(month);
    const rows = [
      { label: 'Income', value: s.income },
      { label: 'Expenses', value: s.expense },
      { label: 'Investments', value: s.investment }
    ].filter(r => r.value > 0);
    return `
      <div class="card">
        <h2>Month activity split</h2>
        <p class="muted tiny">Card bill payments are shown separately and not counted as expenses to avoid double counting credit-card purchases.</p>
        ${rows.length ? pieChartHtml(rows, r => r.label, r => r.value, { centerLabel: periodLabel(month), centerValue: money(s.freeCashFlow), colorMode: 'activity' }) : empty('No income, expense, or investment activity for this period.')}
      </div>
    `;
  }

  function renderWorkbookSummaryReport() {
    const months = trendMonths().slice().reverse();
    const rows = months.map(month => {
      const s = getMonthSummary(month);
      return [formatMonth(month), money(s.income), money(s.expense), money(s.investment), money(s.cardPayment), money(s.freeCashFlow), money(s.bankCashMovement)];
    });
    return `
      <div class="card">
        <h2>Workbook-style monthly summary</h2>
        <p class="muted tiny">Matches the workbook Metadata idea: month-wise Income, Expense, Investment, and Net Cashflow. Card payments are tracked separately and excluded from expenses/net cashflow to avoid double counting.</p>
        ${tableHtml(['Month','Income','Expenses','Investments','Card payments','Net cashflow','Bank cash movement'], rows, 'No monthly data yet.')}
      </div>
    `;
  }

  function renderWorkbookMatricesReport() {
    return `
      ${reportDivider('Workbook-style Income matrix')}
      ${monthlyCategoryMatrix('Income', 'Income', true)}
      ${reportDivider('Workbook-style Expense matrix')}
      ${monthlyCategoryMatrix('Expense', 'Expenses', true)}
      ${reportDivider('Workbook-style Investment matrix')}
      ${monthlyInvestmentTypeMatrix()}
      ${reportDivider('Workbook-style Accounts and cards matrix')}
      ${monthlyAccountMatrix()}
    `;
  }

  function monthlyCategoryMatrix(type, title, includeTotal = true) {
    const months = trendMonths().slice().reverse();
    const categories = state.data.categories
      .filter(c => c.transactionType === type && (type !== 'Expense' || c.includeInReports !== false))
      .sort((a, b) => a.name.localeCompare(b.name));
    const headers = ['Month', ...categories.map(c => c.name), ...(includeTotal ? ['Total'] : [])];
    const rows = months.map(month => {
      const totals = new Map(categoryTotals(type, month).map(r => [r.categoryId, r.total]));
      const values = categories.map(c => num(totals.get(c.id)));
      return [formatMonth(month), ...values.map(money), ...(includeTotal ? [money(sum(values))] : [])];
    });
    return `<div class="card"><h2>${escapeHtml(title)} by month</h2>${tableHtml(headers, rows, `No ${title.toLowerCase()} data yet.`)}</div>`;
  }

  function monthlyInvestmentTypeMatrix() {
    const months = trendMonths().slice().reverse();
    const types = ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Other Investments'];
    const rows = months.map(month => {
      const values = types.map(type => sum(transactionsFor(month).filter(t => t.type === 'Investment' && normalizeInvestmentType(t.investmentType) === type).map(t => t.amount)));
      return [formatMonth(month), ...values.map(money), money(sum(values))];
    });
    return `<div class="card"><h2>Investment type by month</h2>${tableHtml(['Month', ...types, 'Total'], rows, 'No investment data yet.')}</div>`;
  }

  function monthlyAccountMatrix() {
    const months = trendMonths().slice().reverse();
    const accounts = state.data.accounts.slice().sort((a, b) => `${a.accountType} ${a.name}`.localeCompare(`${b.accountType} ${b.name}`));
    const headers = ['Month', ...accounts.map(a => a.name), 'Total non-card', 'Card outstanding'];
    const rows = months.map(month => {
      const balances = accountBalances(month);
      const map = new Map(balances.map(r => [r.account.id, r.balance]));
      const values = accounts.map(a => num(map.get(a.id)));
      const nonCard = sum(balances.filter(r => r.account.accountType !== 'Credit Card').map(r => r.balance));
      const cards = sum(balances.filter(r => r.account.accountType === 'Credit Card').map(r => r.balance));
      return [formatMonth(month), ...values.map(money), money(nonCard), money(cards)];
    });
    return `<div class="card"><h2>Account balances by month</h2><p class="muted tiny">Uses Go Live Date logic: historical transactions before go live are excluded from balance calculations.</p>${tableHtml(headers, rows, 'No account data yet.')}</div>`;
  }

  function pieChartHtml(rows, labelGetter, valueGetter = r => r.total, options = {}) {
    const prepared = rows
      .map((row, index) => ({ row, index, label: String(labelGetter(row) || 'Other'), value: Math.max(0, num(valueGetter(row))) }))
      .filter(item => item.value > 0);
    if (!prepared.length) return empty('No values to chart.');
    const total = sum(prepared.map(item => item.value));
    let cursor = 0;
    const slices = prepared.map((item, index) => {
      const start = cursor;
      const end = cursor + item.value / total * 100;
      cursor = end;
      return `${pieColor(index, item.label, options.colorMode)} ${start.toFixed(3)}% ${end.toFixed(3)}%`;
    });
    return `
      <div class="pie-layout">
        <div class="pie-chart" style="background:conic-gradient(${slices.join(', ')});">
          <div class="pie-center">
            <span>${escapeHtml(options.centerLabel || 'Total')}</span>
            <strong>${escapeHtml(options.centerValue || money(total))}</strong>
          </div>
        </div>
        <div class="pie-legend">
          ${prepared.map((item, index) => `
            <div class="pie-legend-row">
              <span class="pie-dot" style="background:${pieColor(index, item.label, options.colorMode)}"></span>
              <span>${escapeHtml(item.label)}</span>
              <strong>${money(item.value)}</strong>
              <span class="muted tiny">${pctText(item.value, total)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function pieColor(index, label = '', mode = '') {
    const key = norm(label);
    if (mode === 'activity') {
      if (key.includes('income')) return '#067647';
      if (key.includes('expense')) return '#b42318';
      if (key.includes('invest')) return '#4f46e5';
    }
    const palette = ['#0f766e', '#4f46e5', '#0891b2', '#f59e0b', '#7c3aed', '#16a34a', '#db2777', '#64748b', '#dc2626', '#2563eb'];
    return palette[index % palette.length];
  }

  function renderAllReports(month) {
    return `
      ${renderDashboardReport(month)}
      ${reportDivider('Workbook-style summary')}
      ${renderWorkbookSummaryReport()}
      ${renderWorkbookMatricesReport()}
      ${reportDivider('Overview reports')}
      ${renderMonthlyMetadataReport(month)}
      ${renderCashflowReport(month)}
      ${renderOpeningBalancesReport()}
      ${reportDivider('Income reports')}
      ${renderIncomeReport(month)}
      ${renderIncomeTrendReport(month)}
      ${reportDivider('Expense reports')}
      ${renderExpensesReport(month)}
      ${renderExpenseTrendReport(month)}
      ${renderTopExpensesReport(month)}
      ${renderBudgetReport(month)}
      ${reportDivider('Account and card reports')}
      ${renderSavingsReport(month)}
      ${renderCreditCardsReportFull(month)}
      ${renderAccountFlowReport(month)}
      ${reportDivider('Investment reports')}
      ${renderInvestmentOverviewReport(month)}
      ${renderInvestmentSplitReport(month)}
      ${renderInvestmentTypeReport('Mutual Funds', month)}
      ${renderInvestmentTypeReport('Stocks', month)}
      ${renderInvestmentTypeReport('Fixed Deposits', month)}
      ${renderInvestmentTypeReport('Other Investments', month)}
      ${renderMaturityCalendarReport()}
    `;
  }

  function reportDivider(title) {
    return `<div class="card report-divider"><h2>${escapeHtml(title)}</h2></div>`;
  }

  function renderMonthTrend(selectedMonth = 'All') {
    const months = trendMonths().slice().reverse();
    if (!months.length) {
      return empty('No monthly data yet. Import or enter transactions to see the trend.');
    }
    const summaries = months.map(getMonthSummary);
    const max = Math.max(1, ...summaries.flatMap(s => [s.income, s.expense, s.investment]));
    const tableRows = months.map((month, index) => {
      const s = summaries[index];
      return [formatMonth(month), money(s.income), money(s.expense), money(s.investment), money(s.cardPayment), money(s.freeCashFlow), money(s.bankCashMovement)];
    });
    const highlightText = selectedMonth !== 'All' ? ` Selected report month: ${formatMonth(selectedMonth)}.` : '';
    return `
      <p class="muted tiny">Latest months are shown first; older months continue to the right. Historical months before Go Live remain visible in trends, but do not affect live balances. Investments are shown as blue/purple bars.${escapeHtml(highlightText)}</p>
      <div class="trend-scroll latest-first" tabindex="0" aria-label="Scrollable monthly trend chart, latest months first">
        <div class="month-bars trend-month-bars value-bars">
          ${months.map((month, index) => {
            const s = summaries[index];
            const isSelected = selectedMonth !== 'All' && month === selectedMonth;
            return `
              <div class="month-bar ${isSelected ? 'selected' : ''}">
                <div class="vbar-wrap">
                  ${valueBar('Income', s.income, max, 'inc')}
                  ${valueBar('Expense', s.expense, max, 'exp')}
                  ${valueBar('Investment', s.investment, max, 'inv')}
                </div>
                <strong>${formatMonthShort(month)}</strong>
                <span class="net-label">Net: ${shortMoney(s.freeCashFlow)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="row tiny muted trend-legend">
        <span class="pill good">Income</span>
        <span class="pill danger">Expense</span>
        <span class="pill investment">Investment</span>
        <span>Bar labels show compact amounts. Net = income - expenses - investments. Card bill payments are separate balance movements.</span>
      </div>
      <div class="trend-table-wrap">
        ${tableHtml(['Month','Income','Expenses','Investments','Card payments','Net cashflow','Bank cash movement'], tableRows, 'No monthly data yet.')}
      </div>
    `;
  }

  function valueBar(label, value, max, cls) {
    const height = Math.max(2, num(value) / Math.max(1, max) * 118);
    return `
      <div class="vbar-col" title="${escapeAttr(label)} ${escapeAttr(money(value))}">
        <span class="vbar-value">${escapeHtml(shortMoney(value))}</span>
        <div class="vbar ${escapeAttr(cls)}" style="height:${height}px"></div>
      </div>
    `;
  }

  function renderCashflowNetTrend(selectedMonth = 'All') {
    const months = trendMonths().slice().reverse();
    if (!months.length) return empty('No monthly cashflow yet.');
    const rows = months.map(month => ({ month, ...getMonthSummary(month) }));
    const max = Math.max(1, ...rows.map(r => Math.abs(r.freeCashFlow)));
    return `
      <p class="muted tiny">Dedicated cashflow view: one net bar per month, latest first. Positive net means income left after expenses and investments.</p>
      <div class="trend-scroll latest-first" tabindex="0" aria-label="Scrollable net cashflow chart, latest months first">
        <div class="month-bars cashflow-month-bars value-bars">
          ${rows.map(r => {
            const isSelected = selectedMonth !== 'All' && r.month === selectedMonth;
            const positive = r.freeCashFlow >= 0;
            return `
              <div class="month-bar ${isSelected ? 'selected' : ''}">
                <div class="vbar-wrap single-bar">
                  <div class="vbar-col" title="Net cashflow ${escapeAttr(money(r.freeCashFlow))}">
                    <span class="vbar-value">${escapeHtml(shortMoney(r.freeCashFlow))}</span>
                    <div class="vbar ${positive ? 'inc' : 'exp'}" style="height:${Math.max(2, Math.abs(r.freeCashFlow) / max * 118)}px"></div>
                  </div>
                </div>
                <strong>${formatMonthShort(r.month)}</strong>
                <span class="net-label">${positive ? '+' : ''}${shortMoney(r.freeCashFlow)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderSingleMetricTrend(rows, metricKey, selectedMonth = 'All', label = 'Value', cls = 'inc') {
    if (!rows.length) return empty(`No ${label.toLowerCase()} trend yet.`);
    const max = Math.max(1, ...rows.map(r => num(r[metricKey])));
    return `
      <p class="muted tiny">Latest months are shown first. Select a month above to filter KPIs/tables and highlight that month in this trend.</p>
      <div class="trend-scroll latest-first" tabindex="0" aria-label="Scrollable ${escapeAttr(label)} trend chart, latest months first">
        <div class="month-bars cashflow-month-bars value-bars">
          ${rows.map(r => {
            const isSelected = selectedMonth !== 'All' && r.month === selectedMonth;
            const value = num(r[metricKey]);
            return `
              <div class="month-bar ${isSelected ? 'selected' : ''}">
                <div class="vbar-wrap single-bar">
                  ${valueBar(label, value, max, cls)}
                </div>
                <strong>${formatMonthShort(r.month)}</strong>
                <span class="net-label">${shortMoney(value)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function trendMonths() {
    const transactionMonths = unique(state.data.transactions.map(t => monthKey(t.date)).filter(isReportMonthAllowed)).sort();
    const goLive = isReportMonthAllowed(goLiveMonth()) ? goLiveMonth() : MIN_REPORT_MONTH;
    const current = currentMonthKey() >= MIN_REPORT_MONTH ? currentMonthKey() : MIN_REPORT_MONTH;
    const anchors = [...transactionMonths, goLive, current].filter(isReportMonthAllowed).sort();
    if (!anchors.length) return [];
    const start = anchors[0] < MIN_REPORT_MONTH ? MIN_REPORT_MONTH : anchors[0];
    const end = anchors[anchors.length - 1];
    return monthRange(start, end).filter(isReportMonthAllowed);
  }

  function renderExpenseBreakdown(month) {
    const rows = categoryTotals('Expense', month).filter(r => r.total > 0 && categoryById(r.categoryId)?.includeInReports !== false);
    return `
      <div class="card">
        <h2>Expense breakdown</h2>
        ${rows.length ? barList(rows, r => categoryById(r.categoryId)?.name || 'Uncategorized') : empty('No expenses for this period yet.')}
      </div>
    `;
  }

  function renderIncomeBreakdown(month) {
    const rows = categoryTotals('Income', month).filter(r => r.total > 0);
    return `
      <div class="card">
        <h2>Income breakdown</h2>
        ${rows.length ? barList(rows, r => categoryById(r.categoryId)?.name || 'Uncategorized') : empty('No income for this period yet.')}
      </div>
    `;
  }

  function renderCreditCardReport(month) {
    const cardRows = accountBalances(month).filter(row => row.account.accountType === 'Credit Card');
    return `
      <div class="card">
        <h2>Credit cards</h2>
        <div class="bar-list">
          ${cardRows.map(row => {
            const spend = sumTransactions(t => t.fromAccountId === row.account.id && t.type === 'Expense' && matchesMonth(t, month));
            const max = Math.max(1, ...cardRows.map(r => Math.max(0, r.balance)));
            return `
              <div class="bar-row">
                <div>
                  <strong>${escapeHtml(row.account.name)}</strong>
                  <div class="muted tiny">Period spend: ${money(spend)}</div>
                </div>
                <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, Math.max(2, Math.abs(row.balance) / max * 100))}%; background:var(--warn);"></div></div>
                <div class="right amount card">${money(row.balance)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderInvestmentReport(month = 'All') {
    const rows = investmentRows(month).filter(row => row.invested > 0).sort((a, b) => b.invested - a.invested).slice(0, 8);
    return `
      <div class="card">
        <h2>Top investments</h2>
        <p class="muted tiny">Filtered as of ${periodLabel(month)}. ${escapeHtml(historicalSummaryText())}</p>
        ${rows.length ? barList(rows, r => r.asset.name, r => r.invested) : empty('No investment entries yet.')}
      </div>
    `;
  }

  function tableHtml(headers, rows, emptyMessage = 'No rows found.') {
    if (!rows || rows.length === 0) return empty(emptyMessage);
    const amountHeaders = /amount|balance|opening|current|income|expense|invest|payment|cash|outflow|inflow|value|loss|budget|actual|remaining|spend|paid|net/i;
    return `
      <div class="table-wrap compact-table">
        <table>
          <thead><tr>${headers.map(h => `<th class="${amountHeaders.test(h) ? 'right' : ''}">${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map((cell, i) => `<td class="${amountHeaders.test(headers[i]) ? 'right amount' : ''}">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function transactionTable(txns, emptyMessage = 'No transactions found.') {
    const rows = txns.map(t => [
      formatDate(t.date),
      t.type,
      categoryById(t.categoryId)?.name || '',
      accountById(t.fromAccountId)?.name || '',
      accountById(t.toAccountId)?.name || '',
      assetById(t.assetId)?.name || '',
      money(t.amount),
      t.notes || ''
    ]);
    return tableHtml(['Date','Type','Category','From','To','Asset','Amount','Notes'], rows, emptyMessage);
  }

  function barList(rows, labelGetter, valueGetter = r => r.total) {
    const max = Math.max(1, ...rows.map(valueGetter));
    return `<div class="bar-list">
      ${rows.map(row => {
        const value = valueGetter(row);
        return `
          <div class="bar-row">
            <strong>${escapeHtml(labelGetter(row))}</strong>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, value / max * 100)}%"></div></div>
            <div class="right amount">${money(value)}</div>
          </div>
        `;
      }).join('')}
    </div>`;
  }

  function renderRecords() {
    const records = filteredRecords();
    return `
      <div class="card">
        <div class="card-title-row">
          <div>
            <h2>Records</h2>
            <p class="muted">Search, edit, delete, and export your transaction history.</p>
          </div>
          <button id="newRecordBtn" class="secondary small">New</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="recordsMonth">Month</label>
            ${monthSelectHtml('recordsMonth', state.recordFilter.month, true)}
          </div>
          <div class="field">
            <label for="recordsType">Type</label>
            <select id="recordsType">
              ${['All', ...TRANSACTION_TYPES.map(t => t.id)].map(v => `<option value="${escapeAttr(v)}" ${state.recordFilter.type === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="recordsSort">Sort</label>
            <select id="recordsSort">
              ${[
                ['dateDesc', 'Date: newest first'],
                ['dateAsc', 'Date: oldest first'],
                ['amountDesc', 'Amount: high to low'],
                ['amountAsc', 'Amount: low to high']
              ].map(([value, label]) => `<option value="${escapeAttr(value)}" ${state.recordFilter.sort === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
            </select>
          </div>
          <div class="field full">
            <label for="recordsSearch">Search</label>
            <input id="recordsSearch" type="search" placeholder="Search notes, category, account, asset" value="${escapeAttr(state.recordFilter.search)}">
          </div>
        </div>
      </div>
      <div class="record-list">
        ${records.length ? records.map(recordCardHtml).join('') : empty('No matching records.')}
      </div>
    `;
  }

  function recordCardHtml(t) {
    const cat = categoryById(t.categoryId)?.name || t.type;
    const from = accountById(t.fromAccountId)?.name || '';
    const to = accountById(t.toAccountId)?.name || '';
    const asset = assetById(t.assetId)?.name || '';
    const details = [cat, from && `From: ${from}`, to && `To: ${to}`, asset && `Asset: ${asset}`, t.notes].filter(Boolean).join(' | ');
    return `
      <article class="record-card">
        <div>
          <h3>${escapeHtml(formatDate(t.date))} - ${escapeHtml(t.type)}</h3>
          <p>${escapeHtml(details)}</p>
        </div>
        <div class="record-actions">
          <span class="amount ${amountClass(t.type)}">${money(t.amount)}</span>
          <button class="ghost small" data-edit-record="${escapeAttr(t.id)}">Edit</button>
          <button class="danger small" data-delete-record="${escapeAttr(t.id)}">Delete</button>
        </div>
      </article>
    `;
  }

  function bindRecordsEvents() {
    document.getElementById('newRecordBtn')?.addEventListener('click', () => {
      state.view = 'entry';
      state.editId = null;
      render();
    });
    document.getElementById('recordsMonth')?.addEventListener('change', event => {
      state.recordFilter.month = event.target.value;
      render();
    });
    document.getElementById('recordsType')?.addEventListener('change', event => {
      state.recordFilter.type = event.target.value;
      render();
    });
    document.getElementById('recordsSort')?.addEventListener('change', event => {
      state.recordFilter.sort = event.target.value;
      render();
    });
    document.getElementById('recordsSearch')?.addEventListener('input', event => {
      state.recordFilter.search = event.target.value;
      const container = document.querySelector('.record-list');
      if (container) {
        const records = filteredRecords();
        container.innerHTML = records.length ? records.map(recordCardHtml).join('') : empty('No matching records.');
        bindRecordActionButtons();
      }
    });
  }

  function bindRecordActionButtons() {
    document.querySelectorAll('[data-edit-record]').forEach(button => button.addEventListener('click', () => {
      const record = state.data.transactions.find(t => t.id === button.dataset.editRecord);
      if (!record) return;
      state.editId = record.id;
      state.selectedType = record.type;
      state.view = 'entry';
      render();
    }));
    document.querySelectorAll('[data-delete-record]').forEach(button => button.addEventListener('click', async () => {
      if (!confirm('Delete this transaction?')) return;
      const record = state.data.transactions.find(t => t.id === button.dataset.deleteRecord) || { id: button.dataset.deleteRecord };
      await put('transactions', markDeleted(record));
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Transaction deleted');
    }));
  }

  function assetTypeOptions(selected = '') {
    return ['Mutual Funds','Stocks','Fixed Deposits','Other Investments']
      .map(v => `<option value="${escapeAttr(v)}" ${v === selected ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('');
  }

  function defaultFdBankAccountIdForName(name = '') {
    const text = norm(name);
    if (text.includes('statebankofindia') || text.includes('sbi')) return 'acc-state-bank-of-india';
    if (text.includes('yesbank')) return 'acc-yes-bank';
    if (text.includes('federalbank')) return 'acc-federal-bank';
    if (text.includes('hdfcbank') || text.includes('hdfc')) return 'acc-hdfc-bank';
    return '';
  }

  function normalizeTransactionRecord(transaction = {}) {
    const out = { ...transaction };
    if (out.type === 'Investment') {
      out.investmentType = normalizeInvestmentType(out.investmentType) || out.investmentType || 'Other Investments';
    }
    return out;
  }

  function isFixedDepositAsset(asset = {}) {
    const normalized = normalizeInvestmentType(asset.investmentType);
    if (normalized === 'Fixed Deposits') return true;
    if (['Mutual Funds', 'Stocks'].includes(normalized)) return false;
    if (asset.fdBankAccountId || asset.fdAccountNumber || num(asset.fdPrincipal) || num(asset.fdMaturityAmount) || num(asset.fdInterestAmount)) return true;
    const rawText = `${asset.id || ''} ${asset.name || ''} ${asset.type || ''} ${asset.category || ''} ${asset.subcategory || ''}`.toLowerCase();
    if (/fixed\s*deposit/.test(rawText) || /\bfd\b/.test(rawText)) return true;
    const key = norm(rawText);
    if (key.includes('fixeddeposit') || key.includes('fdbank') || key.startsWith('assetfd')) return true;
    return false;
  }

  function assetInvestmentType(asset = {}) {
    if (isFixedDepositAsset(asset)) return 'Fixed Deposits';
    return normalizeInvestmentType(asset.investmentType) || asset.investmentType || 'Other Investments';
  }

  function normalizeAssetRecord(asset = {}) {
    const investmentType = assetInvestmentType(asset);
    const out = { ...asset, investmentType };
    if (investmentType === 'Fixed Deposits') {
      out.fdBankAccountId = out.fdBankAccountId || defaultFdBankAccountIdForName(out.name || '');
      out.fdPrincipal = num(out.fdPrincipal);
      out.fdMaturityAmount = num(out.fdMaturityAmount);
      out.fdInterestAmount = num(out.fdInterestAmount);
    }
    return out;
  }

  function fdBankAccount(asset) {
    return accountById(asset?.fdBankAccountId) || null;
  }

  function fdBankName(asset) {
    return fdBankAccount(asset)?.name || 'Unlinked / not selected';
  }

  function fdBankSelectHtml(name, selected = '', required = false) {
    const savings = entryAccounts(account => account.accountType === 'Savings', selected);
    const selectedExists = savings.some(account => account.id === selected);
    const extra = selected && !selectedExists && accountById(selected) ? [accountById(selected)] : [];
    const options = [...extra, ...savings];
    return `
      <select name="${escapeAttr(name)}" ${required ? 'required' : ''}>
        <option value="">Select linked bank</option>
        ${options.map(account => `<option value="${escapeAttr(account.id)}" ${account.id === selected ? 'selected' : ''}>${escapeHtml(account.name)}</option>`).join('')}
      </select>
    `;
  }

  function assetOpeningAmount(asset) {
    if (isFixedDepositAsset(asset)) return fdPrincipalAmount(asset) || num(asset.openingAmount);
    return num(asset?.openingAmount);
  }

  function fdPrincipalAmount(asset) {
    return num(asset?.fdPrincipal) || num(asset?.openingAmount);
  }

  function fdMaturityAmount(asset) {
    const principal = fdPrincipalAmount(asset);
    const maturity = num(asset?.fdMaturityAmount);
    const interest = num(asset?.fdInterestAmount);
    if (maturity) return maturity;
    if (principal && interest) return principal + interest;
    return 0;
  }

  function fdInterestAmount(asset) {
    const principal = fdPrincipalAmount(asset);
    const maturity = num(asset?.fdMaturityAmount);
    const interest = num(asset?.fdInterestAmount);
    if (interest) return interest;
    if (principal && maturity) return maturity - principal;
    return 0;
  }

  function fdDetailsText(asset) {
    const parts = [];
    if (asset?.fdBankAccountId) parts.push(`Bank ${fdBankName(asset)}`);
    if (asset?.fdAccountNumber) parts.push(`A/c ${asset.fdAccountNumber}`);
    if (fdPrincipalAmount(asset)) parts.push(`Principal ${money(fdPrincipalAmount(asset))}`);
    if (fdMaturityAmount(asset)) parts.push(`Maturity ${money(fdMaturityAmount(asset))}`);
    if (fdInterestAmount(asset)) parts.push(`Interest ${money(fdInterestAmount(asset))}`);
    if (asset?.maturityDate) parts.push(`Due ${formatDate(asset.maturityDate)}`);
    return parts.join(' | ') || 'FD details not entered';
  }

  function fdCalcAttributes(assetId, role) {
    return `data-fd-calc data-fd-id="${escapeAttr(assetId)}" data-fd-role="${escapeAttr(role)}"`;
  }

  function accountOpeningSectionTypeOrder() {
    return ['Credit Card', 'Savings', 'Cash', 'Company'];
  }

  function renderSetupAccountOpeningSection() {
    const grouped = groupBy(state.data.accounts, account => account.accountType || 'Other');
    const types = accountOpeningSectionTypeOrder()
      .filter(type => grouped[type]?.length)
      .concat(Object.keys(grouped).filter(type => !accountOpeningSectionTypeOrder().includes(type)).sort());
    return types.map(type => renderAccountOpeningTypeSection(type, grouped[type] || [])).join('');
  }

  function renderAccountOpeningTypeSection(type, accounts) {
    const addable = ['Credit Card', 'Savings'].includes(type);
    return `
      <div class="subcard setup-section">
        <div class="card-title-row compact-title-row">
          <div>
            <h3>${escapeHtml(type)} opening balances</h3>
            <p class="muted tiny">${type === 'Credit Card' ? 'Enter outstanding amount as positive.' : 'Enter balance available at start month.'}</p>
          </div>
        </div>
        <div class="table-wrap compact-table setup-comments-table"><table>
          <thead><tr><th>Account</th><th class="right">Opening balance / outstanding</th><th>Comments / details</th></tr></thead>
          <tbody>
            ${accounts.map(account => `
              <tr>
                <td>${escapeHtml(account.name)}</td>
                <td><input name="accountOpening__${escapeAttr(account.id)}" type="number" step="0.01" value="${escapeAttr(num(account.openingBalance))}" aria-label="Opening balance for ${escapeAttr(account.name)}"></td>
                <td><input name="accountNotes__${escapeAttr(account.id)}" value="${escapeAttr(account.notes || '')}" placeholder="Optional details"></td>
              </tr>
            `).join('')}
          </tbody>
        </table></div>
        ${accounts.length ? '' : empty(`No ${type.toLowerCase()} accounts yet.`)}
      </div>
    `;
  }

  function renderInvestmentInitialLoadSection(type) {
    const assets = state.data.assets.filter(asset => assetInvestmentType(asset) === type);
    if (type === 'Fixed Deposits') {
      return `
        <div class="subcard setup-section">
          <div class="card-title-row compact-title-row">
            <div>
              <h3>Fixed deposits initial load</h3>
              <p class="muted tiny">Track each FD separately. Enter principal plus maturity amount or interest amount; the other field auto-fills.</p>
            </div>
          </div>
          <div class="table-wrap compact-table fd-table"><table>
            <thead><tr><th>FD / Bank</th><th>Linked Bank</th><th>Account no.</th><th class="right">Principal</th><th class="right">Maturity amount</th><th class="right">Interest amount</th><th>Maturity date</th><th class="right">Current value</th><th>Comments / details</th></tr></thead>
            <tbody>
              ${assets.map(asset => `
                <tr>
                  <td>${escapeHtml(asset.name)}</td>
                  <td>${fdBankSelectHtml(`fdBankAccountId__${asset.id}`, asset.fdBankAccountId || '')}</td>
                  <td><input name="fdAccountNumber__${escapeAttr(asset.id)}" value="${escapeAttr(asset.fdAccountNumber || '')}" placeholder="FD account no."></td>
                  <td><input name="fdPrincipal__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(fdPrincipalAmount(asset) || '')}" ${fdCalcAttributes(asset.id, 'principal')} aria-label="Principal for ${escapeAttr(asset.name)}"></td>
                  <td><input name="fdMaturityAmount__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(fdMaturityAmount(asset) || '')}" ${fdCalcAttributes(asset.id, 'maturity')} aria-label="Maturity amount for ${escapeAttr(asset.name)}"></td>
                  <td><input name="fdInterestAmount__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(fdInterestAmount(asset) || '')}" ${fdCalcAttributes(asset.id, 'interest')} aria-label="Interest amount for ${escapeAttr(asset.name)}"></td>
                  <td><input name="assetMaturity__${escapeAttr(asset.id)}" type="date" value="${escapeAttr(asset.maturityDate || '')}" aria-label="Maturity for ${escapeAttr(asset.name)}"></td>
                  <td><input name="assetCurrent__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(num(asset.currentValue) || '')}" aria-label="Current value for ${escapeAttr(asset.name)}"></td>
                  <td><input name="assetNotes__${escapeAttr(asset.id)}" value="${escapeAttr(asset.notes || '')}" placeholder="Optional FD details"></td>
                </tr>
              `).join('')}
            </tbody>
          </table></div>
          ${assets.length ? '' : empty('No fixed deposits yet. Add them from Setup → Manage Master Data.')}
        </div>`;
    }
    return `
      <div class="subcard setup-section">
        <div class="card-title-row compact-title-row">
          <div>
            <h3>${escapeHtml(type)} initial load</h3>
            <p class="muted tiny">Maturity date is optional${['Mutual Funds','Stocks'].includes(type) ? ' for this investment type' : ''}. Opening invested feeds reports and net worth.</p>
          </div>
        </div>
        <div class="table-wrap compact-table setup-comments-table"><table>
          <thead><tr><th>Asset</th><th class="right">Opening invested</th><th class="right">Current value</th><th>Maturity date / optional</th><th>Comments / details</th></tr></thead>
          <tbody>
            ${assets.map(asset => `
              <tr>
                <td>${escapeHtml(asset.name)}</td>
                <td><input name="assetOpening__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(num(asset.openingAmount) || '')}" aria-label="Opening amount for ${escapeAttr(asset.name)}"></td>
                <td><input name="assetCurrent__${escapeAttr(asset.id)}" type="number" step="0.01" value="${escapeAttr(num(asset.currentValue) || '')}" aria-label="Current value for ${escapeAttr(asset.name)}"></td>
                <td><input name="assetMaturity__${escapeAttr(asset.id)}" type="date" value="${escapeAttr(asset.maturityDate || '')}" aria-label="Maturity for ${escapeAttr(asset.name)}"></td>
                <td><input name="assetNotes__${escapeAttr(asset.id)}" value="${escapeAttr(asset.notes || '')}" placeholder="Optional details"></td>
              </tr>
            `).join('')}
          </tbody>
        </table></div>
        ${assets.length ? '' : empty(`No ${type.toLowerCase()} assets yet. Add them from Setup → Manage Master Data.`)}
      </div>`;
  }

  function renderQuickAddPanelForMaster(addConfig) {
    if (!addConfig) return '';
    if (addConfig.addKind === 'account') return renderQuickAddAccountInline(addConfig.addType || 'Savings');
    if (addConfig.addKind === 'asset') return renderQuickAddAssetInline(addConfig.addType || 'Mutual Funds');
    if (addConfig.addKind === 'category') return renderQuickAddCategoryInline(addConfig.addType || 'Expense');
    return '';
  }

  function quickAddToggleButton(key, label) {
    const active = state.setupQuickAdd === key;
    return `<button type="button" class="ghost small quick-add-button" data-quick-add-toggle="${escapeAttr(key)}" aria-expanded="${active ? 'true' : 'false'}">${active ? '− Close' : '+ ' + escapeHtml(label)}</button>`;
  }

  function shortInvestmentTypeLabel(type) {
    if (type === 'Mutual Funds') return 'MF';
    if (type === 'Fixed Deposits') return 'FD';
    if (type === 'Other Investments') return 'Other';
    return type.replace(/s$/, '');
  }

  function renderQuickAddAccountInline(type) {
    return `
      <div class="inline-add-card quick-add-panel" data-quick-add-panel="account">
        <div class="subcard">
          <h3>Add ${escapeHtml(type)}</h3>
          <div class="form-grid">
            <input type="hidden" id="quickAccountType" value="${escapeAttr(type)}">
            <div class="field"><label>Name</label><input id="quickAccountName" placeholder="Example: Axis Bank" required></div>
            <div class="field"><label>Opening balance / outstanding</label><input id="quickAccountOpening" type="number" step="0.01" value="0"></div>
            <div class="field full"><label>Comments / optional</label><textarea id="quickAccountNotes" placeholder="Optional account details"></textarea></div>
            <div class="field full row"><button type="button" class="primary" id="quickAddAccountSave">Add ${escapeHtml(type)}</button><button type="button" class="ghost" data-quick-add-close>Cancel</button></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuickAddAssetInline(type) {
    const isFd = type === 'Fixed Deposits';
    return `
      <div class="inline-add-card quick-add-panel" data-quick-add-panel="asset">
        <div class="subcard">
          <h3>Add ${escapeHtml(type)}</h3>
          <div class="form-grid">
            <input type="hidden" id="quickAssetType" value="${escapeAttr(type)}">
            <div class="field"><label>Name</label><input id="quickAssetName" placeholder="Example: ${escapeAttr(isFd ? 'Yes Bank FD 2026' : 'New ' + shortInvestmentTypeLabel(type))}" required></div>
            ${isFd ? `
              <div class="field"><label>Linked Bank</label>${fdBankSelectHtml('quickFdBankAccountId', defaultAccountIdForType('Savings'), true)}</div>
              <div class="field"><label>FD account number</label><input id="quickFdAccountNumber" placeholder="FD account no."></div>
              <div class="field"><label>Principal</label><input id="quickFdPrincipal" type="number" step="0.01" value="0" ${fdCalcAttributes('quickAsset', 'principal')}></div>
              <div class="field"><label>Maturity amount</label><input id="quickFdMaturityAmount" type="number" step="0.01" value="0" ${fdCalcAttributes('quickAsset', 'maturity')}></div>
              <div class="field"><label>Interest amount</label><input id="quickFdInterestAmount" type="number" step="0.01" value="0" ${fdCalcAttributes('quickAsset', 'interest')}></div>
            ` : `
              <div class="field"><label>Opening invested amount</label><input id="quickAssetOpening" type="number" step="0.01" value="0"></div>
            `}
            <div class="field"><label>Manual current value / optional</label><input id="quickAssetCurrent" type="number" step="0.01" value="0"></div>
            <div class="field"><label>Maturity date / optional</label><input id="quickAssetMaturity" type="date"></div>
            <div class="field full"><label>Comments / optional</label><textarea id="quickAssetNotes" placeholder="Folio, demat, policy, FD remarks, etc."></textarea></div>
            <div class="field full row"><button type="button" class="primary" id="quickAddAssetSave">Add ${escapeHtml(shortInvestmentTypeLabel(type))}</button><button type="button" class="ghost" data-quick-add-close>Cancel</button></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuickAddCategoryInline(type) {
    return `
      <div class="inline-add-card quick-add-panel" data-quick-add-panel="category">
        <div class="subcard">
          <h3>Add ${escapeHtml(type)} category</h3>
          <div class="form-grid">
            <input type="hidden" id="quickCategoryType" value="${escapeAttr(type)}">
            <div class="field"><label>Name</label><input id="quickCategoryName" placeholder="Example: ${escapeAttr(type === 'Expense' ? 'Fuel' : type === 'Income' ? 'Bonus' : 'SIP')}" required></div>
            <div class="field"><label>Monthly budget / optional</label><input id="quickCategoryBudget" type="number" step="0.01" value="0"></div>
            <label class="check-row field full"><input id="quickCategoryInclude" type="checkbox" checked><span>Include in reports</span></label>
            <div class="field full row"><button type="button" class="primary" id="quickAddCategorySave">Add ${escapeHtml(type)} category</button><button type="button" class="ghost" data-quick-add-close>Cancel</button></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAssetFdDetailsFields(prefix = 'asset') {
    return `
      <div id="assetFdFields" class="fd-detail-box" hidden>
        <h3>FD details</h3>
        <p class="muted tiny">For FDs, principal is treated as opening invested amount. Enter principal plus maturity amount or interest amount; the other value auto-fills.</p>
        <div class="form-grid">
          <div class="field"><label>Linked Bank</label>${fdBankSelectHtml('fdBankAccountId', defaultAccountIdForType('Savings'), true)}</div>
          <div class="field"><label>FD account number</label><input name="fdAccountNumber" placeholder="Example: 501000123456"></div>
          <div class="field"><label>Principal</label><input name="fdPrincipal" type="number" step="0.01" value="0" ${fdCalcAttributes(prefix, 'principal')}></div>
          <div class="field"><label>Maturity amount</label><input name="fdMaturityAmount" type="number" step="0.01" value="0" ${fdCalcAttributes(prefix, 'maturity')}></div>
          <div class="field"><label>Interest amount</label><input name="fdInterestAmount" type="number" step="0.01" value="0" ${fdCalcAttributes(prefix, 'interest')}></div>
        </div>
      </div>
    `;
  }

  function renderManage() {
    const active = state.setupSection || 'start';
    return `
      <div class="card setup-hero">
        <div class="card-title-row">
          <div>
            <h2>Setup</h2>
            <p class="muted">Choose a setup flow. Initial loads, master data, defaults, and sync stay organized on phone.</p>
          </div>
        </div>
        <div class="type-grid setup-type-grid" role="list">
          ${SETUP_SECTIONS.map(item => `
            <button type="button" class="type-tile ${active === item.id ? 'active' : ''}" data-setup-section="${escapeAttr(item.id)}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.hint)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      ${renderSetupSectionContent(active)}
    `;
  }

  function renderSetupSectionContent(section) {
    if (section === 'investments') return renderSetupInvestmentsSection();
    if (section === 'master') return renderSetupMasterDataSection();
    if (section === 'sync') return renderSetupSyncSection();
    return renderSetupStartAccountsSection();
  }

  function renderSetupSyncSection() {
    const settings = state.data.settings;
    const configured = syncConfigured();
    const statusText = configured ? (settings.lastSyncAt ? `Last synced ${formatDateTime(settings.lastSyncAt)}` : 'Configured, not synced yet') : 'Not configured';
    const pending = state.sync.pendingCount || 0;
    return `
      <div class="stack gap">
        <div class="card">
          <div class="card-title-row">
            <div>
              <h2>Google Drive / Sheets sync</h2>
              <p class="muted">Use Google Sheets as the shared cloud copy while IndexedDB remains the fast local database on each device.</p>
            </div>
            <span class="pill ${configured ? 'good' : 'warn'}">${escapeHtml(configured ? 'Ready' : 'Needs setup')}</span>
          </div>
          <div class="grid four sync-kpis">
            ${kpi('Connection', configured ? 'Configured' : 'Missing', statusText, configured ? 'good' : 'warn')}
            ${kpi('Pending local changes', String(pending), 'Unsynced rows on this device', pending ? 'warn' : 'good')}
            ${kpi('Auto sync', settings.autoSync ? 'On' : 'Off', 'Runs after saves when online', settings.autoSync ? 'good' : '')}
            ${kpi('Device', settings.deviceName || 'This device', settings.deviceId || '', '')}
          </div>
          ${settings.lastSyncStatus ? `<p class="muted tiny sync-message">${escapeHtml(settings.lastSyncStatus)}</p>` : ''}
          ${state.sync.lastError ? `<p class="pill danger sync-message">${escapeHtml(state.sync.lastError)}</p>` : ''}
        </div>

        <form id="syncSettingsForm" class="card stack gap">
          <div>
            <h2>Connection settings</h2>
            <p class="muted">Paste the Apps Script Web App URL and the sync key from the setup guide. These stay local on this device and are not exported to the Google Sheet.</p>
          </div>
          <div class="field full">
            <label for="syncUrl">Apps Script Web App URL</label>
            <textarea id="syncUrl" name="syncUrl" rows="2" placeholder="https://script.google.com/macros/s/.../exec">${escapeHtml(settings.syncUrl || '')}</textarea>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="syncSecret">Sync key / secret</label>
              <input id="syncSecret" name="syncSecret" type="password" value="${escapeAttr(settings.syncSecret || '')}" autocomplete="off" placeholder="Paste your private sync key">
            </div>
            <div class="field">
              <label for="deviceName">Device name</label>
              <input id="deviceName" name="deviceName" value="${escapeAttr(settings.deviceName || '')}" placeholder="Example: Pixel phone / Office laptop">
            </div>
          </div>
          <label class="check-row">
            <input type="checkbox" name="autoSync" ${settings.autoSync ? 'checked' : ''}>
            <span>Auto-sync after saving transactions and when the device comes online</span>
          </label>
          <div class="row">
            <button class="primary" type="submit">Save sync settings</button>
            <button class="secondary" id="testSyncBtn" type="button">Test connection</button>
          </div>
        </form>

        <div class="card stack gap">
          <div>
            <h2>Sync actions</h2>
            <p class="muted">Use Sync now for daily use. Use Upload all local data only once when first connecting an existing local app to a new Google Sheet.</p>
          </div>
          <div class="row">
            <button class="primary" id="syncNowBtn" type="button" ${configured ? '' : 'disabled'}>${state.sync.busy ? 'Syncing...' : 'Sync now'}</button>
            <button class="secondary" id="syncUploadAllBtn" type="button" ${configured ? '' : 'disabled'}>Upload all local data</button>
            <button class="ghost" id="syncPullBtn" type="button" ${configured ? '' : 'disabled'}>Pull from Google Sheet</button>
          </div>
          <p class="muted tiny">Conflict rule: if the same item changes on two devices, the latest updated timestamp wins. Export JSON before your first sync.</p>
        </div>

        <div class="card">
          <h2>Google Sheet layout</h2>
          <p class="muted">The Apps Script backend creates separate sheets for Transactions, Accounts, Categories, Assets, Settings, and Sync_Log so you can inspect your data from Google Drive.</p>
          ${tableHtml(['Sheet', 'What it stores'], [
            ['Transactions', 'Daily income, expenses, investments, transfers, card payments'],
            ['Accounts', 'Banks, cash, credit cards, opening balances and comments'],
            ['Categories', 'Income/expense/investment categories and budgets'],
            ['Assets', 'Mutual funds, stocks, FDs, other investments, FD details'],
            ['Settings', 'Currency, go-live date, and tracking start month'],
            ['Sync_Log', 'Recent push/pull activity for troubleshooting']
          ])}
        </div>
      </div>
    `;
  }

  function renderSetupStartAccountsSection() {
    return `
      <form id="generalSettingsForm" class="stack gap">
        <div class="card">
          <div class="card-title-row">
            <div>
              <h2>General settings</h2>
              <p class="muted">Set the go-live date, currency label, and months to exclude from monthly average calculations. Account balances now live under Initial investments & accounts.</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="field">
              <label for="goLiveDate">Go live date</label>
              <input id="goLiveDate" name="goLiveDate" type="date" value="${escapeAttr(goLiveDateISO())}">
              <p class="muted tiny">Example: use 2026-07-01 if your opening balances are correct up to June 2026 and you start live tracking from July 2026.</p>
            </div>
            <div class="field">
              <label>Currency label</label>
              <input name="currency" value="${escapeAttr(state.data.settings.currency)}" placeholder="INR, Rs., ₹">
              <p class="muted tiny">Used in dashboards, reports, exports, and KPIs.</p>
            </div>
          </div>
          <div class="field full">
            <label>Exclude months from monthly average calculations</label>
            <p class="muted tiny">Use this for months where historical/imported data is incomplete or incorrect. These months still appear in reports; only monthly average KPIs ignore them.</p>
            ${averageExclusionCheckboxes()}
          </div>
        </div>
        <div class="card sticky-save-card">
          <button class="primary" type="submit">Save general settings</button>
          <span class="muted tiny">Save after editing go-live date, currency, or excluded months.</span>
        </div>
      </form>
    `;
  }

  function renderSetupInvestmentsSection() {
    return `
      <form id="initialInvestmentsForm" class="stack gap">
        <div class="card">
          <div class="card-title-row">
            <div>
              <h2>Initial investments & accounts</h2>
              <p class="muted">Enter opening account balances and investments already held as of your go-live date. Historical transactions before go-live remain report-only and will not change these live balances.</p>
            </div>
          </div>
          <div class="stack gap">
            <div class="subcard setup-section">
              <h3>Account opening balances</h3>
              <p class="muted tiny">Savings/cash should be available balance. Credit cards should be outstanding amount as a positive number. Use comments for details such as statement date or account notes.</p>
              <div class="grid two">
                ${renderSetupAccountOpeningSection()}
              </div>
            </div>
            ${renderInvestmentInitialLoadSection('Mutual Funds')}
            ${renderInvestmentInitialLoadSection('Stocks')}
            ${renderInvestmentInitialLoadSection('Fixed Deposits')}
            ${renderInvestmentInitialLoadSection('Other Investments')}
          </div>
        </div>
        <div class="card sticky-save-card">
          <button class="primary" type="submit">Save initial investments & accounts</button>
          <span class="muted tiny">Save after editing opening balances, opening investments, FD fields, maturity dates, or comments.</span>
        </div>
      </form>
    `;
  }

  function renderAddAccountCard(title = 'Add account') {
    return `
      <div class="card">
        <h2>${escapeHtml(title)}</h2>
        <form id="accountForm" class="stack gap">
          <div class="field"><label>Name</label><input name="name" required placeholder="Example: Axis Bank"></div>
          <div class="field"><label>Type</label><select name="accountType" required>${['Savings','Cash','Credit Card','Company'].map(v => `<option>${v}</option>`).join('')}</select></div>
          <div class="field"><label>Opening balance / outstanding</label><input name="openingBalance" type="number" step="0.01" value="0"></div>
          <div class="field"><label>Comments / optional</label><textarea name="notes" placeholder="Optional account details"></textarea></div>
          <button class="primary" type="submit">Add account</button>
        </form>
      </div>
    `;
  }

  function renderAddCategoryCard() {
    return `
      <div class="card">
        <h2>Add category</h2>
        <form id="categoryForm" class="stack gap">
          <div class="field"><label>Name</label><input name="name" required placeholder="Example: Fuel"></div>
          <div class="field"><label>Transaction type</label><select name="transactionType" required>${['Expense','Income','Investment'].map(v => `<option>${v}</option>`).join('')}</select></div>
          <div class="field"><label>Monthly budget / optional</label><input name="monthlyBudget" type="number" step="0.01" value="0"></div>
          <label class="row"><input name="includeInReports" type="checkbox" checked style="width:auto; min-height:auto;"> Include in reports</label>
          <button class="primary" type="submit">Add category</button>
        </form>
      </div>
    `;
  }

  function renderAddAssetCard(title = 'Add investment asset') {
    return `
      <div class="card">
        <h2>${escapeHtml(title)}</h2>
        <p class="muted tiny">Use this for master data and initial-load assets. You can also add a new MF/stock/other asset directly from the Entry page.</p>
        <form id="assetForm" class="stack gap">
          <div class="field"><label>Name</label><input name="name" required placeholder="Example: New mutual fund / FD"></div>
          <div class="field"><label>Investment type</label><select id="assetInvestmentType" name="investmentType" required>${assetTypeOptions()}</select></div>
          <div class="field"><label>Opening invested amount</label><input name="openingAmount" type="number" step="0.01" value="0"></div>
          <div class="field"><label>Manual current value / optional</label><input name="currentValue" type="number" step="0.01" value="0"></div>
          <div class="field"><label>Maturity date / optional</label><input name="maturityDate" type="date"></div>
          <div class="field"><label>Comments / optional</label><textarea name="notes" placeholder="Folio, demat, policy, FD remarks, etc."></textarea></div>
          ${renderAssetFdDetailsFields('newAsset')}
          <button class="primary" type="submit">Add asset</button>
        </form>
      </div>
    `;
  }

  function renderSetupMasterDataSection() {
    return `
      <div class="card">
        <h2>Manage Master Data</h2>
        <p class="muted">Add, rename, inactivate, or set defaults for accounts, categories, and investments. New values added here immediately appear in the Entry tab and initial-load tables where relevant.</p>
        <p class="muted tiny">General settings such as go-live date, currency label, and excluded average months live in Setup → General settings.</p>
      </div>
      ${renderSetupPreviewSection()}
    `;
  }

  function renderSetupPreviewSection() {
    return `
      <div class="card master-preview-card">
        <div class="card-title-row">
          <div>
            <h2>Manage Master Data</h2>
            <p class="muted">Review master values by granular type. Use + Add inside each section, rename values, set optional defaults, or inactivate values so they stop appearing in Entry dropdowns without changing existing transactions or reports.</p>
          </div>
        </div>
        <div class="grid two">
          ${masterList('Savings accounts', state.data.accounts.filter(a => a.accountType === 'Savings'), item => `Opening: ${money(num(item.openingBalance))}${item.notes ? ' | ' + item.notes : ''}`, 'defaultSavingsAccountId', 'account', { addKind: 'account', addType: 'Savings', addLabel: 'Add Savings' })}
          ${masterList('Credit cards', state.data.accounts.filter(a => a.accountType === 'Credit Card'), item => `Opening outstanding: ${money(num(item.openingBalance))}${item.notes ? ' | ' + item.notes : ''}`, 'defaultCreditCardAccountId', 'account', { addKind: 'account', addType: 'Credit Card', addLabel: 'Add Card' })}
          ${masterList('Cash accounts', state.data.accounts.filter(a => a.accountType === 'Cash'), item => `Opening: ${money(num(item.openingBalance))}${item.notes ? ' | ' + item.notes : ''}`, 'defaultCashAccountId', 'account', { addKind: 'account', addType: 'Cash', addLabel: 'Add Cash' })}
          ${masterList('Company / reimbursement accounts', state.data.accounts.filter(a => a.accountType === 'Company'), item => `Opening: ${money(num(item.openingBalance))}${item.notes ? ' | ' + item.notes : ''}`, 'defaultCompanyAccountId', 'account', { addKind: 'account', addType: 'Company', addLabel: 'Add Company' })}
        </div>
        <div class="grid three">
          ${masterList('Expense categories', state.data.categories.filter(c => c.transactionType === 'Expense'), item => `${item.includeInReports === false ? 'Excluded from expense reports' : 'Included'}${item.monthlyBudget ? ' | Budget: ' + money(num(item.monthlyBudget)) : ''}`, 'defaultExpenseCategoryId', 'category', { addKind: 'category', addType: 'Expense', addLabel: 'Add Expense' })}
          ${masterList('Income categories', state.data.categories.filter(c => c.transactionType === 'Income'), item => `${item.includeInReports === false ? 'Excluded' : 'Included'}${item.monthlyBudget ? ' | Budget: ' + money(num(item.monthlyBudget)) : ''}`, 'defaultIncomeCategoryId', 'category', { addKind: 'category', addType: 'Income', addLabel: 'Add Income' })}
          ${masterList('Investment categories', state.data.categories.filter(c => c.transactionType === 'Investment'), item => `${item.includeInReports === false ? 'Excluded' : 'Included'}${item.monthlyBudget ? ' | Budget: ' + money(num(item.monthlyBudget)) : ''}`, 'defaultInvestmentCategoryId', 'category', { addKind: 'category', addType: 'Investment', addLabel: 'Add Investment' })}
        </div>
        <div class="grid two">
          ${masterList('Mutual funds', state.data.assets.filter(a => assetInvestmentType(a) === 'Mutual Funds'), assetPreviewText, 'defaultMutualFundAssetId', 'asset', { addKind: 'asset', addType: 'Mutual Funds', addLabel: 'Add MF' })}
          ${masterList('Stocks', state.data.assets.filter(a => assetInvestmentType(a) === 'Stocks'), assetPreviewText, 'defaultStockAssetId', 'asset', { addKind: 'asset', addType: 'Stocks', addLabel: 'Add Stock' })}
          ${masterList('Fixed deposits', state.data.assets.filter(a => isFixedDepositAsset(a)), assetPreviewText, 'defaultFdAssetId', 'asset', { addKind: 'asset', addType: 'Fixed Deposits', addLabel: 'Add FD' })}
          ${masterList('Other investments', state.data.assets.filter(a => assetInvestmentType(a) === 'Other Investments'), assetPreviewText, 'defaultOtherInvestmentAssetId', 'asset', { addKind: 'asset', addType: 'Other Investments', addLabel: 'Add Other' })}
        </div>
      </div>
    `;
  }

  function assetPreviewText(item) {
    if (isFixedDepositAsset(item)) return `${fdDetailsText(item)}${item.notes ? ' | ' + item.notes : ''}`;
    return `Opening: ${money(num(item.openingAmount))}${item.currentValue ? ' | Value: ' + money(num(item.currentValue)) : ''}${item.maturityDate ? ' | Maturity: ' + formatDate(item.maturityDate) : ''}${item.notes ? ' | ' + item.notes : ''}`;
  }

  function masterList(title, items, subGetter, defaultKey = '', kind = '', addConfig = null) {
    const currentDefault = defaultKey ? String(state.data.settings[defaultKey] || '') : '';
    const defaultStatus = defaultKey
      ? currentDefault
        ? `<div class="row gap-sm wrap"><span class="pill good">Default set</span><button type="button" class="danger small" data-clear-default-key="${escapeAttr(defaultKey)}">Clear</button></div>`
        : `<span class="pill warn">No default</span>`
      : '';
    const addKey = addConfig ? `${addConfig.addKind}:${addConfig.addType}` : '';
    const addButton = addConfig ? quickAddToggleButton(addKey, addConfig.addLabel || `Add ${title}`) : '';
    return `
      <div class="subcard master-list-card">
        <div class="card-title-row compact-title-row">
          <h3>${escapeHtml(title)}</h3>
          <div class="row gap-sm wrap">${addButton}${defaultStatus}</div>
        </div>
        ${addConfig && state.setupQuickAdd === addKey ? renderQuickAddPanelForMaster(addConfig) : ''}
        <div class="stack no-gap">
          ${items.slice(0, 80).map(item => {
            const isDefault = defaultKey && String(item.id) === currentDefault;
            const inactive = kind ? isMasterInactive(kind, item.id) : false;
            return `
              <div class="row between master-list-row ${inactive ? 'is-inactive' : ''}">
                <div class="master-list-main">
                  <strong>${escapeHtml(item.name)}</strong>
                  ${inactive ? '<span class="pill warn master-status-pill">Inactive</span>' : ''}
                  ${isDefault ? '<span class="pill good master-status-pill">Default</span>' : ''}
                  <div class="muted tiny">${escapeHtml(subGetter(item))}</div>
                </div>
                <div class="row gap-sm wrap master-actions">
                  ${defaultKey ? `<button type="button" class="${isDefault ? 'danger' : 'ghost'} small" data-set-default-key="${escapeAttr(defaultKey)}" data-set-default-id="${escapeAttr(item.id)}">${isDefault ? 'Clear default' : 'Set default'}</button>` : ''}
                  ${kind ? `<button type="button" class="ghost small" data-rename-master-kind="${escapeAttr(kind)}" data-rename-master-id="${escapeAttr(item.id)}">Rename</button>` : ''}
                  ${kind ? `<button type="button" class="${inactive ? 'secondary' : 'danger'} small" data-toggle-master-kind="${escapeAttr(kind)}" data-toggle-master-id="${escapeAttr(item.id)}">${inactive ? 'Activate' : 'Inactivate'}</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
          ${items.length > 80 ? `<p class="muted tiny">+${items.length - 80} more</p>` : ''}
          ${items.length ? '' : `<p class="muted tiny">No items yet.</p>`}
        </div>
      </div>
    `;
  }

  function bindManageEvents() {
    document.querySelectorAll('[data-setup-section]').forEach(button => {
      button.addEventListener('click', () => {
        state.setupSection = button.dataset.setupSection || 'start';
        state.setupQuickAdd = '';
        render();
      });
    });

    document.querySelectorAll('[data-quick-add-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.quickAddToggle || '';
        state.setupQuickAdd = state.setupQuickAdd === key ? '' : key;
        render();
      });
    });
    document.querySelectorAll('[data-quick-add-close]').forEach(button => {
      button.addEventListener('click', () => {
        state.setupQuickAdd = '';
        render();
      });
    });
    document.getElementById('quickAddAccountSave')?.addEventListener('click', saveQuickAddAccount);
    document.getElementById('quickAddAssetSave')?.addEventListener('click', saveQuickAddAsset);
    document.getElementById('quickAddCategorySave')?.addEventListener('click', saveQuickAddCategory);
    document.querySelectorAll('[data-set-default-key]').forEach(button => {
      button.addEventListener('click', async () => {
        await setMasterDefault(button.dataset.setDefaultKey, button.dataset.setDefaultId);
      });
    });
    document.querySelectorAll('[data-clear-default-key]').forEach(button => {
      button.addEventListener('click', async () => {
        await setMasterDefault(button.dataset.clearDefaultKey, '');
      });
    });
    document.querySelectorAll('[data-rename-master-kind]').forEach(button => {
      button.addEventListener('click', async () => {
        await renameMasterItem(button.dataset.renameMasterKind, button.dataset.renameMasterId);
      });
    });
    document.querySelectorAll('[data-toggle-master-kind]').forEach(button => {
      button.addEventListener('click', async () => {
        await toggleMasterInactive(button.dataset.toggleMasterKind, button.dataset.toggleMasterId);
      });
    });

    document.getElementById('syncSettingsForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      await saveSyncSettings(data);
    });
    document.getElementById('testSyncBtn')?.addEventListener('click', testSyncConnection);
    document.getElementById('syncNowBtn')?.addEventListener('click', () => syncNow({ forceAll: false }));
    document.getElementById('syncUploadAllBtn')?.addEventListener('click', () => uploadAllLocalData());
    document.getElementById('syncPullBtn')?.addEventListener('click', () => pullOnlyFromCloud());

    bindFdAutoCalc(document);
    const assetTypeSelect = document.getElementById('assetInvestmentType');
    const fdDetails = document.getElementById('assetFdFields');
    const syncAssetFdVisibility = () => {
      if (!assetTypeSelect || !fdDetails) return;
      fdDetails.hidden = assetTypeSelect.value !== 'Fixed Deposits';
      const fdBankSelect = fdDetails.querySelector('[name="fdBankAccountId"]');
      if (fdBankSelect) fdBankSelect.required = !fdDetails.hidden;
    };
    assetTypeSelect?.addEventListener('change', syncAssetFdVisibility);
    syncAssetFdVisibility();

    document.getElementById('generalSettingsForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(event.target);
      const goLiveDate = normalizeDate(data.get('goLiveDate')) || state.data.settings.goLiveDate || DEFAULT_SETTINGS.goLiveDate;
      const trackingStartMonth = monthKey(goLiveDate) || state.data.settings.trackingStartMonth || DEFAULT_SETTINGS.trackingStartMonth;
      const currency = String(data.get('currency') || '').trim() || 'INR';
      const excludedAverageMonths = data.getAll('excludedAverageMonths').filter(isReportMonthAllowed).sort().join(',');
      await putLocal('settings', { ...state.data.settings, id: 'default', goLiveDate, trackingStartMonth, currency, excludedAverageMonths });
      await loadAll();
      render();
      scheduleAutoSync();
      toast('General settings saved');
    });

    document.getElementById('initialInvestmentsForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(event.target);
      for (const account of state.data.accounts) {
        await putLocal('accounts', {
          ...account,
          openingBalance: num(data.get(`accountOpening__${account.id}`)),
          notes: String(data.get(`accountNotes__${account.id}`) || '').trim()
        });
      }
      for (const asset of state.data.assets) {
        const isFd = isFixedDepositAsset(asset);
        let fdPrincipal = isFd ? num(data.get(`fdPrincipal__${asset.id}`)) : 0;
        let fdMaturity = isFd ? num(data.get(`fdMaturityAmount__${asset.id}`)) : 0;
        let fdInterest = isFd ? num(data.get(`fdInterestAmount__${asset.id}`)) : 0;
        if (isFd && fdPrincipal && fdMaturity && !fdInterest) fdInterest = fdMaturity - fdPrincipal;
        if (isFd && fdPrincipal && fdInterest && !fdMaturity) fdMaturity = fdPrincipal + fdInterest;
        await putLocal('assets', {
          ...asset,
          openingAmount: isFd ? fdPrincipal : num(data.get(`assetOpening__${asset.id}`)),
          currentValue: num(data.get(`assetCurrent__${asset.id}`)),
          maturityDate: String(data.get(`assetMaturity__${asset.id}`) || ''),
          fdBankAccountId: isFd ? String(data.get(`fdBankAccountId__${asset.id}`) || '').trim() : (asset.fdBankAccountId || ''),
          fdAccountNumber: isFd ? String(data.get(`fdAccountNumber__${asset.id}`) || '').trim() : (asset.fdAccountNumber || ''),
          fdPrincipal: isFd ? fdPrincipal : num(asset.fdPrincipal),
          fdMaturityAmount: isFd ? fdMaturity : num(asset.fdMaturityAmount),
          fdInterestAmount: isFd ? fdInterest : num(asset.fdInterestAmount),
          notes: String(data.get(`assetNotes__${asset.id}`) || '').trim()
        });
      }
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Initial investments and account balances saved');
    });

    document.getElementById('accountForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      await putLocal('accounts', {
        id: newId('acc'),
        name: data.name.trim(),
        accountType: data.accountType,
        openingBalance: num(data.openingBalance),
        notes: String(data.notes || '').trim()
      });
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Account added');
    });
    document.getElementById('categoryForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      await putLocal('categories', { id: newId('cat'), name: data.name.trim(), transactionType: data.transactionType, includeInReports: data.includeInReports === 'on', monthlyBudget: num(data.monthlyBudget) });
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Category added');
    });
    document.getElementById('assetForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const isFd = normalizeInvestmentType(data.investmentType) === 'Fixed Deposits';
      let fdPrincipal = isFd ? num(data.fdPrincipal) : 0;
      let fdMaturity = isFd ? num(data.fdMaturityAmount) : 0;
      let fdInterest = isFd ? num(data.fdInterestAmount) : 0;
      if (isFd && fdPrincipal && fdMaturity && !fdInterest) fdInterest = fdMaturity - fdPrincipal;
      if (isFd && fdPrincipal && fdInterest && !fdMaturity) fdMaturity = fdPrincipal + fdInterest;
      await putLocal('assets', {
        id: newId('asset'),
        name: data.name.trim(),
        investmentType: data.investmentType,
        openingAmount: isFd ? (fdPrincipal || num(data.openingAmount)) : num(data.openingAmount),
        currentValue: num(data.currentValue),
        maturityDate: data.maturityDate || '',
        fdBankAccountId: isFd ? String(data.fdBankAccountId || '').trim() : '',
        fdAccountNumber: isFd ? String(data.fdAccountNumber || '').trim() : '',
        fdPrincipal: isFd ? fdPrincipal : 0,
        fdMaturityAmount: isFd ? fdMaturity : 0,
        fdInterestAmount: isFd ? fdInterest : 0,
        notes: String(data.notes || '').trim()
      });
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Asset added');
    });
    document.getElementById('settingsForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const currency = String(form.get('currency') || '').trim() || 'INR';
      const excludedAverageMonths = form.getAll('excludedAverageMonths').filter(isReportMonthAllowed).sort().join(',');
      await putLocal('settings', { ...state.data.settings, id: 'default', currency, excludedAverageMonths });
      await loadAll();
      render();
      scheduleAutoSync();
      toast('Settings saved');
    });
  }

  async function saveQuickAddAccount() {
    const type = document.getElementById('quickAccountType')?.value || '';
    const name = String(document.getElementById('quickAccountName')?.value || '').trim();
    if (!name) { toast('Enter account name'); return; }
    await putLocal('accounts', {
      id: newId('acc'),
      name,
      accountType: type || 'Savings',
      openingBalance: num(document.getElementById('quickAccountOpening')?.value),
      notes: String(document.getElementById('quickAccountNotes')?.value || '').trim()
    });
    await loadAll();
    state.setupQuickAdd = '';
    render();
    scheduleAutoSync();
    toast(`${type || 'Account'} added`);
  }

  async function saveQuickAddAsset() {
    const type = document.getElementById('quickAssetType')?.value || 'Mutual Funds';
    const name = String(document.getElementById('quickAssetName')?.value || '').trim();
    if (!name) { toast('Enter asset name'); return; }
    const isFd = type === 'Fixed Deposits';
    let fdPrincipal = isFd ? num(document.getElementById('quickFdPrincipal')?.value) : 0;
    let fdMaturity = isFd ? num(document.getElementById('quickFdMaturityAmount')?.value) : 0;
    let fdInterest = isFd ? num(document.getElementById('quickFdInterestAmount')?.value) : 0;
    if (isFd && fdPrincipal && fdMaturity && !fdInterest) fdInterest = fdMaturity - fdPrincipal;
    if (isFd && fdPrincipal && fdInterest && !fdMaturity) fdMaturity = fdPrincipal + fdInterest;
    await putLocal('assets', {
      id: newId('asset'),
      name,
      investmentType: type,
      openingAmount: isFd ? fdPrincipal : num(document.getElementById('quickAssetOpening')?.value),
      currentValue: num(document.getElementById('quickAssetCurrent')?.value),
      maturityDate: String(document.getElementById('quickAssetMaturity')?.value || ''),
      fdBankAccountId: isFd ? String(document.querySelector('[name="quickFdBankAccountId"]')?.value || '').trim() : '',
      fdAccountNumber: isFd ? String(document.getElementById('quickFdAccountNumber')?.value || '').trim() : '',
      fdPrincipal: isFd ? fdPrincipal : 0,
      fdMaturityAmount: isFd ? fdMaturity : 0,
      fdInterestAmount: isFd ? fdInterest : 0,
      notes: String(document.getElementById('quickAssetNotes')?.value || '').trim()
    });
    await loadAll();
    state.setupQuickAdd = '';
    render();
    scheduleAutoSync();
    toast(`${shortInvestmentTypeLabel(type)} added`);
  }

  async function saveQuickAddCategory() {
    const type = document.getElementById('quickCategoryType')?.value || 'Expense';
    const name = String(document.getElementById('quickCategoryName')?.value || '').trim();
    if (!name) { toast('Enter category name'); return; }
    await putLocal('categories', {
      id: newId('cat'),
      name,
      transactionType: type,
      includeInReports: document.getElementById('quickCategoryInclude')?.checked !== false,
      monthlyBudget: num(document.getElementById('quickCategoryBudget')?.value)
    });
    await loadAll();
    state.setupQuickAdd = '';
    render();
    scheduleAutoSync();
    toast(`${type} category added`);
  }

  function settingsIdList(key) {
    return String(state.data.settings?.[key] || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
  }

  function settingsIdSet(key) {
    return new Set(settingsIdList(key));
  }

  function inactiveKeyForKind(kind) {
    return kind === 'account' ? 'inactiveAccountIds' : kind === 'category' ? 'inactiveCategoryIds' : kind === 'asset' ? 'inactiveAssetIds' : '';
  }

  function masterStoreForKind(kind) {
    return kind === 'account' ? 'accounts' : kind === 'category' ? 'categories' : kind === 'asset' ? 'assets' : '';
  }

  function masterRowsForKind(kind) {
    if (kind === 'account') return state.data.accounts;
    if (kind === 'category') return state.data.categories;
    if (kind === 'asset') return state.data.assets;
    return [];
  }

  function isMasterInactive(kind, id) {
    const key = inactiveKeyForKind(kind);
    return key ? settingsIdSet(key).has(String(id || '')) : false;
  }

  function isAccountActive(account, includeIds = []) {
    const include = new Set((Array.isArray(includeIds) ? includeIds : [includeIds]).filter(Boolean).map(String));
    return include.has(String(account?.id || '')) || !isMasterInactive('account', account?.id);
  }

  function isCategoryActive(category, includeId = '') {
    return String(category?.id || '') === String(includeId || '') || !isMasterInactive('category', category?.id);
  }

  function isAssetActive(asset, includeId = '') {
    return String(asset?.id || '') === String(includeId || '') || !isMasterInactive('asset', asset?.id);
  }

  function entryAccounts(predicate = () => true, includeIds = []) {
    return state.data.accounts.filter(account => predicate(account) && isAccountActive(account, includeIds));
  }

  function entryCategoriesFor(type, includeId = '') {
    return state.data.categories.filter(category => category.transactionType === type && isCategoryActive(category, includeId));
  }

  function entryAssetsForType(type, includeId = '') {
    return state.data.assets.filter(asset => assetInvestmentType(asset) === type && isAssetActive(asset, includeId));
  }

  function defaultKeysForMasterId(id) {
    const keys = [
      'defaultExpenseCategoryId','defaultIncomeCategoryId','defaultInvestmentCategoryId',
      'defaultSavingsAccountId','defaultCashAccountId','defaultCreditCardAccountId','defaultCompanyAccountId',
      'defaultMutualFundAssetId','defaultStockAssetId','defaultFdAssetId','defaultOtherInvestmentAssetId'
    ];
    return keys.filter(key => String(state.data.settings?.[key] || '') === String(id || ''));
  }

  function kindForDefaultKey(key) {
    if (['defaultExpenseCategoryId','defaultIncomeCategoryId','defaultInvestmentCategoryId'].includes(key)) return 'category';
    if (['defaultSavingsAccountId','defaultCashAccountId','defaultCreditCardAccountId','defaultCompanyAccountId'].includes(key)) return 'account';
    if (['defaultMutualFundAssetId','defaultStockAssetId','defaultFdAssetId','defaultOtherInvestmentAssetId'].includes(key)) return 'asset';
    return '';
  }

  async function renameMasterItem(kind, id) {
    const storeName = masterStoreForKind(kind);
    const item = masterRowsForKind(kind).find(row => String(row.id) === String(id));
    if (!storeName || !item) {
      toast('Master item not found');
      return;
    }
    const nextName = String(window.prompt(`Rename ${item.name}`, item.name) || '').trim();
    if (!nextName || nextName === item.name) return;
    const duplicate = masterRowsForKind(kind).some(row => String(row.id) !== String(id) && norm(row.name) === norm(nextName));
    if (duplicate && !window.confirm('Another item already has this name. Continue anyway?')) return;
    await putLocal(storeName, { ...item, name: nextName });
    await loadAll();
    render();
    scheduleAutoSync();
    toast('Master value renamed');
  }

  async function toggleMasterInactive(kind, id) {
    const key = inactiveKeyForKind(kind);
    if (!key || !id) return;
    const inactive = settingsIdSet(key);
    const wasInactive = inactive.has(String(id));
    if (wasInactive) inactive.delete(String(id));
    else inactive.add(String(id));
    const patch = { ...state.data.settings, id: 'default', [key]: [...inactive].sort().join(',') };
    if (!wasInactive) {
      for (const defaultKey of defaultKeysForMasterId(id)) patch[defaultKey] = '';
    }
    await putLocal('settings', patch);
    await loadAll();
    render();
    scheduleAutoSync();
    toast(wasInactive ? 'Master value activated' : 'Master value inactivated');
  }

  async function setMasterDefault(defaultKey, defaultId) {
    if (!defaultKey) return;
    const current = String(state.data.settings?.[defaultKey] || '');
    const requested = String(defaultId || '');
    const kind = kindForDefaultKey(defaultKey);
    if (requested && kind && isMasterInactive(kind, requested)) {
      toast('Activate this value before setting it as default');
      return;
    }
    const nextDefault = requested && requested !== current ? requested : '';
    await putLocal('settings', { ...state.data.settings, id: 'default', [defaultKey]: nextDefault });
    await loadAll();
    render();
    scheduleAutoSync();
    toast(nextDefault ? 'Default updated' : 'Default cleared');
  }

  function bindFdAutoCalc(root) {
    const inputs = [...root.querySelectorAll('[data-fd-calc]')];
    const byId = groupBy(inputs, input => input.dataset.fdId);
    for (const id of Object.keys(byId)) {
      for (const input of byId[id]) {
        input.addEventListener('input', () => autoFillFdAmounts(id, input.dataset.fdRole));
      }
    }
  }

  function autoFillFdAmounts(id, changedRole) {
    const principalEl = document.querySelector(`[data-fd-id="${cssEscape(id)}"][data-fd-role="principal"]`);
    const maturityEl = document.querySelector(`[data-fd-id="${cssEscape(id)}"][data-fd-role="maturity"]`);
    const interestEl = document.querySelector(`[data-fd-id="${cssEscape(id)}"][data-fd-role="interest"]`);
    if (!principalEl || !maturityEl || !interestEl) return;
    const principal = num(principalEl.value);
    const maturity = num(maturityEl.value);
    const interest = num(interestEl.value);
    if (!principal) return;
    if (changedRole === 'maturity' && maturity) {
      interestEl.value = roundMoney(maturity - principal);
    } else if (changedRole === 'interest' && interest) {
      maturityEl.value = roundMoney(principal + interest);
    } else if (changedRole === 'principal') {
      if (maturity) interestEl.value = roundMoney(maturity - principal);
      else if (interest) maturityEl.value = roundMoney(principal + interest);
    }
  }

  function roundMoney(value) {
    const n = Math.round(num(value) * 100) / 100;
    return Number.isFinite(n) ? String(n) : '0';
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(String(value));
    return String(value).replace(/"/g, '\\"');
  }

  function renderMiniSummaryCard() {
    const summary = getMonthSummary(currentMonthKey());
    return `
      <div class="card">
        <h2>This month</h2>
        <div class="grid two">
          ${kpi('Income', money(summary.income), '', 'good')}
          ${kpi('Expense', money(summary.expense), '', summary.expense > summary.income ? 'danger' : '')}
          ${kpi('Invested', money(summary.investment), '', 'warn')}
          ${kpi('Net cashflow', money(summary.freeCashFlow), '', summary.freeCashFlow >= 0 ? 'good' : 'danger')}
        </div>
      </div>
    `;
  }

  function renderRecentCard(limit = 5) {
    const recent = state.data.transactions.slice(0, limit);
    return `
      <div class="card">
        <div class="card-title-row"><h2>Recent entries</h2><button class="ghost small" data-recent-more>View all</button></div>
        ${recent.length ? `<div class="record-list">${recent.map(recordCardHtml).join('')}</div>` : empty('No transactions yet. Start by saving one entry.')}
      </div>
    `;
  }

  function kpi(label, value, hint = '', tone = '') {
    return `<div class="kpi ${tone}"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div>${hint ? `<div class="muted tiny">${escapeHtml(hint)}</div>` : ''}</div>`;
  }

  function empty(message) {
    return `<div class="empty">${escapeHtml(message)}</div>`;
  }

  function monthSelectHtml(id, selected, includeAll = false) {
    const months = knownMonths();
    return `
      <select id="${escapeAttr(id)}" style="width:auto; min-width:145px;">
        ${includeAll ? `<option value="All" ${selected === 'All' ? 'selected' : ''}>All months</option>` : ''}
        ${months.map(m => `<option value="${escapeAttr(m)}" ${m === selected ? 'selected' : ''}>${escapeHtml(formatMonth(m))}</option>`).join('')}
      </select>
    `;
  }

  function filteredRecords() {
    const f = state.recordFilter;
    const term = String(f.search || '').trim().toLowerCase();
    const records = state.data.transactions.filter(t => {
      if (f.month !== 'All' && monthKey(t.date) !== f.month) return false;
      if (f.type !== 'All' && t.type !== f.type) return false;
      if (!term) return true;
      const haystack = [
        t.type,
        t.notes,
        categoryById(t.categoryId)?.name,
        accountById(t.fromAccountId)?.name,
        accountById(t.toAccountId)?.name,
        assetById(t.assetId)?.name
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
    return sortRecords(records, f.sort || 'dateDesc');
  }

  function sortRecords(records, sortMode = 'dateDesc') {
    const list = [...records];
    const byDateAsc = (a, b) => (a.date || '').localeCompare(b.date || '') || (a.createdAt || '').localeCompare(b.createdAt || '') || String(a.id || '').localeCompare(String(b.id || ''));
    const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || '') || String(b.id || '').localeCompare(String(a.id || ''));
    if (sortMode === 'dateAsc') return list.sort(byDateAsc);
    if (sortMode === 'amountDesc') return list.sort((a, b) => num(b.amount) - num(a.amount) || byDateDesc(a, b));
    if (sortMode === 'amountAsc') return list.sort((a, b) => num(a.amount) - num(b.amount) || byDateDesc(a, b));
    return list.sort(byDateDesc);
  }

  function categoriesFor(type) {
    return state.data.categories.filter(c => c.transactionType === type);
  }

  function defaultCategoryFor(type) {
    const id = defaultCategoryIdFor(type);
    return categoryById(id) || entryCategoriesFor(type)[0] || null;
  }

  function defaultCategoryIdFor(type) {
    const keyMap = {
      Expense: 'defaultExpenseCategoryId',
      Income: 'defaultIncomeCategoryId',
      Investment: 'defaultInvestmentCategoryId'
    };
    const id = state.data.settings?.[keyMap[type]] || '';
    return entryCategoriesFor(type).some(c => c.id === id) ? id : '';
  }

  function defaultAccountIdForType(type) {
    const keyMap = {
      Savings: 'defaultSavingsAccountId',
      Cash: 'defaultCashAccountId',
      'Credit Card': 'defaultCreditCardAccountId',
      Company: 'defaultCompanyAccountId'
    };
    const id = state.data.settings?.[keyMap[type]] || '';
    return entryAccounts(a => a.accountType === type).some(a => a.id === id) ? id : '';
  }

  function defaultNormalAccountId(accounts = entryAccounts(a => a.accountType !== 'Credit Card')) {
    const candidates = [defaultAccountIdForType('Savings'), defaultAccountIdForType('Cash'), defaultAccountIdForType('Company')].filter(Boolean);
    return candidates.find(id => accounts.some(a => a.id === id)) || '';
  }

  function defaultSpendAccountId(accounts = entryAccounts(() => true)) {
    const candidates = [defaultAccountIdForType('Credit Card'), defaultAccountIdForType('Savings'), defaultAccountIdForType('Cash'), defaultAccountIdForType('Company')].filter(Boolean);
    return candidates.find(id => accounts.some(a => a.id === id)) || '';
  }

  function defaultAssetIdForInvestmentType(type) {
    const keyMap = {
      'Mutual Funds': 'defaultMutualFundAssetId',
      Stocks: 'defaultStockAssetId',
      'Fixed Deposits': 'defaultFdAssetId',
      'Other Investments': 'defaultOtherInvestmentAssetId'
    };
    const id = state.data.settings?.[keyMap[type]] || '';
    return entryAssetsForType(type).some(a => a.id === id) ? id : '';
  }

  function defaultInvestmentTypeForEntry(investmentTypes = []) {
    return ['Mutual Funds', 'Stocks', 'Fixed Deposits', 'Other Investments']
      .find(type => investmentTypes.includes(type) && defaultAssetIdForInvestmentType(type));
  }

  function accountById(id) { return state.data.accounts.find(a => a.id === id); }
  function categoryById(id) { return state.data.categories.find(c => c.id === id); }
  function assetById(id) { return state.data.assets.find(a => a.id === id); }
  function resolveAccountIdByNameForImport(name) {
    const wanted = norm(name || '');
    if (!wanted) return '';
    const account = state.data.accounts.find(a => norm(a.name) === wanted);
    return account?.id || '';
  }

  function goLiveDateISO() {
    return normalizeDate(state.data.settings?.goLiveDate) || `${state.data.settings?.trackingStartMonth || DEFAULT_SETTINGS.trackingStartMonth}-01`;
  }

  function goLiveMonth() {
    return monthKey(goLiveDateISO()) || DEFAULT_SETTINGS.trackingStartMonth;
  }

  function isBeforeGoLive(t) {
    const live = goLiveDateISO();
    const date = normalizeDate(t?.date) || String(t?.date || '').slice(0, 10);
    return Boolean(live && date && date < live);
  }

  function isInventoryTransaction(t) {
    return !isBeforeGoLive(t);
  }

  function matchesLiveThroughMonth(t, month) {
    if (!isInventoryTransaction(t)) return false;
    return matchesThroughMonth(t, month);
  }

  function historicalSummaryText() {
    return `Go live: ${formatDate(goLiveDateISO())}. Transactions before this date are historical/report-only and are excluded from live balances, investments, card outstanding, and net worth.`;
  }

  function accountBalances(month = 'All') {
    return state.data.accounts.map(account => ({ account, balance: calcAccountBalance(account, month) }));
  }

  function calcAccountBalance(account, month = 'All') {
    let balance = num(account.openingBalance);
    for (const t of state.data.transactions) {
      if (!matchesLiveThroughMonth(t, month)) continue;
      const amount = num(t.amount);
      if (account.accountType === 'Credit Card') {
        if (t.fromAccountId === account.id && ['Expense', 'Investment'].includes(t.type)) balance += amount;
        if (t.toAccountId === account.id && ['Credit Card Payment', 'Transfer'].includes(t.type)) balance -= amount;
      } else {
        if (t.toAccountId === account.id && ['Income', 'Contribution', 'Transfer', 'Opening Balance'].includes(t.type)) balance += amount;
        if (t.fromAccountId === account.id && ['Expense', 'Investment', 'Transfer', 'Credit Card Payment'].includes(t.type)) balance -= amount;
      }
    }
    return balance;
  }

  function investmentReportRows(month = 'All') {
    return investmentRows(month).map(row => ({
      ...row,
      type: assetInvestmentType(row.asset),
      value: investmentDisplayValue(row)
    }));
  }

  function investmentRows(month = 'All') {
    return state.data.assets.map(asset => {
      const added = sumTransactions(t => t.type === 'Investment' && t.assetId === asset.id && matchesLiveThroughMonth(t, month));
      const invested = assetOpeningAmount(asset) + added;
      const currentValue = isFixedDepositAsset(asset)
        ? (num(asset.currentValue) || fdMaturityAmount(asset) || fdPrincipalAmount(asset) || invested)
        : (num(asset.currentValue) > 0 ? num(asset.currentValue) : invested);
      return { asset, invested, currentValue, gainLoss: currentValue - invested };
    });
  }

  function investmentDisplayValue(row) {
    if (isFixedDepositAsset(row?.asset)) return fdDisplayValue(row.asset, row);
    return num(row.currentValue) > 0 ? num(row.currentValue) : num(row.invested);
  }

  function fdDisplayValue(asset, row = {}) {
    return num(asset?.currentValue) || fdMaturityAmount(asset) || fdPrincipalAmount(asset) || num(row.currentValue) || num(row.invested) || assetOpeningAmount(asset);
  }

  function getMonthSummary(month) {
    const txns = state.data.transactions.filter(t => monthKey(t.date) === month);
    return summarizeTransactions(txns);
  }

  function getPeriodSummary(month) {
    return summarizeTransactions(transactionsFor(month));
  }

  function summarizeTransactions(txns) {
    const income = sum(txns.filter(t => ['Income', 'Contribution'].includes(t.type)).map(t => t.amount));
    const expense = sum(txns.filter(t => t.type === 'Expense' && categoryById(t.categoryId)?.includeInReports !== false).map(t => t.amount));
    const investment = sum(txns.filter(t => t.type === 'Investment').map(t => t.amount));
    const cardPayment = sum(txns.filter(t => t.type === 'Credit Card Payment').map(t => t.amount));
    // Credit-card bill payments are liability settlements/cash movements, not new expenses.
    // Expenses are already captured when the card transaction is entered, so card payments are not subtracted again.
    const freeCashFlow = income - expense - investment;
    const bankCashMovement = freeCashFlow - cardPayment;
    return { income, expense, investment, cardPayment, freeCashFlow, bankCashMovement };
  }

  function categoryTotals(type, month) {
    const map = new Map();
    for (const t of state.data.transactions) {
      if (t.type !== type || !matchesMonth(t, month)) continue;
      const id = t.categoryId || 'none';
      map.set(id, (map.get(id) || 0) + num(t.amount));
    }
    return [...map.entries()].map(([categoryId, total]) => ({ categoryId, total })).sort((a, b) => b.total - a.total);
  }

  function transactionsFor(month) {
    return state.data.transactions.filter(t => matchesMonth(t, month));
  }

  function matchesMonth(t, month) {
    const key = monthKey(t.date);
    if (!isReportMonthAllowed(key)) return false;
    return month === 'All' || key === month;
  }

  function matchesThroughMonth(t, month) {
    const key = monthKey(t.date);
    if (!isReportMonthAllowed(key)) return false;
    if (month === 'All') return true;
    return key <= month;
  }

  function accountPeriodFlow(account, month) {
    let inflow = 0;
    let outflow = 0;
    for (const t of transactionsFor(month)) {
      const amount = num(t.amount);
      if (t.toAccountId === account.id && ['Income', 'Contribution', 'Transfer', 'Opening Balance'].includes(t.type)) inflow += amount;
      if (t.fromAccountId === account.id && ['Expense', 'Investment', 'Transfer', 'Credit Card Payment'].includes(t.type)) outflow += amount;
    }
    return { inflow, outflow };
  }

  function creditCardPeriodFlow(account, month) {
    let spends = 0;
    let payments = 0;
    for (const t of transactionsFor(month)) {
      const amount = num(t.amount);
      if (t.fromAccountId === account.id && ['Expense', 'Investment'].includes(t.type)) spends += amount;
      if (t.toAccountId === account.id && ['Credit Card Payment', 'Transfer'].includes(t.type)) payments += amount;
    }
    return { spends, payments };
  }

  function investmentSummaryRows(investmentType, month) {
    return state.data.assets
      .filter(asset => assetInvestmentType(asset) === investmentType)
      .map(asset => {
        const periodInvested = sumTransactions(t => t.type === 'Investment' && t.assetId === asset.id && matchesMonth(t, month));
        const transactionInvested = sumTransactions(t => t.type === 'Investment' && t.assetId === asset.id && matchesLiveThroughMonth(t, month));
        const openingAmount = assetOpeningAmount(asset);
        const totalInvested = openingAmount + transactionInvested;
        const currentValue = isFixedDepositAsset(asset)
          ? (num(asset.currentValue) || fdMaturityAmount(asset) || fdPrincipalAmount(asset) || totalInvested)
          : (num(asset.currentValue) > 0 ? num(asset.currentValue) : totalInvested);
        return { asset, openingAmount, periodInvested, transactionInvested, totalInvested, currentValue, gainLoss: currentValue - totalInvested };
      });
  }

  function overallPosition(month = 'All') {
    const allBalances = accountBalances(month);
    const rows = investmentRows(month);
    const normalBalance = allBalances.filter(row => row.account.accountType !== 'Credit Card').reduce((sum, row) => sum + row.balance, 0);
    const cardOutstanding = allBalances.filter(row => row.account.accountType === 'Credit Card').reduce((sum, row) => sum + row.balance, 0);
    const investedValue = rows.reduce((sum, row) => sum + investmentDisplayValue(row), 0);
    const invested = rows.reduce((sum, row) => sum + row.invested, 0);
    const netWorth = normalBalance + investedValue - cardOutstanding;
    return { normalBalance, cardOutstanding, invested, investedValue, netWorth };
  }

  function groupTotals(items, labelGetter, valueGetter = item => num(item.amount)) {
    const map = new Map();
    for (const item of items) {
      const label = labelGetter(item) || 'Other';
      map.set(label, (map.get(label) || 0) + valueGetter(item));
    }
    return [...map.entries()].map(([label, total]) => ({ label, total })).sort((a, b) => b.total - a.total);
  }

  function periodLabel(month) {
    return month === 'All' ? 'All months' : formatMonth(month);
  }

  function pctText(value, total) {
    const n = num(total);
    if (!n) return '0%';
    return `${Math.round(num(value) / n * 1000) / 10}%`;
  }

  function sumTransactions(predicate) {
    return sum(state.data.transactions.filter(predicate).map(t => t.amount));
  }

  function sum(values) { return values.reduce((total, value) => total + num(value), 0); }
  function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function unique(values) { return [...new Set(values.filter(Boolean))]; }

  function knownMonths() {
    const months = new Set();
    const transactionMonths = state.data.transactions.map(t => monthKey(t.date)).filter(isReportMonthAllowed);
    transactionMonths.forEach(m => months.add(m));
    const goLive = isReportMonthAllowed(goLiveMonth()) ? goLiveMonth() : MIN_REPORT_MONTH;
    const current = currentMonthKey() >= MIN_REPORT_MONTH ? currentMonthKey() : MIN_REPORT_MONTH;
    const maxMonth = [current, goLive, ...transactionMonths].filter(isReportMonthAllowed).sort().pop() || current;
    for (const m of monthRange(MIN_REPORT_MONTH, maxMonth)) months.add(m);
    return [...months].filter(isReportMonthAllowed).sort().reverse();
  }

  function isReportMonthAllowed(month) {
    return /^\d{4}-\d{2}$/.test(String(month || '')) && String(month) >= MIN_REPORT_MONTH;
  }

  function excludedAverageMonthSet() {
    return new Set(String(state.data.settings.excludedAverageMonths || '').split(/[\s,]+/).filter(isReportMonthAllowed));
  }

  function averageEligibleMonths(valueGetter) {
    const excluded = excludedAverageMonthSet();
    return trendMonths().filter(month => !excluded.has(month) && num(valueGetter(getMonthSummary(month), month)) > 0);
  }

  function averageExclusionCheckboxes() {
    const excluded = excludedAverageMonthSet();
    const months = trendMonths().slice().reverse();
    if (!months.length) return '<p class="muted tiny">No months available yet.</p>';
    return `
      <div class="month-check-grid">
        ${months.map(month => `
          <label class="month-check">
            <input type="checkbox" name="excludedAverageMonths" value="${escapeAttr(month)}" ${excluded.has(month) ? 'checked' : ''}>
            <span>${escapeHtml(formatMonthShort(month))}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  function monthRange(start, end) {
    if (!/^\d{4}-\d{2}$/.test(start) || !/^\d{4}-\d{2}$/.test(end)) return [];
    const [sy, sm] = start.split('-').map(Number);
    const [ey, em] = end.split('-').map(Number);
    const result = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      result.push(`${y}-${String(m).padStart(2, '0')}`);
      m += 1;
      if (m > 12) { m = 1; y += 1; }
      if (result.length > 240) break;
    }
    return result;
  }

  function lastNMonths(count) {
    const result = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 0; i < count; i++) {
      const copy = new Date(d.getFullYear(), d.getMonth() - i, 1);
      result.push(`${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
  }

  function todayISO() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  function currentMonthKey() { return todayISO().slice(0, 7); }
  function monthKey(date) { return String(date || '').slice(0, 7); }

  function formatMonth(month) {
    if (!month || month === 'All') return 'All months';
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  function formatMonthShort(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  }

  function formatDate(date) {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function shortMoney(value) {
    const n = Math.abs(num(value));
    const sign = num(value) < 0 ? '-' : '';
    const currency = state.data.settings.currency || 'INR';
    if (n >= 10000000) return `${sign}${currency} ${(n / 10000000).toFixed(n >= 100000000 ? 0 : 1)}Cr`;
    if (n >= 100000) return `${sign}${currency} ${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L`;
    if (n >= 1000) return `${sign}${currency} ${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return `${sign}${currency} ${Math.round(n)}`;
  }

  function money(value) {
    const currency = state.data.settings.currency || 'INR';
    const amount = num(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${currency} ${amount}`;
  }

  function amountClass(type) {
    if (['Income', 'Contribution'].includes(type)) return 'income';
    if (type === 'Expense') return 'expense';
    if (type === 'Investment') return 'investment';
    if (type === 'Credit Card Payment') return 'card';
    return '';
  }

  function groupBy(items, getter) {
    return items.reduce((acc, item) => {
      const key = getter(item) || 'Other';
      (acc[key] ||= []).push(item);
      return acc;
    }, {});
  }

  function newId(prefix) {
    if (window.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/'/g, '&#39;'); }

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2400);
  }


  async function exportExcel() {
    await loadAll();
    const sheets = buildExcelExportSheets();
    const blob = createXlsxBlob(sheets);
    downloadBlob(`finance-tracker-export-${todayISO()}.xlsx`, blob);
    toast('Excel workbook exported');
  }

  function buildExcelExportSheets() {
    const months = knownMonths().sort();
    const accountBalanceMap = new Map(accountBalances().map(row => [row.account.id, row.balance]));
    const investmentMap = new Map(investmentRows().map(row => [row.asset.id, row]));
    const headers = {
      transactions: ['Transaction_ID', 'Date', 'Month', 'Transaction_Type', 'Amount', 'Category_ID', 'Category', 'From_Account_ID', 'From_Account', 'To_Account_ID', 'To_Account', 'Investment_Type', 'Asset_ID', 'Investment_Asset', 'Maturity_Date', 'Notes', 'Created_At', 'Updated_At'],
      accounts: ['Account_ID', 'Account_Name', 'Account_Type', 'Opening_Balance', 'Current_Balance', 'Active', 'Comments'],
      categories: ['Category_ID', 'Category_Name', 'Transaction_Type', 'Include_In_Reports', 'Monthly_Budget', 'Active'],
      assets: ['Asset_ID', 'Asset_Name', 'Investment_Type', 'Opening_Amount', 'Manual_Current_Value', 'Maturity_Date', 'FD_Linked_Bank_ID', 'FD_Linked_Bank', 'FD_Account_Number', 'FD_Principal', 'FD_Maturity_Amount', 'FD_Interest_Amount', 'Total_Invested', 'Estimated_Current_Value', 'Gain_Loss', 'Active', 'Comments'],
      monthly: ['Month', 'Income', 'Expense', 'Investment', 'Credit_Card_Payment', 'Net_Cash_Flow_Excluding_Card_Payments', 'Bank_Cash_Movement_After_Card_Payments'],
      accountSummary: ['Account_Name', 'Account_Type', 'Opening_Balance', 'Current_Balance', 'Comments'],
      expenseSummary: ['Month', 'Category', 'Amount'],
      incomeSummary: ['Month', 'Category', 'Amount'],
      investmentSummary: ['Investment_Type', 'Asset', 'Opening_Amount', 'Transaction_Invested', 'Total_Invested', 'Manual_Current_Value', 'Estimated_Current_Value', 'Gain_Loss', 'Maturity_Date', 'FD_Linked_Bank_ID', 'FD_Linked_Bank', 'FD_Account_Number', 'FD_Principal', 'FD_Maturity_Amount', 'FD_Interest_Amount', 'Comments'],
      cardSummary: ['Credit_Card', 'Opening_Outstanding', 'Current_Outstanding', 'Comments'],
      netWorth: ['Component', 'Amount'],
      settings: ['Setting', 'Value']
    };

    const transactions = [...state.data.transactions].sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.createdAt || '').localeCompare(b.createdAt || ''));
    const transactionRows = transactions.map(t => [
      t.id,
      t.date || '',
      monthKey(t.date),
      t.type || '',
      num(t.amount),
      t.categoryId || '',
      categoryById(t.categoryId)?.name || '',
      t.fromAccountId || '',
      accountById(t.fromAccountId)?.name || '',
      t.toAccountId || '',
      accountById(t.toAccountId)?.name || '',
      t.investmentType || '',
      t.assetId || '',
      assetById(t.assetId)?.name || '',
      t.maturityDate || '',
      t.notes || '',
      t.createdAt || '',
      t.updatedAt || ''
    ]);

    const accountRows = state.data.accounts.map(a => [a.id, a.name, a.accountType, num(a.openingBalance), num(accountBalanceMap.get(a.id)), isMasterInactive('account', a.id) ? 'FALSE' : 'TRUE', a.notes || '']);
    const categoryRows = state.data.categories.map(c => [c.id, c.name, c.transactionType, c.includeInReports !== false ? 'TRUE' : 'FALSE', num(c.monthlyBudget), isMasterInactive('category', c.id) ? 'FALSE' : 'TRUE']);
    const assetRows = state.data.assets.map(a => {
      const row = investmentMap.get(a.id) || { invested: assetOpeningAmount(a), currentValue: num(a.currentValue), gainLoss: 0 };
      return [a.id, a.name, a.investmentType, assetOpeningAmount(a), num(a.currentValue), a.maturityDate || '', a.fdBankAccountId || '', isFixedDepositAsset(a) ? fdBankName(a) : '', a.fdAccountNumber || '', fdPrincipalAmount(a), fdMaturityAmount(a), fdInterestAmount(a), row.invested, investmentDisplayValue(row), row.gainLoss, isMasterInactive('asset', a.id) ? 'FALSE' : 'TRUE', a.notes || ''];
    });
    const monthlyRows = months.map(m => {
      const s = getMonthSummary(m);
      return [m, s.income, s.expense, s.investment, s.cardPayment, s.freeCashFlow, s.bankCashMovement];
    });
    const accountSummaryRows = accountBalances().map(({ account, balance }) => [account.name, account.accountType, num(account.openingBalance), balance, account.notes || '']);
    const expenseRows = [];
    const incomeRows = [];
    for (const m of months) {
      for (const row of categoryTotals('Expense', m)) {
        const cat = categoryById(row.categoryId);
        if (!cat || cat.includeInReports === false) continue;
        expenseRows.push([m, cat.name, row.total]);
      }
      for (const row of categoryTotals('Income', m)) {
        const cat = categoryById(row.categoryId);
        incomeRows.push([m, cat?.name || 'Uncategorized', row.total]);
      }
    }
    const investmentRowsExport = investmentRows().map(({ asset, invested, currentValue, gainLoss }) => {
      const transactionInvested = sumTransactions(t => t.type === 'Investment' && t.assetId === asset.id && isInventoryTransaction(t));
      return [assetInvestmentType(asset), asset.name, assetOpeningAmount(asset), transactionInvested, invested, num(asset.currentValue), currentValue, gainLoss, asset.maturityDate || '', asset.fdBankAccountId || '', isFixedDepositAsset(asset) ? fdBankName(asset) : '', asset.fdAccountNumber || '', fdPrincipalAmount(asset), fdMaturityAmount(asset), fdInterestAmount(asset), asset.notes || ''];
    });
    const cardRows = accountBalances()
      .filter(({ account }) => account.accountType === 'Credit Card')
      .map(({ account, balance }) => [account.name, num(account.openingBalance), balance, account.notes || '']);
    const totals = overallPosition();
    const netWorthRows = [
      ['Savings / Cash / Company', totals.normalBalance],
      ['Investments estimated current value', totals.investedValue],
      ['Credit card outstanding', -totals.cardOutstanding],
      ['Net worth', totals.netWorth]
    ];
    const settingsRows = [
      ['Currency', state.data.settings.currency || DEFAULT_SETTINGS.currency],
      ['Go_Live_Date', goLiveDateISO()],
      ['Tracking_Start_Month', goLiveMonth()],
      ['Excluded_Average_Months', state.data.settings.excludedAverageMonths || ''],
      ['Default_Expense_Category', categoryById(state.data.settings.defaultExpenseCategoryId)?.name || ''],
      ['Default_Income_Category', categoryById(state.data.settings.defaultIncomeCategoryId)?.name || ''],
      ['Default_Investment_Category', categoryById(state.data.settings.defaultInvestmentCategoryId)?.name || ''],
      ['Default_Savings_Account', accountById(state.data.settings.defaultSavingsAccountId)?.name || ''],
      ['Default_Credit_Card', accountById(state.data.settings.defaultCreditCardAccountId)?.name || ''],
      ['Default_Mutual_Fund', assetById(state.data.settings.defaultMutualFundAssetId)?.name || ''],
      ['Default_Stock', assetById(state.data.settings.defaultStockAssetId)?.name || ''],
      ['Default_FD', assetById(state.data.settings.defaultFdAssetId)?.name || ''],
      ['Favorite_Reports', favoriteReportIds().map(id => reportTypeById(id).label).join(', ')],
      ['Custom_Report_Descriptions_JSON', state.data.settings.reportDescriptions || '{}'],
      ['Dashboard_Widget_Order', dashboardWidgetOrder().map(id => dashboardWidgetMeta(id).label).join(', ')],
      ['Report_Category_Order', orderedReportGroups().map(group => group.title).join(', ')],
      ['Report_Pill_Order_JSON', state.data.settings.reportPillOrder || '{}'],
      ['Inactive_Accounts', settingsIdList('inactiveAccountIds').map(id => accountById(id)?.name || id).join(', ')],
      ['Inactive_Categories', settingsIdList('inactiveCategoryIds').map(id => categoryById(id)?.name || id).join(', ')],
      ['Inactive_Assets', settingsIdList('inactiveAssetIds').map(id => assetById(id)?.name || id).join(', ')],
      ['Report_Minimum_Month', MIN_REPORT_MONTH],
      ['Historical_Rule', 'Transactions before Go Live Date are excluded from live inventories but included in monthly reports']
    ];

    const investmentTypeSheets = ['Mutual Funds', 'Fixed Deposits', 'Stocks', 'Other Investments'].map(type => ({
      name: safeSheetName(type + '_Report'),
      rows: [headers.investmentSummary, ...investmentSummaryRows(type, 'All').map(r => [type, r.asset.name, r.openingAmount, r.transactionInvested, r.totalInvested, num(r.asset.currentValue), r.currentValue, r.gainLoss, r.asset.maturityDate || '', r.asset.fdBankAccountId || '', isFixedDepositAsset(r.asset) ? fdBankName(r.asset) : '', r.asset.fdAccountNumber || '', fdPrincipalAmount(r.asset), fdMaturityAmount(r.asset), fdInterestAmount(r.asset), r.asset.notes || ''])]
    }));

    return [
      { name: 'Transactions', rows: [headers.transactions, ...transactionRows] },
      { name: 'Accounts', rows: [headers.accounts, ...accountRows] },
      { name: 'Categories', rows: [headers.categories, ...categoryRows] },
      { name: 'Investment_Assets', rows: [headers.assets, ...assetRows] },
      { name: 'Settings', rows: [headers.settings, ...settingsRows] },
      { name: 'Monthly_Summary', rows: [headers.monthly, ...monthlyRows] },
      { name: 'Income_Report', rows: [headers.incomeSummary, ...incomeRows] },
      { name: 'Expense_Report', rows: [headers.expenseSummary, ...expenseRows] },
      { name: 'Savings_Report', rows: [headers.accountSummary, ...accountSummaryRows.filter(r => r[1] !== 'Credit Card')] },
      { name: 'Credit_Cards_Report', rows: [headers.cardSummary, ...cardRows] },
      ...investmentTypeSheets,
      { name: 'Investment_Summary', rows: [headers.investmentSummary, ...investmentRowsExport] },
      { name: 'Net_Worth_Report', rows: [headers.netWorth, ...netWorthRows] }
    ];
  }

  function createXlsxBlob(sheets) {
    const files = createXlsxFiles(sheets);
    return new Blob([zipFiles(files)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function createXlsxFiles(sheets) {
    const safeSheets = sheets.map((sheet, index) => ({
      id: index + 1,
      name: safeSheetName(sheet.name || `Sheet${index + 1}`),
      rows: sheet.rows || []
    }));
    const files = [];
    files.push({ path: '[Content_Types].xml', text: xlsxContentTypes(safeSheets) });
    files.push({ path: '_rels/.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>` });
    files.push({ path: 'docProps/core.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Offline Finance Tracker</dc:creator>
  <cp:lastModifiedBy>Offline Finance Tracker</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>` });
    files.push({ path: 'docProps/app.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Offline Finance Tracker</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${safeSheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="${safeSheets.length}" baseType="lpstr">${safeSheets.map(s => `<vt:lpstr>${xml(s.name)}</vt:lpstr>`).join('')}</vt:vector></TitlesOfParts>
</Properties>` });
    files.push({ path: 'xl/workbook.xml', text: xlsxWorkbookXml(safeSheets) });
    files.push({ path: 'xl/_rels/workbook.xml.rels', text: xlsxWorkbookRels(safeSheets) });
    files.push({ path: 'xl/styles.xml', text: xlsxStylesXml() });
    for (const sheet of safeSheets) {
      files.push({ path: `xl/worksheets/sheet${sheet.id}.xml`, text: xlsxWorksheetXml(sheet.rows) });
    }
    return files;
  }

  function xlsxContentTypes(sheets) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${sheets.map(sheet => `<Override PartName="/xl/worksheets/sheet${sheet.id}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n  ')}
</Types>`;
  }

  function xlsxWorkbookXml(sheets) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl"/>
  <workbookPr defaultThemeVersion="166925"/>
  <sheets>
    ${sheets.map(sheet => `<sheet name="${xmlAttr(sheet.name)}" sheetId="${sheet.id}" r:id="rId${sheet.id}"/>`).join('\n    ')}
  </sheets>
  <calcPr calcId="191029"/>
</workbook>`;
  }

  function xlsxWorkbookRels(sheets) {
    const sheetRels = sheets.map(sheet => `<Relationship Id="rId${sheet.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheet.id}.xml"/>`).join('\n  ');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRels}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  }

  function xlsxStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  }

  function xlsxWorksheetXml(rows) {
    const sheetRows = rows.map((row, r) => {
      const cells = (row || []).map((value, c) => xlsxCellXml(value, c + 1, r + 1, r === 0)).join('');
      return `<row r="${r + 1}">${cells}</row>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
  }

  function xlsxCellXml(value, col, row, header) {
    const ref = `${columnName(col)}${row}`;
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `<c r="${ref}"${header ? ' s="1"' : ''}><v>${value}</v></c>`;
    }
    return `<c r="${ref}" t="inlineStr"${header ? ' s="1"' : ''}><is><t>${xml(String(value))}</t></is></c>`;
  }

  function zipFiles(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const file of files) {
      const nameBytes = encoder.encode(file.path);
      const dataBytes = typeof file.text === 'string' ? encoder.encode(file.text) : new Uint8Array(file.data || []);
      const crc = crc32(dataBytes);
      const localHeader = new Uint8Array(30);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true);
      localView.setUint16(4, 20, true);
      localView.setUint16(6, 0, true);
      localView.setUint16(8, 0, true);
      localView.setUint16(10, 0, true);
      localView.setUint16(12, 0, true);
      localView.setUint32(14, crc, true);
      localView.setUint32(18, dataBytes.length, true);
      localView.setUint32(22, dataBytes.length, true);
      localView.setUint16(26, nameBytes.length, true);
      localView.setUint16(28, 0, true);
      localParts.push(localHeader, nameBytes, dataBytes);

      const centralHeader = new Uint8Array(46);
      const centralView = new DataView(centralHeader.buffer);
      centralView.setUint32(0, 0x02014b50, true);
      centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true);
      centralView.setUint16(8, 0, true);
      centralView.setUint16(10, 0, true);
      centralView.setUint16(12, 0, true);
      centralView.setUint16(14, 0, true);
      centralView.setUint32(16, crc, true);
      centralView.setUint32(20, dataBytes.length, true);
      centralView.setUint32(24, dataBytes.length, true);
      centralView.setUint16(28, nameBytes.length, true);
      centralView.setUint16(30, 0, true);
      centralView.setUint16(32, 0, true);
      centralView.setUint16(34, 0, true);
      centralView.setUint16(36, 0, true);
      centralView.setUint32(38, 0, true);
      centralView.setUint32(42, offset, true);
      centralParts.push(centralHeader, nameBytes);
      offset += localHeader.length + nameBytes.length + dataBytes.length;
    }
    const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, offset, true);
    endView.setUint16(20, 0, true);
    return concatUint8([...localParts, ...centralParts, end]);
  }

  function crc32(bytes) {
    let table = crc32.table;
    if (!table) {
      table = crc32.table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[i] = c >>> 0;
      }
    }
    let crc = 0xffffffff;
    for (const byte of bytes) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function concatUint8(parts) {
    const total = parts.reduce((sumValue, part) => sumValue + part.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }

  async function importExcel(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = await readXlsxWorkbook(file);
      const parsed = parseFinanceWorkbook(workbook);
      if (!parsed.transactions.length && !parsed.accounts.length && !parsed.categories.length && !parsed.assets.length) {
        throw new Error('No recognizable finance rows found');
      }
      const replace = confirm(`Import ${parsed.transactions.length} transactions and ${parsed.accounts.length + parsed.categories.length + parsed.assets.length} master rows from Excel? Choose OK to replace local data, or Cancel to merge into existing data.`);
      if (replace) {
        await Promise.all(STORE_NAMES.map(clearStore));
      }
      await loadAll();
      if (replace && !parsed.accounts.length && !parsed.categories.length && !parsed.assets.length) {
        await seedIfEmpty();
        await loadAll();
      }
      await importParsedFinanceData(parsed);
      await loadAll();
      render();
      toast(replace ? 'Excel import restored data' : 'Excel import merged data');
    } catch (error) {
      console.error(error);
      toast('Excel import failed. Use an app export or a workbook with Transactions/Records sheet.');
    } finally {
      event.target.value = '';
    }
  }

  async function importParsedFinanceData(parsed) {
    for (const account of parsed.accounts) await putLocal('accounts', account);
    for (const category of parsed.categories) await putLocal('categories', category);
    for (const asset of parsed.assets) await putLocal('assets', asset);
    await loadAll();

    const importContext = {
      accountByKey: new Map(state.data.accounts.map(a => [norm(`${a.name}|${a.accountType}`), a])),
      accountById: new Map(state.data.accounts.map(a => [String(a.id), a])),
      categoryByKey: new Map(state.data.categories.map(c => [norm(`${c.name}|${c.transactionType}`), c])),
      categoryById: new Map(state.data.categories.map(c => [String(c.id), c])),
      assetByKey: new Map(state.data.assets.map(a => [norm(`${a.name}|${assetInvestmentType(a)}`), a])),
      assetById: new Map(state.data.assets.map(a => [String(a.id), a]))
    };

    for (const raw of parsed.transactions) {
      const type = normalizeTransactionType(raw.type);
      const amount = num(raw.amount);
      const date = normalizeDate(raw.date);
      if (!type || !amount || !date) continue;

      const category = await resolveCategory(importContext, raw.categoryName, type, raw.categoryId);
      const fromAccount = await resolveAccount(importContext, raw.fromAccountName, accountTypeFromTransaction(type, 'from'), raw.fromAccountId);
      const toAccount = await resolveAccount(importContext, raw.toAccountName, accountTypeFromTransaction(type, 'to'), raw.toAccountId);
      const investmentType = raw.investmentType || investmentTypeFromCategory(raw.categoryName) || '';
      const asset = await resolveAsset(importContext, raw.assetName, investmentType, raw.assetId);
      const now = new Date().toISOString();
      await putLocal('transactions', {
        id: raw.id || newId('txn'),
        date,
        type,
        amount,
        categoryId: category?.id || defaultCategoryFor(type)?.id || '',
        fromAccountId: fromAccount?.id || '',
        toAccountId: toAccount?.id || '',
        investmentType,
        assetId: asset?.id || '',
        maturityDate: normalizeDate(raw.maturityDate) || '',
        notes: raw.notes || '',
        createdAt: raw.createdAt || now,
        updatedAt: now
      });
    }
  }

  function parseFinanceWorkbook(workbook) {
    const sheets = workbook.sheets;
    const appRows = objectsFromSheet(sheets.Transactions || sheets.transactions || []);
    if (appRows.length) return parseAppExportWorkbook(sheets, appRows);
    const legacyRows = objectsFromSheet(sheets.Records || sheets.records || []);
    if (legacyRows.length) return parseLegacyRecordsWorkbook(sheets, legacyRows);
    const fallbackName = Object.keys(sheets).find(name => objectsFromSheet(sheets[name]).some(row => val(row, ['date']) && val(row, ['amount'])));
    if (fallbackName) return parseAppExportWorkbook(sheets, objectsFromSheet(sheets[fallbackName]));
    return { source: 'unknown', accounts: [], categories: [], assets: [], transactions: [] };
  }

  function parseAppExportWorkbook(sheets, rows) {
    const accounts = objectsFromSheet(sheets.Accounts || sheets.accounts || [])
      .filter(row => val(row, ['account_name', 'account']) || val(row, ['account_id']))
      .map(row => ({
        id: textVal(row, ['account_id']) || newId('acc'),
        name: textVal(row, ['account_name', 'account']) || textVal(row, ['name']) || 'Unnamed account',
        accountType: normalizeAccountType(textVal(row, ['account_type', 'type'])) || 'Savings',
        openingBalance: num(val(row, ['opening_balance', 'opening'])),
        notes: textVal(row, ['comments', 'notes', 'details'])
      }));
    const categories = objectsFromSheet(sheets.Categories || sheets.categories || [])
      .filter(row => val(row, ['category_name', 'category']) || val(row, ['category_id']))
      .map(row => ({
        id: textVal(row, ['category_id']) || newId('cat'),
        name: textVal(row, ['category_name', 'category']) || 'Unnamed category',
        transactionType: normalizeTransactionType(textVal(row, ['transaction_type', 'type'])) || 'Expense',
        includeInReports: truthy(val(row, ['include_in_reports', 'include'])) !== false,
        monthlyBudget: num(val(row, ['monthly_budget', 'budget']))
      }));
    const assets = objectsFromSheet(sheets.Investment_Assets || sheets.investment_assets || sheets.Assets || [])
      .filter(row => val(row, ['asset_name', 'investment_asset', 'asset']) || val(row, ['asset_id']))
      .map(row => ({
        id: textVal(row, ['asset_id']) || newId('asset'),
        name: textVal(row, ['asset_name', 'investment_asset', 'asset']) || 'Unnamed asset',
        investmentType: normalizeInvestmentType(textVal(row, ['investment_type'])) || 'Other Investments',
        openingAmount: num(val(row, ['opening_amount', 'opening_invested_amount', 'opening'])),
        currentValue: num(val(row, ['manual_current_value', 'current_value', 'estimated_current_value'])),
        maturityDate: normalizeDate(val(row, ['maturity_date', 'maturity'])) || '',
        fdBankAccountId: textVal(row, ['fd_linked_bank_id', 'fd_bank_account_id', 'linked_bank_id']) || resolveAccountIdByNameForImport(textVal(row, ['fd_linked_bank', 'fd_bank', 'bank'])),
        fdAccountNumber: textVal(row, ['fd_account_number', 'account_number', 'fd_account_no']),
        fdPrincipal: num(val(row, ['fd_principal', 'principal'])),
        fdMaturityAmount: num(val(row, ['fd_maturity_amount', 'maturity_amount'])),
        fdInterestAmount: num(val(row, ['fd_interest_amount', 'interest_amount'])),
        notes: textVal(row, ['comments', 'notes', 'details'])
      }));
    const transactions = rows.map(row => ({
      id: textVal(row, ['transaction_id', 'id']),
      date: val(row, ['date']),
      type: textVal(row, ['transaction_type', 'type']),
      amount: val(row, ['amount']),
      categoryId: textVal(row, ['category_id']),
      categoryName: textVal(row, ['category', 'category_name']),
      fromAccountId: textVal(row, ['from_account_id']),
      fromAccountName: textVal(row, ['from_account', 'paid_from']),
      toAccountId: textVal(row, ['to_account_id']),
      toAccountName: textVal(row, ['to_account', 'received_in']),
      investmentType: normalizeInvestmentType(textVal(row, ['investment_type'])),
      assetId: textVal(row, ['asset_id']),
      assetName: textVal(row, ['investment_asset', 'asset', 'asset_name']),
      maturityDate: val(row, ['maturity_date']),
      notes: textVal(row, ['notes', 'comments', 'details']),
      createdAt: textVal(row, ['created_at']),
      updatedAt: textVal(row, ['updated_at'])
    })).filter(t => val(t, ['date']) || val(t, ['amount']) || t.type);
    return { source: 'app-export', accounts, categories, assets, transactions };
  }

  function parseLegacyRecordsWorkbook(_sheets, rows) {
    const parsed = { source: 'legacy-records', accounts: [], categories: [], assets: [], transactions: [] };
    const accountMap = new Map();
    const categoryMap = new Map();
    const assetMap = new Map();
    const addAccount = (name, type) => {
      const cleanName = String(name || '').trim();
      if (!cleanName) return null;
      const accountType = normalizeAccountType(type) || 'Savings';
      const key = norm(`${cleanName}|${accountType}`);
      if (!accountMap.has(key)) {
        accountMap.set(key, { id: slug(`acc-${cleanName}-${accountType}`) || newId('acc'), name: cleanName, accountType, openingBalance: 0, notes: '' });
      }
      return accountMap.get(key);
    };
    const addCategory = (name, type, include = true) => {
      const cleanName = String(name || '').trim();
      if (!cleanName) return null;
      const txType = normalizeTransactionType(type) || 'Expense';
      const key = norm(`${cleanName}|${txType}`);
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { id: slug(`cat-${txType}-${cleanName}`) || newId('cat'), name: cleanName, transactionType: txType, includeInReports: include, monthlyBudget: 0 });
      }
      return categoryMap.get(key);
    };
    const addAsset = (name, type) => {
      const cleanName = String(name || '').trim();
      if (!cleanName) return null;
      const investmentType = normalizeInvestmentType(type) || 'Other Investments';
      const key = norm(`${cleanName}|${investmentType}`);
      if (!assetMap.has(key)) {
        assetMap.set(key, { id: slug(`asset-${investmentType}-${cleanName}`) || newId('asset'), name: cleanName, investmentType, openingAmount: 0, currentValue: 0, maturityDate: '', fdBankAccountId: investmentType === 'Fixed Deposits' ? defaultFdBankAccountIdForName(cleanName) : '', fdAccountNumber: '', fdPrincipal: 0, fdMaturityAmount: 0, fdInterestAmount: 0, notes: '' });
      }
      return assetMap.get(key);
    };

    for (const row of rows) {
      const rawType = textVal(row, ['category']);
      const amount = val(row, ['amount']);
      const date = val(row, ['date']);
      const type = normalizeTransactionType(rawType);
      if (!type || !num(amount) || !normalizeDate(date)) continue;
      const subcategory = textVal(row, ['subcategory', 'sub_category']);
      const source = textVal(row, ['source']);
      const sourceCategory = textVal(row, ['source_category', 'source category']);
      const sourceAccountType = normalizeLegacySourceType(source);
      const sourceAccount = addAccount(sourceCategory || source, sourceAccountType);
      let transactionType = type;
      let fromAccount = null;
      let toAccount = null;
      let asset = null;
      let investmentType = '';
      let includeCategory = true;

      if (type === 'Income') {
        toAccount = sourceAccount;
      } else if (type === 'Expense') {
        fromAccount = sourceAccount;
        if (norm(subcategory).includes('creditcardbill') || norm(subcategory).includes('creditcardpayment')) {
          includeCategory = false;
          const cardName = findCreditCardNameInText(`${textVal(row, ['comments'])} ${textVal(row, ['details'])} ${sourceCategory}`);
          const card = cardName ? addAccount(cardName, 'Credit Card') : null;
          if (card) {
            transactionType = 'Credit Card Payment';
            toAccount = card;
          }
        }
      } else if (type === 'Investment') {
        fromAccount = sourceAccount;
        investmentType = normalizeInvestmentType(subcategory) || investmentTypeFromLegacyRow(row);
        const assetName = legacyAssetName(row, investmentType);
        asset = addAsset(assetName, investmentType);
      }

      const category = addCategory(subcategory || transactionType, transactionType, includeCategory);
      parsed.transactions.push({
        id: newId('txn'),
        date,
        type: transactionType,
        amount,
        categoryId: category?.id || '',
        categoryName: category?.name || subcategory,
        fromAccountId: fromAccount?.id || '',
        fromAccountName: fromAccount?.name || '',
        toAccountId: toAccount?.id || '',
        toAccountName: toAccount?.name || '',
        investmentType,
        assetId: asset?.id || '',
        assetName: asset?.name || '',
        maturityDate: val(row, ['maturity_date', 'maturity date']),
        notes: [textVal(row, ['comments']), textVal(row, ['details'])].filter(Boolean).join(' | ')
      });
    }
    parsed.accounts = [...accountMap.values()];
    parsed.categories = [...categoryMap.values()];
    parsed.assets = [...assetMap.values()];
    return parsed;
  }

  async function resolveAccount(ctx, name, preferredType, id) {
    if (id && ctx.accountById.has(String(id))) return ctx.accountById.get(String(id));
    const cleanName = String(name || '').trim();
    if (!cleanName) return null;
    const accountType = normalizeAccountType(preferredType) || guessAccountType(cleanName) || 'Savings';
    const key = norm(`${cleanName}|${accountType}`);
    if (ctx.accountByKey.has(key)) return ctx.accountByKey.get(key);
    const account = { id: id || newId('acc'), name: cleanName, accountType, openingBalance: 0, notes: '' };
    await putLocal('accounts', account);
    ctx.accountByKey.set(key, account);
    ctx.accountById.set(String(account.id), account);
    return account;
  }

  async function resolveCategory(ctx, name, type, id) {
    if (id && ctx.categoryById.has(String(id))) return ctx.categoryById.get(String(id));
    const cleanName = String(name || '').trim();
    if (!cleanName || ['Transfer', 'Credit Card Payment'].includes(type)) return defaultCategoryFor(type);
    const key = norm(`${cleanName}|${type}`);
    if (ctx.categoryByKey.has(key)) return ctx.categoryByKey.get(key);
    const category = { id: id || newId('cat'), name: cleanName, transactionType: type, includeInReports: true, monthlyBudget: 0 };
    await putLocal('categories', category);
    ctx.categoryByKey.set(key, category);
    ctx.categoryById.set(String(category.id), category);
    return category;
  }

  async function resolveAsset(ctx, name, type, id) {
    if (id && ctx.assetById.has(String(id))) return ctx.assetById.get(String(id));
    const cleanName = String(name || '').trim();
    if (!cleanName || !type) return null;
    const key = norm(`${cleanName}|${type}`);
    if (ctx.assetByKey.has(key)) return ctx.assetByKey.get(key);
    const asset = { id: id || newId('asset'), name: cleanName, investmentType: type, openingAmount: 0, currentValue: 0, maturityDate: '', fdBankAccountId: type === 'Fixed Deposits' ? defaultFdBankAccountIdForName(cleanName) : '', fdAccountNumber: '', fdPrincipal: 0, fdMaturityAmount: 0, fdInterestAmount: 0, notes: '' };
    await putLocal('assets', asset);
    ctx.assetByKey.set(key, asset);
    ctx.assetById.set(String(asset.id), asset);
    return asset;
  }

  async function readXlsxWorkbook(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const entries = await unzipXlsxEntries(bytes);
    const text = path => {
      const data = entries.get(path) || entries.get(path.replace(/^xl\//, ''));
      return data ? new TextDecoder().decode(data) : '';
    };
    const workbookXml = text('xl/workbook.xml');
    const relsXml = text('xl/_rels/workbook.xml.rels');
    if (!workbookXml || !relsXml) throw new Error('Invalid workbook');
    const workbookDoc = parseXml(workbookXml);
    const relsDoc = parseXml(relsXml);
    const relTargets = new Map([...relsDoc.getElementsByTagName('Relationship')].map(rel => {
      const target = rel.getAttribute('Target') || '';
      const resolved = target.startsWith('/') ? normalizeXlsxPath(target) : normalizeXlsxPath('xl/' + target);
      return [rel.getAttribute('Id'), resolved];
    }));
    const sharedStrings = readSharedStrings(text('xl/sharedStrings.xml'));
    const sheets = {};
    for (const node of workbookDoc.getElementsByTagName('sheet')) {
      const name = node.getAttribute('name') || 'Sheet';
      const relId = node.getAttribute('r:id');
      const target = relTargets.get(relId);
      if (!target) continue;
      const worksheetXml = text(target);
      if (!worksheetXml) continue;
      sheets[name] = readWorksheetRows(worksheetXml, sharedStrings);
    }
    return { sheets };
  }

  async function unzipXlsxEntries(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Zip directory not found');
    const count = view.getUint16(eocd + 10, true);
    const cdOffset = view.getUint32(eocd + 16, true);
    const entries = new Map();
    let ptr = cdOffset;
    for (let i = 0; i < count; i++) {
      if (view.getUint32(ptr, true) !== 0x02014b50) throw new Error('Invalid central directory');
      const method = view.getUint16(ptr + 10, true);
      const compressedSize = view.getUint32(ptr + 20, true);
      const filenameLength = view.getUint16(ptr + 28, true);
      const extraLength = view.getUint16(ptr + 30, true);
      const commentLength = view.getUint16(ptr + 32, true);
      const localOffset = view.getUint32(ptr + 42, true);
      const filename = new TextDecoder().decode(bytes.slice(ptr + 46, ptr + 46 + filenameLength));
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);
      let data;
      if (method === 0) {
        data = compressed;
      } else if (method === 8) {
        if (!('DecompressionStream' in window)) throw new Error('This browser cannot read compressed Excel files. Use Android Chrome/Edge or import JSON instead.');
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        data = new Uint8Array(await new Response(stream).arrayBuffer());
      } else {
        throw new Error(`Unsupported zip compression method ${method}`);
      }
      entries.set(filename, data);
      ptr += 46 + filenameLength + extraLength + commentLength;
    }
    return entries;
  }

  function parseXml(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Invalid XML');
    return doc;
  }

  function readSharedStrings(xmlText) {
    if (!xmlText) return [];
    const doc = parseXml(xmlText);
    return [...doc.getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent || '').join(''));
  }

  function readWorksheetRows(xmlText, sharedStrings) {
    const doc = parseXml(xmlText);
    const rows = [];
    for (const rowNode of doc.getElementsByTagName('row')) {
      const rowNumber = Number(rowNode.getAttribute('r') || rows.length + 1);
      const row = [];
      for (const cell of rowNode.getElementsByTagName('c')) {
        const ref = cell.getAttribute('r') || '';
        const col = columnIndex(ref.replace(/[0-9]/g, ''));
        row[col] = readCellValue(cell, sharedStrings);
      }
      rows[rowNumber - 1] = row;
    }
    return rows;
  }

  function readCellValue(cell, sharedStrings) {
    const type = cell.getAttribute('t');
    if (type === 'inlineStr') return [...cell.getElementsByTagName('t')].map(t => t.textContent || '').join('');
    const valueNode = cell.getElementsByTagName('v')[0];
    const raw = valueNode ? valueNode.textContent : '';
    if (type === 's') return sharedStrings[Number(raw)] || '';
    if (type === 'b') return raw === '1';
    if (raw === '') return '';
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }

  function objectsFromSheet(rows) {
    const headerIndex = rows.findIndex(row => (row || []).filter(value => String(value ?? '').trim()).length >= 2);
    if (headerIndex < 0) return [];
    const headers = (rows[headerIndex] || []).map(header => normHeader(header));
    return rows.slice(headerIndex + 1).map(row => {
      const object = {};
      headers.forEach((header, index) => {
        if (header) object[header] = row?.[index] ?? '';
      });
      return object;
    }).filter(row => Object.values(row).some(value => String(value ?? '').trim() !== ''));
  }

  function val(row, aliases) {
    for (const alias of aliases) {
      const key = normHeader(alias);
      if (row && Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];
    }
    return '';
  }

  function textVal(row, aliases) {
    return String(val(row, aliases) ?? '').trim();
  }

  function normalizeDate(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number' && Number.isFinite(value)) return excelSerialDateToISO(value);
    const text = String(value).trim();
    if (!text) return '';
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const slash = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (slash) {
      let [, d, m, y] = slash;
      if (y.length === 2) y = Number(y) > 50 ? `19${y}` : `20${y}`;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return '';
  }

  function excelSerialDateToISO(value) {
    const serial = Math.floor(value);
    const ms = (serial - 25569) * 86400 * 1000;
    return new Date(ms).toISOString().slice(0, 10);
  }

  function normalizeTransactionType(value) {
    const key = norm(value);
    if (!key) return '';
    if (key.includes('creditcardpayment') || key.includes('cardpayment')) return 'Credit Card Payment';
    if (key.includes('creditcardbill')) return 'Credit Card Payment';
    if (key.includes('transfer')) return 'Transfer';
    if (key.includes('income') || key.includes('salary')) return 'Income';
    if (key.includes('investment') || key.includes('invest')) return 'Investment';
    if (key.includes('expense') || key.includes('spend')) return 'Expense';
    return value;
  }

  function normalizeAccountType(value) {
    const key = norm(value);
    if (!key) return '';
    if (key.includes('creditcard') || key.includes('card')) return 'Credit Card';
    if (key.includes('cash')) return 'Cash';
    if (key.includes('company') || key.includes('reimbursement')) return 'Company';
    if (key.includes('saving') || key.includes('bank')) return 'Savings';
    return value;
  }

  function normalizeInvestmentType(value) {
    const key = norm(value);
    if (!key) return '';
    if (key.includes('mutual') || key === 'mf') return 'Mutual Funds';
    if (key.includes('stock') || key.includes('equity')) return 'Stocks';
    if (key.includes('fixeddeposit') || key === 'fd') return 'Fixed Deposits';
    if (key.includes('other') || key.includes('nsc') || key.includes('sgb') || key.includes('nps') || key.includes('ppf') || key.includes('insurance')) return 'Other Investments';
    return value;
  }

  function normalizeLegacySourceType(value) {
    const key = norm(value);
    if (key.includes('creditcard')) return 'Credit Card';
    if (key.includes('cash')) return 'Cash';
    if (key.includes('company')) return 'Company';
    return 'Savings';
  }

  function accountTypeFromTransaction(type, side) {
    if (type === 'Expense' && side === 'from') return '';
    if (type === 'Income' && side === 'to') return 'Savings';
    if (type === 'Investment' && side === 'from') return 'Savings';
    if (type === 'Transfer') return 'Savings';
    if (type === 'Credit Card Payment' && side === 'to') return 'Credit Card';
    return 'Savings';
  }

  function guessAccountType(name) {
    const key = norm(name);
    if (key.includes('card') || key.includes('regalia') || key.includes('swiggy') || key.includes('amazonpay') || key.includes('scapia')) return 'Credit Card';
    if (key.includes('cash')) return 'Cash';
    if (key.includes('company') || key.includes('reimbursement')) return 'Company';
    return 'Savings';
  }

  function investmentTypeFromCategory(name) {
    return normalizeInvestmentType(name);
  }

  function investmentTypeFromLegacyRow(row) {
    if (textVal(row, ['fund_type'])) return 'Mutual Funds';
    if (textVal(row, ['stock'])) return 'Stocks';
    if (textVal(row, ['fd_bank'])) return 'Fixed Deposits';
    if (textVal(row, ['other_investment_instrument'])) return 'Other Investments';
    return normalizeInvestmentType(textVal(row, ['subcategory'])) || 'Other Investments';
  }

  function legacyAssetName(row, investmentType) {
    if (investmentType === 'Mutual Funds') return textVal(row, ['fund_type']);
    if (investmentType === 'Stocks') return textVal(row, ['stock']);
    if (investmentType === 'Fixed Deposits') return textVal(row, ['fd_bank']);
    return textVal(row, ['other_investment_instrument']) || textVal(row, ['details']);
  }

  function findCreditCardNameInText(text) {
    const key = norm(text);
    const card = state.data.accounts.find(a => a.accountType === 'Credit Card' && key.includes(norm(a.name)));
    return card?.name || '';
  }

  function truthy(value) {
    const key = norm(value);
    if (['false', 'no', '0', 'n'].includes(key)) return false;
    if (['true', 'yes', '1', 'y'].includes(key)) return true;
    return Boolean(value);
  }

  function normHeader(value) {
    return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  function norm(value) {
    return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function safeSheetName(name) {
    return String(name).replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31) || 'Sheet';
  }

  function columnName(index) {
    let name = '';
    while (index > 0) {
      const mod = (index - 1) % 26;
      name = String.fromCharCode(65 + mod) + name;
      index = Math.floor((index - mod) / 26);
    }
    return name;
  }

  function columnIndex(name) {
    let index = 0;
    for (const char of String(name || '')) index = index * 26 + char.charCodeAt(0) - 64;
    return Math.max(0, index - 1);
  }

  function normalizeXlsxPath(path) {
    const parts = String(path || '').replace(/\\/g, '/').replace(/^\//, '').split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  function xml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function xmlAttr(value) {
    return xml(value).replace(/"/g, '&quot;');
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportJson() {
    await loadAll();
    const { syncSecret, syncUrl, ...safeSettings } = state.data.settings || {};
    const backup = {
      app: 'Offline Finance Tracker',
      version: VERSION,
      exportedAt: new Date().toISOString(),
      note: 'Sync URL and sync key are intentionally omitted from backups. Re-enter them on each device.',
      data: { ...state.data, settings: safeSettings }
    };
    downloadFile(`finance-tracker-backup-${todayISO()}.json`, JSON.stringify(backup, null, 2), 'application/json');
    toast('Backup exported');
  }

  async function exportCsv() {
    await loadAll();
    const headers = ['date', 'type', 'amount', 'category', 'fromAccount', 'toAccount', 'investmentType', 'asset', 'maturityDate', 'notes'];
    const rows = state.data.transactions.map(t => [
      t.date,
      t.type,
      t.amount,
      categoryById(t.categoryId)?.name || '',
      accountById(t.fromAccountId)?.name || '',
      accountById(t.toAccountId)?.name || '',
      t.investmentType || '',
      assetById(t.assetId)?.name || '',
      t.maturityDate || '',
      t.notes || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
    downloadFile(`finance-transactions-${todayISO()}.csv`, csv, 'text/csv');
    toast('CSV exported');
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function syncConfigured() {
    return Boolean(String(state.data.settings.syncUrl || '').trim() && String(state.data.settings.syncSecret || '').trim());
  }

  async function saveSyncSettings(data) {
    const settings = {
      ...state.data.settings,
      id: 'default',
      syncUrl: String(data.syncUrl || '').trim(),
      syncSecret: String(data.syncSecret || '').trim(),
      deviceName: String(data.deviceName || '').trim() || state.data.settings.deviceName || guessDeviceName(),
      autoSync: data.autoSync === 'on'
    };
    await put('settings', { ...settings, syncPending: state.data.settings.syncPending || false });
    await loadAll();
    render();
    toast('Sync settings saved');
  }

  function scheduleAutoSync() {
    if (!syncConfigured() || !state.data.settings.autoSync || state.sync.busy || !navigator.onLine) return;
    clearTimeout(state.sync.timer);
    state.sync.timer = setTimeout(() => syncNow({ forceAll: false, quiet: true }), 900);
  }

  async function testSyncConnection() {
    try {
      if (!syncConfigured()) throw new Error('Add sync URL and sync key first');
      state.sync.busy = true;
      render();
      const result = await appsScriptRequest({ action: 'health' });
      state.sync.lastError = '';
      await put('settings', { ...state.data.settings, id: 'default', lastSyncStatus: `Connected to Google Sheet${result.spreadsheetName ? ': ' + result.spreadsheetName : ''}` });
      await loadAll();
      render();
      toast('Connection successful');
    } catch (error) {
      state.sync.lastError = error.message || String(error);
      render();
      toast('Connection failed');
    } finally {
      state.sync.busy = false;
      render();
    }
  }

  async function uploadAllLocalData() {
    if (!confirm('Upload all local data to the Google Sheet? Use this only for first sync or after restoring from backup.')) return;
    await syncNow({ forceAll: true });
  }

  async function pullOnlyFromCloud() {
    if (!confirm('Pull data from Google Sheet and merge it into this device? Newer cloud rows can overwrite older local rows.')) return;
    await syncNow({ pullOnly: true });
  }

  async function syncNow(options = {}) {
    const { forceAll = false, pullOnly = false, quiet = false } = options;
    if (!syncConfigured()) {
      if (!quiet) toast('Add sync URL and sync key first');
      return;
    }
    if (state.sync.busy) return;
    state.sync.busy = true;
    state.sync.lastError = '';
    if (!quiet) render();
    try {
      let pushed = 0;
      if (!pullOnly) pushed = await pushLocalChanges(forceAll);
      const pulled = await pullCloudData();
      const now = new Date().toISOString();
      await put('settings', {
        ...state.data.settings,
        id: 'default',
        lastSyncAt: now,
        lastSyncStatus: `Synced. Pushed ${pushed} row${pushed === 1 ? '' : 's'}, pulled ${pulled} row${pulled === 1 ? '' : 's'}.`,
        syncPending: false
      });
      await loadAll();
      if (!quiet || state.view === 'manage') render();
      if (!quiet) toast('Sync complete');
    } catch (error) {
      console.error(error);
      state.sync.lastError = error.message || String(error);
      await put('settings', { ...state.data.settings, id: 'default', lastSyncStatus: `Sync failed: ${state.sync.lastError}` });
      await loadAll();
      render();
      if (!quiet) toast('Sync failed');
    } finally {
      state.sync.busy = false;
      if (!quiet || state.view === 'manage') render();
    }
  }

  async function pushLocalChanges(forceAll = false) {
    const payload = await collectSyncPayload(forceAll);
    const total = countSyncRows(payload);
    if (!total && !forceAll) return 0;
    await appsScriptRequest({ action: 'push', data: payload, deviceId: state.data.settings.deviceId, deviceName: state.data.settings.deviceName });
    await markPayloadSynced(payload);
    return total;
  }

  async function pullCloudData() {
    const response = await appsScriptRequest({ action: 'pull', deviceId: state.data.settings.deviceId });
    const data = response.data || {};
    const count = await mergeRemoteData(data);
    return count;
  }

  async function collectSyncPayload(forceAll = false) {
    const [transactions, accounts, categories, assets, settingsRows] = await Promise.all([
      getAll('transactions'), getAll('accounts'), getAll('categories'), getAll('assets'), getAll('settings')
    ]);
    const settings = settingsRows.find(s => s.id === 'default') || state.data.settings;
    const pick = rows => rows.filter(row => forceAll || row.syncPending).map(row => sanitizeSyncRow(row));
    return {
      transactions: pick(transactions.map(normalizeTransactionRecord)),
      accounts: pick(accounts),
      categories: pick(categories),
      assets: pick(assets.map(normalizeAssetRecord)),
      settings: (forceAll || settings.syncPending) ? [sanitizeSettingsForSync(settings)] : []
    };
  }

  function sanitizeSyncRow(row) {
    const now = new Date().toISOString();
    return {
      ...row,
      createdAt: row.createdAt || row.updatedAt || now,
      updatedAt: row.updatedAt || now,
      deviceId: row.deviceId || state.data.settings.deviceId || '',
      isDeleted: Boolean(row.isDeleted || row.deletedAt),
      deletedAt: row.deletedAt || ''
    };
  }

  function sanitizeSettingsForSync(settings) {
    return sanitizeSyncRow({
      id: 'default',
      currency: settings.currency || DEFAULT_SETTINGS.currency,
      theme: settings.theme || DEFAULT_SETTINGS.theme,
      firstDayOfMonth: settings.firstDayOfMonth || DEFAULT_SETTINGS.firstDayOfMonth,
      trackingStartMonth: settings.trackingStartMonth || DEFAULT_SETTINGS.trackingStartMonth,
      goLiveDate: settings.goLiveDate || DEFAULT_SETTINGS.goLiveDate,
      excludedAverageMonths: settings.excludedAverageMonths || '',
      defaultExpenseCategoryId: settings.defaultExpenseCategoryId || '',
      defaultIncomeCategoryId: settings.defaultIncomeCategoryId || '',
      defaultInvestmentCategoryId: settings.defaultInvestmentCategoryId || '',
      defaultSavingsAccountId: settings.defaultSavingsAccountId || '',
      defaultCashAccountId: settings.defaultCashAccountId || '',
      defaultCreditCardAccountId: settings.defaultCreditCardAccountId || '',
      defaultCompanyAccountId: settings.defaultCompanyAccountId || '',
      defaultMutualFundAssetId: settings.defaultMutualFundAssetId || '',
      defaultStockAssetId: settings.defaultStockAssetId || '',
      defaultFdAssetId: settings.defaultFdAssetId || '',
      defaultOtherInvestmentAssetId: settings.defaultOtherInvestmentAssetId || '',
      favoriteReportIds: settings.favoriteReportIds || '',
      reportDescriptions: settings.reportDescriptions || '{}',
      dashboardWidgetOrder: settings.dashboardWidgetOrder || '',
      reportGroupOrder: settings.reportGroupOrder || '',
      reportPillOrder: settings.reportPillOrder || '{}',
      inactiveAccountIds: settings.inactiveAccountIds || '',
      inactiveCategoryIds: settings.inactiveCategoryIds || '',
      inactiveAssetIds: settings.inactiveAssetIds || '',
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      syncPending: settings.syncPending
    });
  }

  function countSyncRows(payload) {
    return ['transactions', 'accounts', 'categories', 'assets', 'settings']
      .reduce((total, key) => total + (payload[key]?.length || 0), 0);
  }

  async function markPayloadSynced(payload) {
    await Promise.all([
      markStoreItemsSynced('transactions', (payload.transactions || []).map(row => row.id)),
      markStoreItemsSynced('accounts', (payload.accounts || []).map(row => row.id)),
      markStoreItemsSynced('categories', (payload.categories || []).map(row => row.id)),
      markStoreItemsSynced('assets', (payload.assets || []).map(row => row.id))
    ]);
    if ((payload.settings || []).length) {
      await put('settings', { ...state.data.settings, syncPending: false });
    }
  }


  function createEmptyAliasMaps() {
    return { accounts: new Map(), categories: new Map(), assets: new Map() };
  }

  function naturalKeyMapForStore(storeName, rows = []) {
    const map = new Map();
    for (const row of rows) {
      if (!row || row.isDeleted || row.deletedAt) continue;
      const key = masterNaturalKey(storeName, row);
      if (!key) continue;
      const existing = map.get(key);
      map.set(key, existing ? choosePreferredMasterRow(storeName, [existing, row], []) : row);
    }
    return map;
  }

  function masterNaturalKey(storeName, row = {}) {
    if (!row) return '';
    if (storeName === 'accounts') {
      const name = norm(row.name);
      const type = normalizeAccountType(row.accountType) || row.accountType || '';
      return name ? `${norm(type)}::${name}` : '';
    }
    if (storeName === 'categories') {
      const name = norm(row.name);
      const type = normalizeTransactionType(row.transactionType) || row.transactionType || '';
      return name ? `${norm(type)}::${name}` : '';
    }
    if (storeName === 'assets') {
      const name = norm(row.name);
      const type = assetInvestmentType(row) || row.investmentType || '';
      return name ? `${norm(type)}::${name}` : '';
    }
    return '';
  }

  function mergeMasterRows(storeName, base = {}, incoming = {}) {
    const merged = { ...base };
    const copyIfFilled = keys => {
      for (const key of keys) {
        const current = merged[key];
        const value = incoming[key];
        const currentEmpty = current === undefined || current === null || current === '' || current === 0 || current === '0';
        const valueFilled = !(value === undefined || value === null || value === '' || value === 0 || value === '0');
        if (currentEmpty && valueFilled) merged[key] = value;
      }
    };
    if (storeName === 'accounts') copyIfFilled(['name', 'accountType', 'openingBalance', 'creditLimit', 'notes', 'comments']);
    if (storeName === 'categories') copyIfFilled(['name', 'transactionType', 'monthlyBudget', 'notes', 'comments']);
    if (storeName === 'assets') copyIfFilled(['name', 'investmentType', 'openingAmount', 'currentValue', 'maturityDate', 'fdBankAccountId', 'fdAccountNumber', 'fdPrincipal', 'fdMaturityAmount', 'fdInterestAmount', 'notes', 'comments']);
    if (incoming.includeInReports === false || incoming.includeInReports === true) merged.includeInReports = incoming.includeInReports;
    merged.createdAt = merged.createdAt || incoming.createdAt;
    merged.updatedAt = newerTimestamp(merged.updatedAt, incoming.updatedAt);
    merged.deletedAt = '';
    merged.isDeleted = false;
    return storeName === 'assets' ? normalizeAssetRecord(merged) : merged;
  }

  function newerTimestamp(a, b) {
    return timeValue(b) > timeValue(a) ? b : a;
  }

  function choosePreferredMasterRow(storeName, rows = [], transactions = [], settings = state.data.settings || {}) {
    const scores = new Map();
    for (const row of rows) scores.set(String(row.id), masterRowScore(storeName, row, transactions, settings));
    return [...rows].sort((a, b) => (scores.get(String(b.id)) || 0) - (scores.get(String(a.id)) || 0) || timeValue(b.updatedAt || b.createdAt) - timeValue(a.updatedAt || a.createdAt))[0];
  }

  function masterRowScore(storeName, row = {}, transactions = [], settings = state.data.settings || {}) {
    const id = String(row.id || '');
    let score = 0;
    for (const t of transactions) {
      if (storeName === 'accounts' && (String(t.fromAccountId || '') === id || String(t.toAccountId || '') === id)) score += 100;
      if (storeName === 'categories' && String(t.categoryId || '') === id) score += 100;
      if (storeName === 'assets' && String(t.assetId || '') === id) score += 100;
    }
    for (const value of Object.values(settings || {})) {
      if (String(value || '') === id) score += 50;
    }
    if (storeName === 'accounts') score += Math.abs(num(row.openingBalance)) ? 25 : 0;
    if (storeName === 'categories') score += num(row.monthlyBudget) ? 25 : 0;
    if (storeName === 'assets') score += (num(row.currentValue) || num(row.openingAmount) || num(row.fdPrincipal) || num(row.fdMaturityAmount)) ? 25 : 0;
    if (row.notes || row.comments) score += 5;
    if (row.syncPending) score += 2;
    return score;
  }

  async function consolidateDuplicateMasterData() {
    const [transactions, accounts, categories, assets, settingsRows] = await Promise.all([
      getAll('transactions'), getAll('accounts'), getAll('categories'), getAll('assets'), getAll('settings')
    ]);
    const settings = settingsRows.find(s => s.id === 'default') || state.data.settings || DEFAULT_SETTINGS;
    const aliasMaps = createEmptyAliasMaps();
    let changed = 0;
    changed += await consolidateMasterStore('accounts', accounts, transactions, settings, aliasMaps.accounts);
    changed += await consolidateMasterStore('categories', categories, transactions, settings, aliasMaps.categories);
    changed += await consolidateMasterStore('assets', assets.map(normalizeAssetRecord), transactions, settings, aliasMaps.assets);
    changed += await rewriteLocalReferencesForAliases(aliasMaps);
    return changed;
  }

  async function consolidateMasterStore(storeName, rows = [], transactions = [], settings = {}, aliasMap = new Map()) {
    const groups = new Map();
    for (const row of rows.filter(notDeleted)) {
      const key = masterNaturalKey(storeName, row);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    let changed = 0;
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      const canonical = choosePreferredMasterRow(storeName, group, transactions, settings);
      let merged = canonical;
      for (const row of group) {
        if (String(row.id) === String(canonical.id)) continue;
        aliasMap.set(String(row.id), String(canonical.id));
        merged = mergeMasterRows(storeName, merged, row);
        await put(storeName, markDeleted(row));
        changed += 1;
      }
      await put(storeName, withLocalChange({ ...merged, id: canonical.id, isDeleted: false, deletedAt: '' }));
      changed += 1;
    }
    return changed;
  }

  async function rewriteLocalReferencesForAliases(aliasMaps) {
    let changed = 0;
    const transactions = await getAll('transactions');
    for (const transaction of transactions) {
      const rewritten = applyMasterIdAliasesToTransaction(transaction, aliasMaps);
      if (rewritten.fromAccountId !== transaction.fromAccountId || rewritten.toAccountId !== transaction.toAccountId || rewritten.categoryId !== transaction.categoryId || rewritten.assetId !== transaction.assetId) {
        await put('transactions', withLocalChange({ ...transaction, ...rewritten }));
        changed += 1;
      }
    }
    const settingsRows = await getAll('settings');
    const settings = settingsRows.find(s => s.id === 'default');
    if (settings) {
      const rewrittenSettings = applyMasterIdAliasesToSettings(settings, aliasMaps);
      if (JSON.stringify(settings) !== JSON.stringify(rewrittenSettings)) {
        await put('settings', withLocalChange({ ...settings, ...rewrittenSettings, id: 'default' }));
        changed += 1;
      }
    }
    return changed;
  }

  function applyMasterIdAliasesToTransaction(transaction = {}, aliasMaps = createEmptyAliasMaps()) {
    const out = { ...transaction };
    out.fromAccountId = aliasMaps.accounts.get(String(out.fromAccountId || '')) || out.fromAccountId || '';
    out.toAccountId = aliasMaps.accounts.get(String(out.toAccountId || '')) || out.toAccountId || '';
    out.categoryId = aliasMaps.categories.get(String(out.categoryId || '')) || out.categoryId || '';
    out.assetId = aliasMaps.assets.get(String(out.assetId || '')) || out.assetId || '';
    return out;
  }

  function applyMasterIdAliasesToSettings(settings = {}, aliasMaps = createEmptyAliasMaps()) {
    const out = { ...settings };
    const replace = (map, value) => map.get(String(value || '')) || value || '';
    out.defaultSavingsAccountId = replace(aliasMaps.accounts, out.defaultSavingsAccountId);
    out.defaultCashAccountId = replace(aliasMaps.accounts, out.defaultCashAccountId);
    out.defaultCreditCardAccountId = replace(aliasMaps.accounts, out.defaultCreditCardAccountId);
    out.defaultCompanyAccountId = replace(aliasMaps.accounts, out.defaultCompanyAccountId);
    out.defaultExpenseCategoryId = replace(aliasMaps.categories, out.defaultExpenseCategoryId);
    out.defaultIncomeCategoryId = replace(aliasMaps.categories, out.defaultIncomeCategoryId);
    out.defaultInvestmentCategoryId = replace(aliasMaps.categories, out.defaultInvestmentCategoryId);
    out.defaultMutualFundAssetId = replace(aliasMaps.assets, out.defaultMutualFundAssetId);
    out.defaultStockAssetId = replace(aliasMaps.assets, out.defaultStockAssetId);
    out.defaultFdAssetId = replace(aliasMaps.assets, out.defaultFdAssetId);
    out.defaultOtherInvestmentAssetId = replace(aliasMaps.assets, out.defaultOtherInvestmentAssetId);
    out.inactiveAccountIds = replaceIdList(out.inactiveAccountIds, aliasMaps.accounts);
    out.inactiveCategoryIds = replaceIdList(out.inactiveCategoryIds, aliasMaps.categories);
    out.inactiveAssetIds = replaceIdList(out.inactiveAssetIds, aliasMaps.assets);
    return out;
  }

  function replaceIdList(value = '', map = new Map()) {
    const next = [];
    for (const raw of String(value || '').split(',').map(x => x.trim()).filter(Boolean)) {
      const replacement = map.get(String(raw)) || raw;
      if (replacement && !next.includes(replacement)) next.push(replacement);
    }
    return next.join(',');
  }

  async function mergeRemoteData(data) {
    const aliasMaps = createEmptyAliasMaps();
    let count = 0;

    // Merge master data first so transactions pulled from Google can be pointed
    // at the already-existing local master rows instead of creating duplicate
    // categories/accounts/assets with different IDs.
    count += await mergeRemoteStore('accounts', data.accounts || [], aliasMaps);
    count += await mergeRemoteStore('categories', data.categories || [], aliasMaps);
    count += await mergeRemoteStore('assets', data.assets || [], aliasMaps);

    const incomingTransactions = (data.transactions || [])
      .map(row => applyMasterIdAliasesToTransaction(row, aliasMaps));
    count += await mergeRemoteStore('transactions', incomingTransactions, aliasMaps);

    if ((data.settings || []).length) count += await mergeRemoteSettings(applyMasterIdAliasesToSettings(data.settings[0], aliasMaps));
    count += await consolidateDuplicateMasterData();
    await loadAll();
    return count;
  }

  async function mergeRemoteStore(storeName, rows, aliasMaps = createEmptyAliasMaps()) {
    if (!rows.length) return 0;
    const local = await getAll(storeName);
    const byId = new Map(local.map(row => [String(row.id), row]));
    const isMasterStore = ['accounts', 'categories', 'assets'].includes(storeName);
    const byNaturalKey = isMasterStore ? naturalKeyMapForStore(storeName, local) : new Map();
    let count = 0;

    for (const raw of rows) {
      if (!raw || !raw.id) continue;
      const incoming = withRemoteChange(normalizeRemoteRow(storeName, raw));
      const incomingId = String(incoming.id);

      if (isMasterStore) {
        const key = masterNaturalKey(storeName, incoming);
        const sameKeyLocal = key ? byNaturalKey.get(key) : null;
        const sameIdLocal = byId.get(incomingId);

        // If Google has the same visible master value under a different ID,
        // keep the local/canonical ID and remember the remote ID as an alias.
        // This prevents duplicated dropdown categories after first phone sync.
        if (sameKeyLocal && String(sameKeyLocal.id) !== incomingId) {
          aliasMaps[storeName].set(incomingId, String(sameKeyLocal.id));
          if (!incoming.isDeleted && remoteIsNewer(incoming, sameKeyLocal)) {
            const merged = mergeMasterRows(storeName, sameKeyLocal, incoming);
            await put(storeName, { ...merged, id: sameKeyLocal.id, syncPending: false });
            byId.set(String(sameKeyLocal.id), { ...merged, id: sameKeyLocal.id });
            byNaturalKey.set(key, { ...merged, id: sameKeyLocal.id });
            count += 1;
          }
          continue;
        }

        if (!sameIdLocal || remoteIsNewer(incoming, sameIdLocal)) {
          await put(storeName, incoming);
          byId.set(incomingId, incoming);
          if (key) byNaturalKey.set(key, incoming);
          count += 1;
        }
        continue;
      }

      const existing = byId.get(incomingId);
      if (!existing || remoteIsNewer(incoming, existing)) {
        await put(storeName, incoming);
        count += 1;
      }
    }
    return count;
  }

  async function mergeRemoteSettings(remote) {
    const incoming = normalizeRemoteRow('settings', remote);
    if (!incoming || incoming.isDeleted) return 0;
    const existing = state.data.settings;
    if (!remoteIsNewer(incoming, existing)) return 0;
    await put('settings', {
      ...existing,
      currency: incoming.currency || existing.currency,
      theme: incoming.theme || existing.theme,
      firstDayOfMonth: incoming.firstDayOfMonth || existing.firstDayOfMonth,
      trackingStartMonth: incoming.trackingStartMonth || existing.trackingStartMonth,
      goLiveDate: incoming.goLiveDate || existing.goLiveDate,
      excludedAverageMonths: incoming.excludedAverageMonths || existing.excludedAverageMonths || '',
      defaultExpenseCategoryId: incoming.defaultExpenseCategoryId || existing.defaultExpenseCategoryId || '',
      defaultIncomeCategoryId: incoming.defaultIncomeCategoryId || existing.defaultIncomeCategoryId || '',
      defaultInvestmentCategoryId: incoming.defaultInvestmentCategoryId || existing.defaultInvestmentCategoryId || '',
      defaultSavingsAccountId: incoming.defaultSavingsAccountId || existing.defaultSavingsAccountId || '',
      defaultCashAccountId: incoming.defaultCashAccountId || existing.defaultCashAccountId || '',
      defaultCreditCardAccountId: incoming.defaultCreditCardAccountId || existing.defaultCreditCardAccountId || '',
      defaultCompanyAccountId: incoming.defaultCompanyAccountId || existing.defaultCompanyAccountId || '',
      defaultMutualFundAssetId: incoming.defaultMutualFundAssetId || existing.defaultMutualFundAssetId || '',
      defaultStockAssetId: incoming.defaultStockAssetId || existing.defaultStockAssetId || '',
      defaultFdAssetId: incoming.defaultFdAssetId || existing.defaultFdAssetId || '',
      defaultOtherInvestmentAssetId: incoming.defaultOtherInvestmentAssetId || existing.defaultOtherInvestmentAssetId || '',
      favoriteReportIds: incoming.favoriteReportIds || existing.favoriteReportIds || '',
      reportDescriptions: incoming.reportDescriptions || existing.reportDescriptions || '{}',
      dashboardWidgetOrder: incoming.dashboardWidgetOrder || existing.dashboardWidgetOrder || '',
      reportGroupOrder: incoming.reportGroupOrder || existing.reportGroupOrder || '',
      reportPillOrder: incoming.reportPillOrder || existing.reportPillOrder || '{}',
      inactiveAccountIds: incoming.inactiveAccountIds || existing.inactiveAccountIds || '',
      inactiveCategoryIds: incoming.inactiveCategoryIds || existing.inactiveCategoryIds || '',
      inactiveAssetIds: incoming.inactiveAssetIds || existing.inactiveAssetIds || '',
      createdAt: incoming.createdAt || existing.createdAt,
      updatedAt: incoming.updatedAt || existing.updatedAt,
      syncPending: false
    });
    return 1;
  }

  function normalizeRemoteRow(storeName, row) {
    const out = { ...row };
    out.isDeleted = row.isDeleted === true || row.isDeleted === 'TRUE' || row.isDeleted === 'true' || Boolean(row.deletedAt);
    out.syncPending = false;
    if (storeName === 'transactions') {
      out.amount = num(out.amount);
      out.date = normalizeDate(out.date) || String(out.date || '').slice(0, 10);
      out.maturityDate = normalizeDate(out.maturityDate) || String(out.maturityDate || '').slice(0, 10);
    }
    if (storeName === 'accounts') out.openingBalance = num(out.openingBalance);
    if (storeName === 'categories') {
      out.includeInReports = out.includeInReports === true || out.includeInReports === 'TRUE' || out.includeInReports === 'true' || out.includeInReports === 1 || out.includeInReports === '1';
      out.monthlyBudget = num(out.monthlyBudget);
    }
    if (storeName === 'assets') {
      out.openingAmount = num(out.openingAmount);
      out.currentValue = num(out.currentValue);
      out.maturityDate = normalizeDate(out.maturityDate) || String(out.maturityDate || '').slice(0, 10);
      out.fdBankAccountId = String(out.fdBankAccountId || '');
      out.fdPrincipal = num(out.fdPrincipal);
      out.fdMaturityAmount = num(out.fdMaturityAmount);
      out.fdInterestAmount = num(out.fdInterestAmount);
    }
    return out;
  }

  function remoteIsNewer(incoming, existing) {
    return timeValue(incoming.deletedAt || incoming.updatedAt || incoming.createdAt) >= timeValue(existing?.deletedAt || existing?.updatedAt || existing?.createdAt);
  }

  function timeValue(value) {
    const ms = Date.parse(value || '');
    return Number.isFinite(ms) ? ms : 0;
  }

  async function appsScriptRequest(payload) {
    const endpoint = String(state.data.settings.syncUrl || '').trim();
    if (!endpoint) throw new Error('Missing Apps Script Web App URL');
    const body = JSON.stringify({ ...payload, secret: state.data.settings.syncSecret, appVersion: VERSION });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        redirect: 'follow',
        signal: controller.signal
      });
      const text = await response.text();
      let parsed;
      try { parsed = JSON.parse(text); }
      catch { throw new Error('Apps Script returned a non-JSON response. Check deployment URL and access settings.'); }
      if (!response.ok || parsed.ok === false) throw new Error(parsed.error || `HTTP ${response.status}`);
      return parsed;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Sync timed out. Check your internet connection and Apps Script URL.');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = parsed.data || parsed;
      if (!incoming.transactions || !incoming.accounts || !incoming.categories || !incoming.assets) {
        throw new Error('Invalid backup format');
      }
      const replace = confirm('Replace all local data with this backup? Choose Cancel to merge records instead.');
      if (replace) {
        await Promise.all(STORE_NAMES.map(clearStore));
      }
      await Promise.all((incoming.accounts || []).map(item => put('accounts', item)));
      await Promise.all((incoming.categories || []).map(item => put('categories', item)));
      await Promise.all((incoming.assets || []).map(item => put('assets', item)));
      await Promise.all((incoming.transactions || []).map(item => put('transactions', item)));
      await put('settings', { id: 'default', ...DEFAULT_SETTINGS, ...(incoming.settings || {}) });
      await loadAll();
      render();
      toast(replace ? 'Backup restored' : 'Backup merged');
    } catch (error) {
      console.error(error);
      toast('Import failed: invalid backup');
    } finally {
      event.target.value = '';
    }
  }

  async function resetAllData() {
    const yes = confirm('This deletes all local transactions, accounts, categories, assets, and settings from this browser. Continue?');
    if (!yes) return;
    await Promise.all(STORE_NAMES.map(clearStore));
    await seedIfEmpty();
    await loadAll();
    await ensureDefaultMasterItems();
    await loadAll();
    await ensureDeviceSettings();
    await loadAll();
    state.view = 'entry';
    state.editId = null;
    render();
    toast('Local data reset');
  }
})();
