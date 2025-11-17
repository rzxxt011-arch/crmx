import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import DealList from './components/DealList';
import ActivityList from './components/ActivityList';
import SupplierList from './components/SupplierList';
import CampaignList from './components/CampaignList';
import ProductList from './components/ProductList'; // New
import Commissions from './components/Commissions';
import AuthPage from './components/RegistrationPage'; // Corrected path to match filename
import SettingsModal from './components/SettingsModal';
import Button from './components/Button';
import { Customer, Deal, Activity, View, Supplier, Campaign, Product, User, UserRole } from './types'; // Import Product, User, UserRole
import { INITIAL_CUSTOMERS, INITIAL_DEALS, INITIAL_ACTIVITIES, INITIAL_SUPPLIERS, INITIAL_CAMPAIGNS, INITIAL_PRODUCTS, INITIAL_USERS, DEFAULT_COMMISSION_RATE } from './constants'; // Import INITIAL_PRODUCTS, INITIAL_USERS
// Fix: Correctly import TranslationProvider and useTranslation
import { TranslationProvider, useTranslation } from './TranslationContext';

// Helper to safely parse JSON from localStorage
const getInitialState = <T,>(key: string, initialState: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : initialState;
  } catch (error: unknown) {
    console.error(`Error parsing state for ${key} from localStorage:`, (error as Error).message);
    return initialState;
  }
};

