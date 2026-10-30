import React, { useState, useEffect } from 'react';
import {
  Branch,
  CartItem,
  CategoryId,
  ChannelType,
  CloudSyncState,
  HeldOrder,
  PaymentMethod,
  Product,
  StaffUser,
  Transaction,
} from './types/pos';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { SidebarCategory } from './components/SidebarCategory';
import { ProductCard } from './components/ProductCard';
import { CartPanel } from './components/CartPanel';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HeldOrdersModal } from './components/HeldOrdersModal';
import { TableSelectorModal } from './components/TableSelectorModal';
import { MemberModal } from './components/MemberModal';
import { PinLoginModal } from './components/PinLoginModal';
import { BranchSelectorModal } from './components/BranchSelectorModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { AnalyticsView } from './components/AnalyticsView';
import { generateInvoiceNumber } from './utils/formatters';
import { playClick, playSuccess, playBeep, playError } from './utils/audio';

const STORAGE_KEYS = {
  BRANCHES: 'kasirpro_branches_v2',
  PRODUCTS: 'kasirpro_products_v2',
  TRANSACTIONS: 'kasirpro_transactions_v2',
  HELD_ORDERS: 'kasirpro_held_orders_v2',
  ACTIVE_BRANCH: 'kasirpro_active_branch_v2',
  STAFF_CURRENT: 'kasirpro_current_staff_v2',
};

