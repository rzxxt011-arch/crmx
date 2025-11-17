import React, { useState, useRef, useMemo } from 'react';
import { Supplier, Activity, SortConfig, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import SupplierForm from './SupplierForm';
import SupplierDetail from './SupplierDetail';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface SupplierListProps {
  suppliers: Supplier[];
  onAdd: (supplier: Supplier) => void;
  onUpdate: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  activities: Activity[]; // Pass full activity objects to SupplierDetail
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>; // To update state directly after import
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onAdd, onUpdate, onDelete, activities, setSuppliers, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Supplier>>({ key: 'name', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (supplier: Supplier) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && supplier.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (supplier: Supplier) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && supplier.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = () => {
    setSelectedSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (supplier: Supplier) => {
    if (supplier.id) {
      onUpdate(supplier);
    } else {
      onAdd({ ...supplier, id: `sup-${Date.now()}` });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('suppliers.confirm_delete'))) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    exportToJSON(suppliers, t('suppliers.title').toLowerCase());
    alert(t('suppliers.exported_success', { filename: t('suppliers.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedSuppliers = await importFromJSON<Supplier>(file, 'sup');
        setSuppliers((prev) => {
          const newSuppliers = importedSuppliers.filter(
            (importedSupplier) => !prev.some((existingSupplier) => existingSupplier.id === importedSupplier.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalSuppliers = loggedInUserRole === UserRole.Admin
            ? newSuppliers // Admin imports as is
            : newSuppliers.map(sup => ({ ...sup, ownerId: sup.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalSuppliers];
        });
        alert(t('suppliers.imported_success'));
      } catch (error: any) {
        alert(t('suppliers.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };

  const sortedAndFilteredSuppliers = useMemo(() => {
    let sortableItems = [...suppliers];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [suppliers, searchTerm, sortConfig]);

  const requestSort = (key: keyof Supplier) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Supplier) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const sortOptions = [
    { value: 'name-asc', label: t('suppliers.sort_name_asc') },
    { value: 'name-desc', label: t('suppliers.sort_name_desc') },
    { value: 'contactPerson-asc', label: t('suppliers.sort_contact_asc') },
    { value: 'contactPerson-desc', label: t('suppliers.sort_contact_desc') },
    { value: 'company-asc', label: t('suppliers.sort_company_asc') },
    { value: 'company-desc', label: t('suppliers.sort_company_desc') },
    { value: 'status-asc', label: t('suppliers.sort_status_asc') },
    { value: 'status-desc', label: t('suppliers.sort_status_desc') },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Supplier, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('suppliers.title')}</h2>
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
              {t('suppliers.add_button')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-suppliers"
          placeholder={t('suppliers.search_placeholder')}
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
          id="sort-suppliers"
          label={t('suppliers.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredSuppliers.length === 0 && suppliers.length > 0 ? (
            <p className="p-6 text-gray-600">{t('suppliers.no_match_search')}</p>
        ) : sortedAndFilteredSuppliers.length === 0 && suppliers.length === 0 ? (
            <p className="p-6 text-gray-600">{t('suppliers.no_suppliers_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('suppliers.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    {t('suppliers.name')} {getSortIndicator('name')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" onClick={() => requestSort('contactPerson')}>
                    {t('suppliers.contact_person')} {getSortIndicator('contactPerson')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                    {t('suppliers.status')} {getSortIndicator('status')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('suppliers.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{supplier.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden sm:table-cell">{supplier.contactPerson}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${supplier.status === 'Active' ? 'bg-green-100 text-green-800' :
                          supplier.status === 'Preferred' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {supplier.status}
                      </span>
                    </td>
                     {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(supplier.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(supplier)} aria-label={`${t('suppliers.view')} ${supplier.name}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(supplier)} aria-label={`${t('suppliers.edit')} ${supplier.name}`} disabled={!canEdit(supplier)} title={!canEdit(supplier) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(supplier.id)} aria-label={`${t('suppliers.delete')} ${supplier.name}`} disabled={!canDelete(supplier)} title={!canDelete(supplier) ? t('common.permission_denied_tooltip') : ''}>
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
        title={selectedSupplier ? t('suppliers.form.edit_title') : t('suppliers.form.add_title')}
      >
        <SupplierForm
          supplier={selectedSupplier || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          users={users}
          loggedInUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedSupplier ? t('suppliers.detail.details_title', { supplierName: selectedSupplier.name }) : t('suppliers.detail.details_title', { supplierName: '' })}
      >
        {selectedSupplier && (
          <SupplierDetail
            supplier={selectedSupplier}
            activities={activities.filter(act => act.supplierId === selectedSupplier.id)} // Filter activities here
            loggedInUserRole={loggedInUserRole} // Pass user role
            isOwner={selectedSupplier.ownerId === loggedInUserId} // Pass ownership
          />
        )}
      </Modal>
    </div>
  );
};

export default SupplierList;