const AppContent: React.FC = () => {
  const { t, getLabel } = useTranslation();

  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    return storedUser ? JSON.parse(storedUser) as User : null;
  });
  const [loggedInUserRole, setLoggedInUserRole] = useState<UserRole | null>(() => {
    const storedRole = localStorage.getItem('loggedInUserRole');
    return storedRole ? storedRole as UserRole : null;
  });

  const [currentView, setCurrentView] = useState<View>(() => {
    return loggedInUser ? 'dashboard' : 'register';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // State for triggering activity creation from other components (e.g., CustomerDetail)
  const [pendingActivityCreation, setPendingActivityCreation] = useState<Partial<Activity> | null>(null);

  // Core data states with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => getInitialState<User[]>('crmUsers', INITIAL_USERS));
  const [customers, setCustomers] = useState<Customer[]>(() => getInitialState<Customer[]>('crmCustomers', INITIAL_CUSTOMERS));
  const [deals, setDeals] = useState<Deal[]>(() => getInitialState<Deal[]>('crmDeals', INITIAL_DEALS));
  const [activities, setActivities] = useState<Activity[]>(() => getInitialState<Activity[]>('crmActivities', INITIAL_ACTIVITIES));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getInitialState<Supplier[]>('crmSuppliers', INITIAL_SUPPLIERS));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getInitialState<Campaign[]>('crmCampaigns', INITIAL_CAMPAIGNS));
  const [products, setProducts] = useState<Product[]>(() => getInitialState<Product[]>('crmProducts', INITIAL_PRODUCTS));

  const [commissionRate, setCommissionRate] = useState<number>(() => {
    const storedRate = localStorage.getItem('commissionRate');
    return storedRate ? parseFloat(storedRate) : DEFAULT_COMMISSION_RATE;
  });

  // Effects for persisting core data to localStorage
  useEffect(() => { localStorage.setItem('crmUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('crmCustomers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('crmDeals', JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem('crmActivities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('crmSuppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('crmCampaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('crmProducts', JSON.stringify(products)); }, [products]);

  // Effects for other persisted states
  useEffect(() => { localStorage.setItem('commissionRate', commissionRate.toString()); }, [commissionRate]);
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
      localStorage.setItem('loggedInUserRole', loggedInUser.role);
    } else {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('loggedInUserRole');
    }
  }, [loggedInUser]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setLoggedInUser(user);
    setLoggedInUserRole(user.role);
    setCurrentView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setLoggedInUserRole(null);
    setCurrentView('register');

    // Clear all persisted data (except language and custom labels, managed by TranslationContext)
    localStorage.removeItem('crmUsers');
    localStorage.removeItem('crmCustomers');
    localStorage.removeItem('crmDeals');
    localStorage.removeItem('crmActivities');
    localStorage.removeItem('crmSuppliers');
    localStorage.removeItem('crmCampaigns');
    localStorage.removeItem('crmProducts');
    localStorage.removeItem('commissionRate');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInUserRole');
    localStorage.removeItem('currentView'); // just in case

    // Reset states to initial or empty
    setUsers(INITIAL_USERS);
    setCustomers(INITIAL_CUSTOMERS);
    setDeals(INITIAL_DEALS);
    setActivities(INITIAL_ACTIVITIES);
    setSuppliers(INITIAL_SUPPLIERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setProducts(INITIAL_PRODUCTS);
    setCommissionRate(DEFAULT_COMMISSION_RATE);
    setIsSidebarOpen(false);
  }, []);

  // --- User Management ---
  const addUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  // --- Permissions Helper ---
  const canModify = useCallback((ownerId?: string) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && ownerId === loggedInUser?.id) return true;
    return false;
  }, [loggedInUserRole, loggedInUser]);

  const canViewAll = useCallback(() => {
    return loggedInUserRole === UserRole.Admin;
  }, [loggedInUserRole]);

  // --- Data Filtering based on Permissions ---
  const filteredCustomers = useMemo(() => {
    if (canViewAll()) return customers;
    return customers.filter(c => c.ownerId === loggedInUser?.id);
  }, [customers, loggedInUser?.id, canViewAll]);

  const filteredDeals = useMemo(() => {
    if (canViewAll()) return deals;
    return deals.filter(d => d.ownerId === loggedInUser?.id);
  }, [deals, loggedInUser?.id, canViewAll]);

  const filteredActivities = useMemo(() => {
    if (canViewAll()) return activities;
    return activities.filter(a => a.ownerId === loggedInUser?.id);
  }, [activities, loggedInUser?.id, canViewAll]);

  const filteredSuppliers = useMemo(() => {
    if (canViewAll()) return suppliers;
    return suppliers.filter(s => s.ownerId === loggedInUser?.id);
  }, [suppliers, loggedInUser?.id, canViewAll]);

  const filteredCampaigns = useMemo(() => {
    if (canViewAll()) return campaigns;
    if (loggedInUserRole === UserRole.Viewer) return []; // Viewers don't see campaigns
    return campaigns.filter(c => c.ownerId === loggedInUser?.id);
  }, [campaigns, loggedInUser?.id, canViewAll, loggedInUserRole]);

  const filteredProducts = useMemo(() => {
    if (canViewAll()) return products;
    return products.filter(p => p.ownerId === loggedInUser?.id);
  }, [products, loggedInUser?.id, canViewAll]);


  // --- CRUD Operations with Permission Checks ---
  const getOwnerIdForNewItem = (item: { ownerId?: string }) => {
    if (loggedInUserRole === UserRole.Admin && item.ownerId) {
      return item.ownerId; // Admin can specify an owner
    }
    return loggedInUser?.id; // Otherwise, assign to current user
  };

  const addCustomer = useCallback((customer: Customer) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setCustomers((prev) => [...prev, { ...customer, ownerId: getOwnerIdForNewItem(customer) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    const existing = customers.find(c => c.id === updatedCustomer.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  }, [customers, canModify, t]);

  const deleteCustomer = useCallback((id: string) => {
    const existing = customers.find(c => c.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setDeals((prev) => prev.filter((d) => d.customerId !== id));
    setActivities((prev) => prev.filter((a) => a.customerId !== id));
    setCampaigns((prev) => prev.map(campaign => ({
      ...campaign,
      linkedCustomerIds: campaign.linkedCustomerIds.filter(cid => cid !== id)
    })));
  }, [customers, canModify, t]);

  const addSupplier = useCallback((supplier: Supplier) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setSuppliers((prev) => [...prev, { ...supplier, ownerId: getOwnerIdForNewItem(supplier) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateSupplier = useCallback((updatedSupplier: Supplier) => {
    const existing = suppliers.find(s => s.id === updatedSupplier.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
    );
  }, [suppliers, canModify, t]);

  const deleteSupplier = useCallback((id: string) => {
    const existing = suppliers.find(s => s.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    setActivities((prev) => prev.filter((a) => a.supplierId !== id));
  }, [suppliers, canModify, t]);

  const addDeal = useCallback((deal: Deal) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setDeals((prev) => [...prev, { ...deal, ownerId: getOwnerIdForNewItem(deal) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateDeal = useCallback((updatedDeal: Deal) => {
    const existing = deals.find(d => d.id === updatedDeal.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setDeals((prev) =>
      prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))
    );
  }, [deals, canModify, t]);

  const deleteDeal = useCallback((id: string) => {
    const existing = deals.find(d => d.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setActivities((prev) => prev.filter((a) => a.dealId !== id));
  }, [deals, canModify, t]);

  const addActivity = useCallback((activity: Activity) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setActivities((prev) => [...prev, { ...activity, ownerId: getOwnerIdForNewItem(activity) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateActivity = useCallback((updatedActivity: Activity) => {
    const existing = activities.find(a => a.id === updatedActivity.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setActivities((prev) =>
      prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
    );
  }, [activities, canModify, t]);

  const deleteActivity = useCallback((id: string) => {
    const existing = activities.find(a => a.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, [activities, canModify, t]);

  // Campaign CRUD operations
  const addCampaign = useCallback((campaign: Campaign) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setCampaigns((prev) => [...prev, { ...campaign, ownerId: getOwnerIdForNewItem(campaign) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateCampaign = useCallback((updatedCampaign: Campaign) => {
    const existing = campaigns.find(c => c.id === updatedCampaign.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  }, [campaigns, canModify, t]);

  const deleteCampaign = useCallback((id: string) => {
    const existing = campaigns.find(c => c.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, [campaigns, canModify, t]);

  // Product CRUD operations
  const addProduct = useCallback((product: Product) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setProducts((prev) => [...prev, { ...product, ownerId: getOwnerIdForNewItem(product) }]);
  }, [loggedInUser?.id, loggedInUserRole, t]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    const existing = products.find(p => p.id === updatedProduct.id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  }, [products, canModify, t]);

  const deleteProduct = useCallback((id: string) => {
    const existing = products.find(p => p.id === id);
    if (!existing || !canModify(existing.ownerId)) return alert(t('common.permission_denied'));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [products, canModify, t]);

  // Function to request opening Activity Form with pre-filled data
  const handleRequestActivityCreation = useCallback((data: Partial<Activity>) => {
    if (loggedInUserRole === UserRole.Viewer) return alert(t('common.permission_denied'));
    setPendingActivityCreation(data);
    setCurrentView('activities'); // Navigate to activities view
  }, [loggedInUserRole, t]);

  // Function to acknowledge that ActivityList has handled the pending activity creation
  const handleActivityCreationHandled = useCallback(() => {
    setPendingActivityCreation(null);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard customers={filteredCustomers} deals={filteredDeals} activities={filteredActivities} />;
      case 'customers':
        return (
          <CustomerList
            customers={filteredCustomers}
            onAdd={addCustomer}
            onUpdate={updateCustomer}
            onDelete={deleteCustomer}
            allDeals={deals} // Pass all deals to filter in customer detail
            allActivities={activities} // Pass all activities to filter in customer detail
            setCustomers={setCustomers}
            onRequestActivityCreation={handleRequestActivityCreation}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'suppliers':
        return (
          <SupplierList
            suppliers={filteredSuppliers}
            onAdd={addSupplier}
            onUpdate={updateSupplier}
            onDelete={deleteSupplier}
            activities={activities} // Pass all activities to filter in supplier detail
            setSuppliers={setSuppliers}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'products':
        return (
          <ProductList
            products={filteredProducts}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            setProducts={setProducts}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'deals':
        return (
          <DealList
            deals={filteredDeals}
            customers={filteredCustomers} // Pass filtered customers for dropdowns
            onAdd={addDeal}
            onUpdate={updateDeal}
            onDelete={deleteDeal}
            activities={activities} // Pass all activities to filter in deal detail
            setDeals={setDeals}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'activities':
        return (
          <ActivityList
            activities={filteredActivities}
            customers={filteredCustomers} // Pass filtered customers for dropdowns
            deals={filteredDeals} // Pass filtered deals for dropdowns
            suppliers={filteredSuppliers} // Pass filtered suppliers for dropdowns
            onAdd={addActivity}
            onUpdate={updateActivity}
            onDelete={deleteActivity}
            setActivities={setActivities}
            pendingActivityCreation={pendingActivityCreation}
            onPendingActivityHandled={handleActivityCreationHandled}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'campaigns':
        return (
          <CampaignList
            campaigns={filteredCampaigns}
            customers={filteredCustomers} // Pass filtered customers for linking
            onAdd={addCampaign}
            onUpdate={updateCampaign}
            onDelete={deleteCampaign}
            setCampaigns={setCampaigns}
            loggedInUserRole={loggedInUserRole}
            loggedInUserId={loggedInUser?.id || null}
            users={users} // Pass users for owner assignment
          />
        );
      case 'commissions':
        return (
          <Commissions
            deals={filteredDeals}
            customers={filteredCustomers}
            commissionRate={commissionRate}
            setCommissionRate={setCommissionRate}
            loggedInUserRole={loggedInUserRole} // Pass user role for rate editing
          />
        );
      case 'settings':
        return (
          <div className="flex-1 flex flex-col justify-center items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('common.settings')}</h2>
            <p className="text-gray-600 mb-4">{t('settings.intro')}</p>
            <Button variant="primary" onClick={() => setIsSettingsModalOpen(true)}>
              {t('common.personalize_labels')}
            </Button>
            <Button variant="secondary" className="mt-4" onClick={() => setCurrentView('dashboard')}>
              {t('common.back_to_dashboard')}
            </Button>
          </div>
        );
      default:
        return <Dashboard customers={filteredCustomers} deals={filteredDeals} activities={filteredActivities} />;
    }
  };

  if (!loggedInUser) {
    return <AuthPage onAuthSuccess={handleLoginSuccess} users={users} onAddUser={addUser} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        loggedInUserRole={loggedInUserRole}
      />
      <div className="flex-1 flex flex-col">
        <Header
          title={getLabel(`sidebar.${currentView}`, { defaultValue: currentView.charAt(0).toUpperCase() + currentView.slice(1) })}
          username={loggedInUser.username}
          loggedInUserRole={loggedInUserRole}
          onLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => (
  <TranslationProvider>
    <AppContent />
  </TranslationProvider>
);

export default App;
