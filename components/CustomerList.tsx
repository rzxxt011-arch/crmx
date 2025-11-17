import React, { useState, useRef, useMemo } from 'react';
import { Customer, SortConfig, Activity, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface CustomerListProps {
  customers: Customer[];
  onAdd: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (id: string) => void;
  allDeals: any[]; // Pass all deal objects
  allActivities: any[]; // Pass all activity objects
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>; // To update state directly after import
  onRequestActivityCreation: (data: Partial<Activity>) => void; // New prop for creating related activities
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onAdd, onUpdate, onDelete, allDeals, allActivities, setCustomers, onRequestActivityCreation, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Customer>>({ key: 'name', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (customer: Customer) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && customer.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (customer: Customer) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && customer.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = () => {
    setSelectedCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (customer: Customer) => {
    if (customer.id) {
      onUpdate(customer);
    } else {
      onAdd({ ...customer, id: `cust-${Date.now()}` });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('customers.confirm_delete'))) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    exportToJSON(customers, t('customers.title').toLowerCase());
    alert(t('customers.exported_success', { filename: t('customers.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedCustomers = await importFromJSON<Customer>(file, 'cust');
        setCustomers((prev) => {
          const newCustomers = importedCustomers.filter(
            (importedCust) => !prev.some((existingCust) => existingCust.id === importedCust.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalCustomers = loggedInUserRole === UserRole.Admin
            ? newCustomers // Admin imports as is
            : newCustomers.map(cust => ({ ...cust, ownerId: cust.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalCustomers];
        });
        alert(t('customers.imported_success'));
      } catch (error: any) {
        alert(t('customers.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };

  const sortedAndFilteredCustomers = useMemo(() => {
    let sortableItems = [...customers];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue;
        }
        // Fallback for other types or if types mismatch
        return 0;
      });
    }
    return sortableItems;
  }, [customers, searchTerm, sortConfig]);

  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Customer) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const sortOptions = [
    { value: 'name-asc', label: t('customers.sort_name_asc') },
    { value: 'name-desc', label: t('customers.sort_name_desc') },
    { value: 'company-asc', label: t('customers.sort_company_asc') },
    { value: 'company-desc', label: t('customers.sort_company_desc') },
    { value: 'status-asc', label: t('customers.sort_status_asc') },
    { value: 'status-desc', label: t('customers.sort_status_desc') },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Customer, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('customers.title')}</h2>
        <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleExport} disabled={!canAdd} title={!canAdd ? t('common.permission_denied_tooltip') : ''}>
              {t('common.export')}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".json"
              aria-label={t('common.import')}
              disabled={!canAdd}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={!canAdd} title={!canAdd ? t('common.permission_denied_tooltip') : ''}>
              {t('common.import')}
            </Button>
            <Button variant="primary" onClick={handleOpenAddModal} disabled={!canAdd} title={!canAdd ? t('common.permission_denied_tooltip') : ''}>
              {t('customers.add_button')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-customers"
          placeholder={t('customers.search_placeholder')}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <Select
          id="sort-customers"
          label={t('customers.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>


      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredCustomers.length === 0 && customers.length > 0 ? (
            <p className="p-6 text-gray-600">{t('customers.no_match_search')}</p>
        ) : sortedAndFilteredCustomers.length === 0 && customers.length === 0 ? (
            <p className="p-6 text-gray-600">{t('customers.no_customers_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('customers.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    {t('customers.name')} {getSortIndicator('name')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('company')}>
                    {t('customers.company')} {getSortIndicator('company')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" onClick={() => requestSort('email')}>
                    {t('customers.email')} {getSortIndicator('email')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                    {t('customers.status')} {getSortIndicator('status')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700">{customer.company}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden sm:table-cell">{customer.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                          customer.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                    {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(customer.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(customer)} aria-label={`${t('customers.view')} ${customer.name}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(customer)} aria-label={`${t('customers.edit')} ${customer.name}`} disabled={!canEdit(customer)} title={!canEdit(customer) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(customer.id)} aria-label={`${t('customers.delete')} ${customer.name}`} disabled={!canDelete(customer)} title={!canDelete(customer) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedCustomer ? t('customers.form.edit_title') : t('customers.form.add_title')}
      >
        <CustomerForm
          customer={selectedCustomer || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          users={users}
          loggedInUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedCustomer ? t('customers.detail.details_title', { customerName: selectedCustomer.name }) : t('customers.detail.details_title', { customerName: '' })}
      >
        {selectedCustomer && (
          <CustomerDetail
            customer={selectedCustomer}
            // Fix: Pass actual filtered deal and activity objects instead of just IDs
            deals={allDeals.filter(d => d.customerId === selectedCustomer.id)}
            activities={allActivities.filter(a => a.customerId === selectedCustomer.id)}
            onCreateRelatedActivity={onRequestActivityCreation} // Pass the handler
            loggedInUserRole={loggedInUserRole} // Pass user role
            isOwner={selectedCustomer.ownerId === loggedInUserId} // Pass ownership
          />
        )}
      </Modal>
    </div>
  );
};

export default CustomerList;