import React, { useState, useEffect } from 'react';
import { Campaign, CampaignStatus, Customer, User, UserRole } from '../types';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useTranslation } from '../TranslationContext';

interface CampaignFormProps {
  campaign?: Campaign;
  customers: Customer[]; // To link customers to campaigns
  onSubmit: (campaign: Campaign) => void;
  onCancel: () => void;
  users: User[];
  loggedInUserRole: UserRole | null;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, customers, onSubmit, onCancel, users, loggedInUserRole }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Campaign>({
    id: campaign?.id || '',
    name: campaign?.name || '',
    description: campaign?.description || '',
    status: campaign?.status || CampaignStatus.Planning,
    startDate: campaign?.startDate || new Date().toISOString().split('T')[0],
    endDate: campaign?.endDate || new Date().toISOString().split('T')[0],
    linkedCustomerIds: campaign?.linkedCustomerIds || [],
    ownerId: campaign?.ownerId || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    }
  }, [campaign]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const handleCustomerSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, linkedCustomerIds: selectedOptions }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = t('campaigns.form.name_required');
    if (!formData.startDate) newErrors.startDate = t('campaigns.form.start_date_required');
    if (!formData.endDate) newErrors.endDate = t('campaigns.form.end_date_required');
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = t('campaigns.form.end_date_after_start');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const statusOptions = Object.values(CampaignStatus).map((status) => ({
    value: status,
    label: status,
  }));

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));
  
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username
  }));

  return (
    <form onSubmit={handleSubmit} className="p-4" aria-label={campaign ? t('campaigns.form.edit_title') : t('campaigns.form.add_title')}>
      <Input
        id="name"
        label={t('campaigns.form.name_label')}
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        aria-required="true"
      />
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('campaigns.form.description_label')}
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      <Select
        id="status"
        label={t('campaigns.form.status_label')}
        options={statusOptions}
        value={formData.status}
        onChange={handleChange}
      />
      <Input
        id="startDate"
        label={t('campaigns.form.start_date_label')}
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
        aria-required="true"
      />
      <Input
        id="endDate"
        label={t('campaigns.form.end_date_label')}
        type="date"
        value={formData.endDate}
        onChange={handleChange}
        error={errors.endDate}
        aria-required="true"
      />
      {loggedInUserRole === UserRole.Admin && (
        <Select
          id="ownerId"
          label={t('common.owner')}
          options={userOptions}
          value={formData.ownerId}
          onChange={handleChange}
        />
      )}
      <div className="mb-4">
        <label htmlFor="linkedCustomerIds" className="block text-sm font-medium text-gray-700">
          {t('campaigns.form.link_customers_label')}
        </label>
        <select
          id="linkedCustomerIds"
          multiple
          value={formData.linkedCustomerIds}
          onChange={handleCustomerSelection}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
          aria-label={t('campaigns.form.link_customers_label')}
        >
          {customerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {customers.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">{t('customers.no_customers_found')}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('campaigns.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {campaign ? t('campaigns.form.update_submit') : t('campaigns.form.add_submit')}
        </Button>
      </div>
    </form>
  );
};

export default CampaignForm;