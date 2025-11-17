import React, { useState, useRef, useMemo } from 'react';
import { Deal, Customer, Activity, SortConfig, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import DealForm from './DealForm';
import DealDetail from './DealDetail';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface DealListProps {
  deals: Deal[];
  customers: Customer[];
  onAdd: (deal: Deal) => void;
  onUpdate: (deal: Deal) => void;
  onDelete: (id: string) => void;
  activities: Activity[]; // Pass full activity objects to DealDetail
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>; // To update state directly after import
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const DealList: React.FC<DealListProps> = ({ deals, customers, onAdd, onUpdate, onDelete, activities, setDeals, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Deal>>({ key: 'name', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (deal: Deal) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && deal.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (deal: Deal) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && deal.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = () => {
    setSelectedDeal(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (deal: Deal) => {
    if (deal.id) {
      onUpdate(deal);
    } else {
      onAdd({ ...deal, id: `deal-${Date.now()}` });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('deals.confirm_delete'))) {
      onDelete(id);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || t('common.na');
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const handleExport = () => {
    exportToJSON(deals, t('deals.title').toLowerCase());
    alert(t('deals.exported_success', { filename: t('deals.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedDeals = await importFromJSON<Deal>(file, 'deal');
        setDeals((prev) => {
          const newDeals = importedDeals.filter(
            (importedDeal) => !prev.some((existingDeal) => existingDeal.id === importedDeal.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalDeals = loggedInUserRole === UserRole.Admin
            ? newDeals // Admin imports as is
            : newDeals.map(deal => ({ ...deal, ownerId: deal.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalDeals];
        });
        alert(t('deals.imported_success'));
      } catch (error: any) {
        alert(t('deals.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };

  const sortedAndFilteredDeals = useMemo(() => {
    let sortableItems = [...deals];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (deal) =>
          deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerName(deal.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
          deal.stage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Special handling for customerName
        if (sortConfig.key === 'customerId') {
          aValue = getCustomerName(a.customerId);
          bValue = getCustomerName(b.customerId);
        }

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
  }, [deals, searchTerm, sortConfig, customers, t]); // Add t to dependencies for getCustomerName

  const requestSort = (key: keyof Deal | 'customerId') => { // Added 'customerId' for sorting by customer name
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: key as keyof Deal, direction });
  };

  const getSortIndicator = (key: keyof Deal | 'customerId') => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  const sortOptions = [
    { value: 'name-asc', label: t('deals.sort_deal_name_asc') },
    { value: 'name-desc', label: t('deals.sort_deal_name_desc') },
    { value: 'customerId-asc', label: t('deals.sort_customer_asc') },
    { value: 'customerId-desc', label: t('deals.sort_customer_desc') },
    { value: 'value-asc', label: t('deals.sort_value_asc') },
    { value: 'value-desc', label: t('deals.sort_value_desc') },
    { value: 'stage-asc', label: t('deals.sort_stage_asc') },
    { value: 'stage-desc', label: t('deals.sort_stage_desc') },
    { value: 'closeDate-asc', label: t('deals.sort_close_date_asc') },
    { value: 'closeDate-desc', label: t('deals.sort_close_date_desc') },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Deal, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('deals.title')}</h2>
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
            <Button variant="primary" onClick={handleOpenAddModal} disabled={customers.length === 0 || !canAdd} title={!canAdd ? t('common.permission_denied_tooltip') : (customers.length === 0 ? t('deals.no_customer_warning_message') : '')}>
              {t('deals.add_button')}
            </Button>
        </div>
      </div>
      {canAdd && customers.length === 0 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4" role="alert">
          <p className="font-bold">{t('deals.no_customer_warning_title')}</p>
          <p>{t('deals.no_customer_warning_message')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-deals"
          placeholder={t('deals.search_placeholder')}
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
          id="sort-deals"
          label={t('deals.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredDeals.length === 0 && deals.length > 0 ? (
            <p className="p-6 text-gray-600">{t('deals.no_match_search')}</p>
        ) : sortedAndFilteredDeals.length === 0 && deals.length === 0 ? (
            <p className="p-6 text-gray-600">{t('deals.no_deals_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('deals.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    {t('deals.deal_name')} {getSortIndicator('name')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('customerId')}>
                    {t('deals.customer')} {getSortIndicator('customerId')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('value')}>
                    {t('deals.value')} {getSortIndicator('value')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" onClick={() => requestSort('stage')}>
                    {t('deals.stage')} {getSortIndicator('stage')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('deals.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{deal.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700">{getCustomerName(deal.customerId)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700">${deal.value.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm hidden sm:table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${deal.stage === 'Won' ? 'bg-green-100 text-green-800' :
                          deal.stage === 'Lost' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {deal.stage}
                      </span>
                    </td>
                    {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(deal.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(deal)} aria-label={`${t('deals.view')} ${deal.name}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(deal)} aria-label={`${t('deals.edit')} ${deal.name}`} disabled={!canEdit(deal)} title={!canEdit(deal) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(deal.id)} aria-label={`${t('deals.delete')} ${deal.name}`} disabled={!canDelete(deal)} title={!canDelete(deal) ? t('common.permission_denied_tooltip') : ''}>
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
        title={selectedDeal ? t('deals.form.edit_title') : t('deals.form.add_title')}
      >
        <DealForm
          deal={selectedDeal || undefined}
          customers={customers}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          users={users}
          loggedInUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedDeal ? t('deals.detail.details_title', { dealName: selectedDeal.name }) : t('deals.detail.details_title', { dealName: '' })}
      >
        {selectedDeal && (
          // Fix: Pass `loggedInUserRole` and `isOwner` to DealDetail component.
          <DealDetail
            deal={selectedDeal}
            customerName={getCustomerName(selectedDeal.customerId)}
            activities={activities.filter(act => act.dealId === selectedDeal.id)} // Filter activities here
            loggedInUserRole={loggedInUserRole}
            isOwner={selectedDeal.ownerId === loggedInUserId}
          />
        )}
      </Modal>
    </div>
  );
};

export default DealList;