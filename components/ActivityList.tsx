import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Activity, Customer, Deal, Supplier, SortConfig, ActivityType, ActivityStatus, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import ActivityForm from './ActivityForm';
import MarkdownRenderer from './MarkdownRenderer';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface ActivityListProps {
  activities: Activity[];
  customers: Customer[];
  deals: Deal[];
  suppliers: Supplier[]; // New
  onAdd: (activity: Activity) => void;
  onUpdate: (activity: Activity) => void;
  onDelete: (id: string) => void;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>; // To update state directly after import
  pendingActivityCreation: Partial<Activity> | null; // New prop from App.tsx
  onPendingActivityHandled: () => void; // New prop to signal App.tsx
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, customers, deals, suppliers, onAdd, onUpdate, onDelete, setActivities, pendingActivityCreation, onPendingActivityHandled, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [prefilledActivityForForm, setPrefilledActivityForForm] = useState<Partial<Activity> | null>(null); // New state for pre-filling form
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Activity>>({ key: 'dueDate', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (activity: Activity) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && activity.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (activity: Activity) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && activity.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = (initialData: Partial<Activity> | null = null) => {
    if (initialData) {
      setPrefilledActivityForForm({ ...initialData, id: '' });
    } else {
      setPrefilledActivityForForm(null);
    }
    setSelectedActivity(null);
    setIsFormModalOpen(true);
  };

  // Effect to handle pending activity creation from other components
  useEffect(() => {
    if (pendingActivityCreation) {
      handleOpenAddModal(pendingActivityCreation);
      onPendingActivityHandled(); // Signal to App.tsx that it has been handled
    }
  }, [pendingActivityCreation, onPendingActivityHandled]); // Removed handleOpenAddModal from deps as it's a stable function

  const handleOpenEditModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setPrefilledActivityForForm(null); // Clear any pre-fill data
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleNewRelatedActivity = (initialData: Partial<Activity>) => {
    setIsDetailModalOpen(false); // Close detail modal first
    handleOpenAddModal(initialData); // Open form modal with pre-filled data
  };

  const handleFormSubmit = (activity: Activity) => {
    if (activity.id) {
      onUpdate(activity);
    } else {
      onAdd({ ...activity, id: `act-${Date.now()}` });
    }
    setIsFormModalOpen(false);
    setPrefilledActivityForForm(null); // Clear pre-fill data after submission
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('activities.confirm_delete'))) {
      onDelete(id);
    }
  };

  const getCustomerName = (customerId?: string) => {
    return customerId ? customers.find(c => c.id === customerId)?.name || t('common.na') : t('common.na');
  };

  const getDealName = (dealId?: string) => {
    return dealId ? deals.find(d => d.id === dealId)?.name || t('common.na') : t('common.na');
  };

  const getSupplierName = (supplierId?: string) => {
    return supplierId ? suppliers.find(s => s.id === supplierId)?.name || t('common.na') : t('common.na');
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const handleExport = () => {
    exportToJSON(activities, t('activities.title').toLowerCase());
    alert(t('activities.exported_success', { filename: t('activities.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedActivities = await importFromJSON<Activity>(file, 'act');
        setActivities((prev) => {
          const newActivities = importedActivities.filter(
            (importedActivity) => !prev.some((existingActivity) => existingActivity.id === importedActivity.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalActivities = loggedInUserRole === UserRole.Admin
            ? newActivities // Admin imports as is
            : newActivities.map(act => ({ ...act, ownerId: act.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalActivities];
        });
        alert(t('activities.imported_success'));
      } catch (error: any) {
        alert(t('activities.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };

  const sortedAndFilteredActivities = useMemo(() => {
    let sortableItems = [...activities];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activity.customerId && getCustomerName(activity.customerId).toLowerCase().includes(searchTerm.toLowerCase())) ||
          (activity.dealId && getDealName(activity.dealId).toLowerCase().includes(searchTerm.toLowerCase())) ||
          (activity.supplierId && getSupplierName(activity.supplierId).toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [activities, searchTerm, sortConfig, customers, deals, suppliers, t]);

  const requestSort = (key: keyof Activity) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Activity) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  const sortOptions = useMemo(() => [
    { value: 'dueDate-asc', label: t('activities.sort_due_date_asc') },
    { value: 'dueDate-desc', label: t('activities.sort_due_date_desc') },
    { value: 'title-asc', label: t('activities.sort_title_asc') },
    { value: 'title-desc', label: t('activities.sort_title_desc') },
    { value: 'type-asc', label: t('activities.sort_type_asc') },
    { value: 'type-desc', label: t('activities.sort_type_desc') },
    { value: 'status-asc', label: t('activities.sort_status_asc') },
    { value: 'status-desc', label: t('activities.sort_status_desc') },
  ], [t]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Activity, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('activities.title')}</h2>
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
            <Button variant="primary" onClick={() => handleOpenAddModal()} disabled={!canAdd} title={!canAdd ? t('common.permission_denied_tooltip') : ''}>
              {t('activities.add_button')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-activities"
          placeholder={t('activities.search_placeholder')}
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
          id="sort-activities"
          label={t('activities.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredActivities.length === 0 && activities.length > 0 ? (
            <p className="p-6 text-gray-600">{t('activities.no_match_search')}</p>
        ) : sortedAndFilteredActivities.length === 0 && activities.length === 0 ? (
            <p className="p-6 text-gray-600">{t('activities.no_activities_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('activities.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('title')}>
                    {t('activities.activity_title')} {getSortIndicator('title')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('dueDate')}>
                    {t('activities.due_date')} {getSortIndicator('dueDate')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    {t('activities.related_to')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('activities.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{activity.title}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700">{activity.dueDate}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden sm:table-cell">
                      {activity.customerId && `${t('activities.customer')}: ${getCustomerName(activity.customerId)}`}
                      {activity.customerId && activity.dealId && <br/>}
                      {activity.dealId && `${t('activities.deal')}: ${getDealName(activity.dealId)}`}
                      {(activity.customerId || activity.dealId) && activity.supplierId && <br/>}
                      {activity.supplierId && `${t('activities.supplier')}: ${getSupplierName(activity.supplierId)}`}
                    </td>
                    {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(activity.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(activity)} aria-label={`${t('activities.view')} ${activity.title}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(activity)} aria-label={`${t('activities.edit')} ${activity.title}`} disabled={!canEdit(activity)} title={!canEdit(activity) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(activity.id)} aria-label={`${t('activities.delete')} ${activity.title}`} disabled={!canDelete(activity)} title={!canDelete(activity) ? t('common.permission_denied_tooltip') : ''}>
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
        onClose={() => { setIsFormModalOpen(false); setPrefilledActivityForForm(null); }} // Clear pre-fill on close
        title={selectedActivity ? t('activities.form.edit_title') : t('activities.form.add_title')}
      >
        <ActivityForm
          activity={selectedActivity || (prefilledActivityForForm as Activity) || undefined}
          customers={customers}
          deals={deals}
          suppliers={suppliers} // New
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormModalOpen(false); setPrefilledActivityForForm(null); }} // Clear pre-fill on cancel
          users={users}
          loggedInUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedActivity ? t('activities.detail.details_title', { activityTitle: selectedActivity.title }) : t('activities.detail.details_title', { activityTitle: '' })}
      >
        {selectedActivity && (
          <div className="p-4" aria-labelledby="activity-detail-heading">
            <div className="flex justify-between items-center mb-3">
              <h3 id="activity-detail-heading" className="text-xl font-semibold text-gray-900">{selectedActivity.title}</h3>
              {(loggedInUserRole === UserRole.Admin || (loggedInUserRole === UserRole.Sales && selectedActivity.ownerId === loggedInUserId)) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const oneWeekFromNow = new Date();
                    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
                    const newActivity: Partial<Activity> = {
                      title: t('activities.detail.follow_up_title', { title: selectedActivity.title }),
                      type: ActivityType.Task,
                      status: ActivityStatus.Pending,
                      dueDate: oneWeekFromNow.toISOString().split('T')[0],
                      notes: t('activities.detail.follow_up_notes', { title: selectedActivity.title }),
                      customerId: selectedActivity.customerId,
                      dealId: selectedActivity.dealId,
                      supplierId: selectedActivity.supplierId,
                    };
                    handleNewRelatedActivity(newActivity);
                  }}
                >
                  {t('activities.detail.create_related_activity')}
                </Button>
              )}
            </div>
            
            <p className="text-gray-700"><strong>{t('activities.type')}:</strong> {selectedActivity.type}</p>
            <p className="text-gray-700"><strong>{t('activities.status')}:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
              ${selectedActivity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                selectedActivity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'}`}>{selectedActivity.status}</span></p>
            <p className="text-gray-700"><strong>{t('activities.due_date')}:</strong> {selectedActivity.dueDate}</p>
            <p className="text-gray-700"><strong>{t('activities.form.related_customer_label')}:</strong> {getCustomerName(selectedActivity.customerId)}</p>
            <p className="text-gray-700"><strong>{t('activities.form.related_deal_label')}:</strong> {getDealName(selectedActivity.dealId)}</p>
            <p className="text-gray-700"><strong>{t('activities.form.related_supplier_label')}:</strong> {getSupplierName(selectedActivity.supplierId)}</p>
            <div className="mt-4">
              <strong className="block text-gray-700 mb-1">{t('activities.detail.notes')}:</strong>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                {selectedActivity.notes ? <MarkdownRenderer content={selectedActivity.notes} /> : <p className="text-gray-600">{t('activities.detail.na')}</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityList;