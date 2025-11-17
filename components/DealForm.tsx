import React, { useState, useEffect } from 'react';
import { Deal, DealStage, Customer, User, UserRole } from '../types';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface DealFormProps {
  deal?: Deal;
  customers: Customer[];
  onSubmit: (deal: Deal) => void;
  onCancel: () => void;
  users: User[];
  loggedInUserRole: UserRole | null;
}

const DealForm: React.FC<DealFormProps> = ({ deal, customers, onSubmit, onCancel, users, loggedInUserRole }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Deal>({
    id: deal?.id || '',
    name: deal?.name || '',
    customerId: deal?.customerId || (customers.length > 0 ? customers[0].id : ''),
    value: deal?.value || 0,
    stage: deal?.stage || DealStage.Prospecting,
    closeDate: deal?.closeDate || new Date().toISOString().split('T')[0],
    notes: deal?.notes || '',
    ownerId: deal?.ownerId || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (deal) {
      setFormData(deal);
    }
  }, [deal]);

  useEffect(() => {
    // If no customer is selected and customers become available, set a default
    if (!formData.customerId && customers.length > 0) {
      setFormData(prev => ({ ...prev, customerId: customers[0].id }));
    }
  }, [customers, formData.customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: id === 'value' ? parseFloat(value) || 0 : value }));
    setErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = t('deals.form.deal_name_required');
    if (!formData.customerId) newErrors.customerId = t('deals.form.customer_required');
    if (formData.value <= 0) newErrors.value = t('deals.form.value_positive');
    if (!formData.closeDate) newErrors.closeDate = t('deals.form.close_date_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const stageOptions = Object.values(DealStage).map((stage) => ({
    value: stage,
    label: stage, // Enum values not translated here
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
    <form onSubmit={handleSubmit} className="p-4" aria-label={deal ? t('deals.form.edit_title') : t('deals.form.add_title')}>
      <Input
        id="name"
        label={t('deals.form.deal_name_label')}
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        aria-required="true"
      />
      <Select
        id="customerId"
        label={t('deals.form.customer_label')}
        options={customerOptions}
        value={formData.customerId}
        onChange={handleChange}
        error={errors.customerId}
        disabled={customers.length === 0}
        aria-required="true"
      />
      {customers.length === 0 && (
        <p className="text-sm text-red-500 mb-4" role="alert">{t('deals.form.no_customer_message')}</p>
      )}
      <Input
        id="value"
        label={t('deals.form.value_label')}
        type="number"
        value={formData.value}
        onChange={handleChange}
        error={errors.value}
        min="0"
        step="0.01"
        aria-required="true"
      />
      <Select
        id="stage"
        label={t('deals.form.stage_label')}
        options={stageOptions}
        value={formData.stage}
        onChange={handleChange}
      />
      <Input
        id="closeDate"
        label={t('deals.form.close_date_label')}
        type="date"
        value={formData.closeDate}
        onChange={handleChange}
        error={errors.closeDate}
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
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          {t('deals.form.notes_label')}
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('deals.form.cancel')}
        </Button>
        <Button type="submit" variant="primary" disabled={customers.length === 0}>
          {deal ? t('deals.form.update_submit') : t('deals.form.add_submit')}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;