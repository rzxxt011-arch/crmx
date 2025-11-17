import React, { useState, useRef, useMemo } from 'react';
import { Campaign, Customer, SortConfig, CampaignStatus, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import CampaignForm from './CampaignForm';
import CampaignDetail from './CampaignDetail';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext';

interface CampaignListProps {
  campaigns: Campaign[];
  customers: Customer[];
  onAdd: (campaign: Campaign) => void;
  onUpdate: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, customers, onAdd, onUpdate, onDelete, setCampaigns, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Campaign>>({ key: 'name', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (campaign: Campaign) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && campaign.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (campaign: Campaign) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && campaign.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = () => {
    setSelectedCampaign(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (campaign: Campaign) => {
    if (campaign.id) {
      onUpdate(campaign);
    } else {
      onAdd({ ...campaign, id: `camp-${Date.now()}` });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('campaigns.confirm_delete'))) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    exportToJSON(campaigns, t('campaigns.title').toLowerCase());
    alert(t('campaigns.exported_success', { filename: t('campaigns.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedCampaigns = await importFromJSON<Campaign>(file, 'camp');
        setCampaigns((prev) => {
          const newCampaigns = importedCampaigns.filter(
            (importedCampaign) => !prev.some((existingCampaign) => existingCampaign.id === importedCampaign.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalCampaigns = loggedInUserRole === UserRole.Admin
            ? newCampaigns // Admin imports as is
            : newCampaigns.map(camp => ({ ...camp, ownerId: camp.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalCampaigns];
        });
        alert(t('campaigns.imported_success'));
      } catch (error: any) {
        alert(t('campaigns.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const sortedAndFilteredCampaigns = useMemo(() => {
    let sortableItems = [...campaigns];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.linkedCustomerIds.some(customerId =>
            customers.find(c => c.id === customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
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
  }, [campaigns, searchTerm, sortConfig, customers]);

  const requestSort = (key: keyof Campaign) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Campaign) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  const sortOptions = [
    { value: 'name-asc', label: t('campaigns.sort_name_asc') },
    { value: 'name-desc', label: t('campaigns.sort_name_desc') },
    { value: 'status-asc', label: t('campaigns.sort_status_asc') },
    { value: 'status-desc', label: t('campaigns.sort_status_desc') },
    { value: 'startDate-asc', label: t('campaigns.sort_start_date_asc') },
    { value: 'startDate-desc', label: t('campaigns.sort_start_date_desc') },
    { value: 'endDate-asc', label: t('campaigns.sort_end_date_asc') },
    { value: 'endDate-desc', label: t('campaigns.sort_end_date_desc') },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Campaign, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('campaigns.title')}</h2>
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
              {t('campaigns.add_button')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-campaigns"
          placeholder={t('campaigns.search_placeholder')}
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
          id="sort-campaigns"
          label={t('campaigns.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredCampaigns.length === 0 && campaigns.length > 0 ? (
            <p className="p-6 text-gray-600">{t('campaigns.no_match_search')}</p>
        ) : sortedAndFilteredCampaigns.length === 0 && campaigns.length === 0 ? (
            <p className="p-6 text-gray-600">{t('campaigns.no_campaigns_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('campaigns.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    {t('campaigns.name')} {getSortIndicator('name')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                    {t('campaigns.status')} {getSortIndicator('status')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" onClick={() => requestSort('startDate')}>
                    {t('campaigns.start_date')} {getSortIndicator('startDate')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('campaigns.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden sm:table-cell">{campaign.startDate}</td>
                    {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(campaign.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(campaign)} aria-label={`${t('campaigns.view')} ${campaign.name}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(campaign)} aria-label={`${t('campaigns.edit')} ${campaign.name}`} disabled={!canEdit(campaign)} title={!canEdit(campaign) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(campaign.id)} aria-label={`${t('campaigns.delete')} ${campaign.name}`} disabled={!canDelete(campaign)} title={!canDelete(campaign) ? t('common.permission_denied_tooltip') : ''}>
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
        title={selectedCampaign ? t('campaigns.form.edit_title') : t('campaigns.form.add_title')}
      >
        <CampaignForm
          campaign={selectedCampaign || undefined}
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
        title={selectedCampaign ? t('campaigns.detail.details_title', { campaignName: selectedCampaign.name }) : t('campaigns.detail.details_title', { campaignName: '' })}
      >
        {selectedCampaign && (
          <CampaignDetail
            campaign={selectedCampaign}
            customers={customers}
          />
        )}
      </Modal>
    </div>
  );
};

export default CampaignList;