export default function App() {
  // --- Persistent States ---
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [activeBranch, setActiveBranch] = useState<Branch>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES[0];
  });

  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);

  const [currentStaff, setCurrentStaff] = useState<StaffUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF_CURRENT);
    return saved ? JSON.parse(saved) : INITIAL_STAFF[2]; // Dewi Kartika (Kasir)
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  // --- Active Cart & POS States ---
  const [currentView, setCurrentView] = useState<'pos' | 'inventory' | 'reports' | 'analytics'>('pos');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channel, setChannel] = useState<ChannelType>('DINE IN');
  const [customerName, setCustomerName] = useState<string>('CASH');
  const [tableNo, setTableNo] = useState<string>('Meja 04');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // --- Cloud Sync State ---
  const [cloudSync, setCloudSync] = useState<CloudSyncState>({
    isOnline: true,
    isSyncing: false,
    lastSyncedAt: new Date().toISOString(),
    pendingSyncCount: 0,
    autoSync: true,
    logs: [
      {
        id: 'log-1',
        time: new Date().toLocaleTimeString('id-ID'),
        message: 'Koneksi Cloud POS Asia-East1 terhubung & aktif.',
        type: 'success',
      },
    ],
  });

  // --- Modal Visibility States ---
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [shouldAutoPrint, setShouldAutoPrint] = useState(false);
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH, JSON.stringify(activeBranch));
  }, [activeBranch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF_CURRENT, JSON.stringify(currentStaff));
  }, [currentStaff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Cloud Sync simulation engine
  const triggerCloudSync = () => {
    setCloudSync((prev) => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      setTransactions((prev) => prev.map((t) => ({ ...t, syncedToCloud: true })));
      setCloudSync((prev) => ({
        ...prev,
        isSyncing: false,
        pendingSyncCount: 0,
        lastSyncedAt: new Date().toISOString(),
        logs: [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('id-ID'),
            message: `Sinkronisasi data cloud berhasil. ${products.length} produk & ${transactions.length} transaksi termutakhirkan.`,
            type: 'success',
          },
          ...prev.logs.slice(0, 15),
        ],
      }));
    }, 1200);
  };

  // --- Cart Actions ---
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleSetQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleSetNotes = (productId: string, notes: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('Batalkan seluruh pesanan di keranjang saat ini?')) {
      setCartItems([]);
      setDiscountAmount(0);
      playClick();
    }
  };

  // --- Hold / Save Order ---
  const handleSaveOrder = () => {
    if (cartItems.length === 0) return;

    const newHeld: HeldOrder = {
      id: `hold-${Date.now()}`,
      branchId: activeBranch.id,
      channel,
      customerName: customerName || 'Pelanggan Umum',
      tableNo: channel === 'DINE IN' ? tableNo : undefined,
      items: [...cartItems],
      createdAt: new Date().toISOString(),
    };

    setHeldOrders((prev) => [newHeld, ...prev]);
    setCartItems([]);
    setDiscountAmount(0);
    playSuccess();
    alert('Pesanan berhasil disimpan di Antrean Hold!');
  };

  const handleResumeOrder = (order: HeldOrder) => {
    setCartItems(order.items);
    setChannel(order.channel);
    setCustomerName(order.customerName);
    if (order.tableNo) setTableNo(order.tableNo);
    // Remove from held
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    playSuccess();
  };

  const handleDeleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // --- Checkout & Payment Execution ---
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const effectiveDiscount = Math.min(discountAmount, subtotal);
  const taxableAmount = Math.max(0, subtotal - effectiveDiscount);
  const tax = taxEnabled ? Math.round(taxableAmount * 0.1) : 0;
  const grandTotal = Math.max(0, taxableAmount + tax);

  const handleOpenPayment = () => {
    if (cartItems.length === 0) return;
    playClick();
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = (
    method: PaymentMethod,
    cashPaid?: number,
    change?: number,
    qrisRef?: string,
    qrisRrn?: string,
    autoPrintReceipt = true
  ) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNo: generateInvoiceNumber(activeBranch.code),
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      cashierId: currentStaff.id,
      cashierName: currentStaff.name,
      customerName: customerName || 'Pelanggan Umum',
      channel,
      tableNo: channel === 'DINE IN' ? tableNo : undefined,
      items: cartItems.map((it) => ({
        productId: it.product.id,
        name: it.product.name,
        category: it.product.category,
        price: it.product.price,
        costPrice: it.product.costPrice,
        quantity: it.quantity,
        notes: it.notes,
        subtotal: it.product.price * it.quantity,
      })),
      subtotal,
      discount: effectiveDiscount,
      tax,
      total: grandTotal,
      paymentMethod: method,
      cashPaid,
      change,
      qrisReference: qrisRef,
      qrisRrn,
      status: 'PAID',
      createdAt: new Date().toISOString(),
      syncedToCloud: cloudSync.autoSync,
    };

    // Deduct stock in active branch for sold items
    setProducts((prev) =>
      prev.map((p) => {
        const itemSold = cartItems.find((it) => it.product.id === p.id);
        if (itemSold) {
          const currentStock = p.stockByBranch[activeBranch.id] ?? 0;
          return {
            ...p,
            stockByBranch: {
              ...p.stockByBranch,
              [activeBranch.id]: Math.max(0, currentStock - itemSold.quantity),
            },
          };
        }
        return p;
      })
    );

    // Save transaction
    setTransactions((prev) => [newTx, ...prev]);

    // Close payment modal
    setIsPaymentOpen(false);

    // Reset cart
    setCartItems([]);
    setDiscountAmount(0);

    // Show thermal receipt modal & auto trigger print if selected
    setActiveReceiptTx(newTx);
    setShouldAutoPrint(autoPrintReceipt);
    setIsReceiptOpen(true);

    // Log cloud activity
    if (cloudSync.autoSync) {
      setCloudSync((prev) => ({
        ...prev,
        lastSyncedAt: new Date().toISOString(),
        logs: [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('id-ID'),
            message: `Transaksi ${newTx.invoiceNo} tersinkronisasi ke cloud (${method}).`,
            type: 'success',
          },
          ...prev.logs.slice(0, 15),
        ],
      }));
    } else {
      setCloudSync((prev) => ({
        ...prev,
        pendingSyncCount: prev.pendingSyncCount + 1,
      }));
    }
  };

  // --- Inventory Callbacks ---
  const handleUpdateProductStock = (
    productId: string,
    branchId: string,
    newStock: number,
    reason: string
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockByBranch: {
                ...p.stockByBranch,
                [branchId]: newStock,
              },
            }
          : p
      )
    );
  };

  const handleAddNewProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProductDetails = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  // --- Void Transaction ---
  const handleVoidTransaction = (transactionId: string, reason: string) => {
    const targetTx = transactions.find((t) => t.id === transactionId);
    if (!targetTx) return;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const itemSold = targetTx.items.find((it) => it.productId === p.id);
        if (itemSold) {
          const currentStock = p.stockByBranch[targetTx.branchId] ?? 0;
          return {
            ...p,
            stockByBranch: {
              ...p.stockByBranch,
              [targetTx.branchId]: currentStock + itemSold.quantity,
            },
          };
        }
        return p;
      })
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, status: 'VOID', voidReason: reason }
          : t
      )
    );
  };

  // Filter products for POS Grid
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate category item counts
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  categoryCounts['ALL'] = products.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 font-sans text-neutral-900 select-none">
      {/* Top Navbar */}
      <Navbar
        channel={channel}
        onChangeChannel={setChannel}
        customerName={customerName}
        onEditCustomer={() => setIsMemberModalOpen(true)}
        tableNo={tableNo}
        onSelectTable={() => setIsTableModalOpen(true)}
        activeBranch={activeBranch}
        onOpenBranchSelector={() => setIsBranchModalOpen(true)}
        currentStaff={currentStaff}
        onSwitchStaff={() => setIsPinModalOpen(true)}
        cloudSync={cloudSync}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenMenuDrawer={() => setIsNavDrawerOpen(true)}
        onOpenHeldOrders={() => setIsHeldOrdersOpen(true)}
        heldOrdersCount={heldOrders.length}
        currentView={currentView}
        onNavigateView={setCurrentView}
      />

      {/* Main Body View */}
      {currentView === 'pos' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Category Sidebar (Matches photo) */}
          <SidebarCategory
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />

          {/* Center: Products Grid (Matches photo) */}
          <main className="flex-1 overflow-y-auto p-3 md:p-4 bg-neutral-100">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 py-16">
                <span className="text-4xl mb-2">🍽️</span>
                <p className="font-bold text-neutral-600 text-sm">
                  Tidak ada menu ditemukan
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Coba pilih kategori lain atau hapus kata kunci pencarian.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                {filteredProducts.map((product) => {
                  const cartItem = cartItems.find(
                    (it) => it.product.id === product.id
                  );
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      branchId={activeBranch.id}
                      cartQuantity={cartItem?.quantity}
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            )}
          </main>

          {/* Right: Cart Panel (Matches photo) */}
          <CartPanel
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onSetQuantity={handleSetQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onSaveOrder={handleSaveOrder}
            onCheckout={handleOpenPayment}
            onSetNotes={handleSetNotes}
            taxEnabled={taxEnabled}
            onToggleTax={() => setTaxEnabled(!taxEnabled)}
            discountAmount={discountAmount}
            onSetDiscount={setDiscountAmount}
          />
        </div>
      )}

      {/* Inventory & Stock View */}
      {currentView === 'inventory' && (
        <InventoryView
          products={products}
          branches={branches}
          activeBranch={activeBranch}
          currentStaff={currentStaff}
          onUpdateProductStock={handleUpdateProductStock}
          onAddNewProduct={handleAddNewProduct}
          onUpdateProductDetails={handleUpdateProductDetails}
          onBackToPos={() => setCurrentView('pos')}
        />
      )}

      {/* Real-Time Sales Reports View */}
      {currentView === 'reports' && (
        <ReportsView
          transactions={transactions}
          branches={branches}
          activeBranch={activeBranch}
          currentStaff={currentStaff}
          onReprintReceipt={(tx) => {
            setActiveReceiptTx(tx);
            setShouldAutoPrint(false);
            setIsReceiptOpen(true);
          }}
          onVoidTransaction={handleVoidTransaction}
          onBackToPos={() => setCurrentView('pos')}
        />
      )}

      {/* Analytics Dashboard View */}
      {currentView === 'analytics' && (
        <AnalyticsView
          transactions={transactions}
          branches={branches}
          activeBranch={activeBranch}
          onBackToPos={() => setCurrentView('pos')}
        />
      )}

      {/* --- ALL MODALS --- */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={grandTotal}
        activeBranch={activeBranch}
        onConfirmPayment={handleConfirmPayment}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={activeReceiptTx}
        autoPrint={shouldAutoPrint}
      />

      <HeldOrdersModal
        isOpen={isHeldOrdersOpen}
        onClose={() => setIsHeldOrdersOpen(false)}
        heldOrders={heldOrders}
        onResumeOrder={handleResumeOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
      />

      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={tableNo}
        onSelectTable={setTableNo}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        currentCustomer={customerName}
        onSaveCustomer={setCustomerName}
      />

      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        staffList={staffList}
        currentStaff={currentStaff}
        onSelectStaff={(user) => {
          setCurrentStaff(user);
          // If staff belongs to another branch, sync branch
          const staffBranch = branches.find((b) => b.id === user.branchId);
          if (staffBranch) setActiveBranch(staffBranch);
        }}
      />

      <BranchSelectorModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        branches={branches}
        activeBranch={activeBranch}
        onSelectBranch={setActiveBranch}
        onAddBranch={(newB) => setBranches((prev) => [...prev, newB])}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        cloudSync={cloudSync}
        onTriggerSync={triggerCloudSync}
        onToggleAutoSync={() =>
          setCloudSync((prev) => ({ ...prev, autoSync: !prev.autoSync }))
        }
        products={products}
        transactions={transactions}
        branches={branches}
        onImportData={(data) => {
          if (data.products) setProducts(data.products);
          if (data.transactions) setTransactions(data.transactions);
          if (data.branches) setBranches(data.branches);
        }}
      />

      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenHeldOrders={() => setIsHeldOrdersOpen(true)}
        heldOrdersCount={heldOrders.length}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onOpenBranchSelector={() => setIsBranchModalOpen(true)}
        activeBranch={activeBranch}
        currentStaff={currentStaff}
        onSwitchStaff={() => setIsPinModalOpen(true)}
      />
    </div>
  );
}
