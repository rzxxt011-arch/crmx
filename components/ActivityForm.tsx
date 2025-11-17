import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus, ActivityType, Customer, Deal, Supplier, User, UserRole } from '../types';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface ActivityFormProps {
  activity?: Activity;
  customers: Customer[];
  deals: Deal[];
  suppliers: Supplier[]; // New
  onSubmit: (activity: Activity) => void;
  onCancel: () => void;
  users: User[];
  loggedInUserRole: UserRole | null;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, customers, deals, suppliers, onSubmit, onCancel, users, loggedInUserRole }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Activity>({
    id: activity?.id || '',
    title: activity?.title || '',
    type: activity?.type || ActivityType.Task,
    status: activity?.status || ActivityStatus.Pending,
    dueDate: activity?.dueDate || new Date().toISOString().split('T')[0],
    notes: activity?.notes || '',
    customerId: activity?.customerId || '',
    dealId: activity?.dealId || '',
    supplierId: activity?.supplierId || '', // New
    ownerId: activity?.ownerId || '', // Added for multi-user support
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    }
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value === '' ? undefined : value })); // Set to undefined if empty string for optional fields
    setErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = t('activities.form.title_required');
    if (!formData.dueDate) newErrors.dueDate = t('activities.form.due_date_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const typeOptions = Object.values(ActivityType).map((type) => ({
    value: type,
    label: type, // Enum values not translated here
  }));

  const statusOptions = Object.values(ActivityStatus).map((status) => ({
    value: status,
    label: status, // Enum values not translated here
  }));

  const customerOptions = [{ value: '', label: t('activities.form.select_customer_optional') }, ...customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }))];

  const dealOptions = [{ value: '', label: t('activities.form.select_deal_optional') }, ...deals.map((deal) => ({
    value: deal.id,
    label: deal.name,
  }))];

  const supplierOptions = [{ value: '', label: t('activities.form.select_supplier_optional') }, ...suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
  }))];
  
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username
  }));

  return (
    <form onSubmit={handleSubmit} className="p-4" aria-label={activity ? t('activities.form.edit_title') : t('activities.form.add_title')}>
      <Input
        id="title"
        label={t('activities.form.title_label')}
        type="text"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        aria-required="true"
      />
      <Select
        id="type"
        label={t('activities.form.type_label')}
        options={typeOptions}
        value={formData.type}
        onChange={handleChange}
      />
      <Select
        id="status"
        label={t('activities.form.status_label')}
        options={statusOptions}
        value={formData.status}
        onChange={handleChange}
      />
      <Input
        id="dueDate"
        label={t('activities.form.due_date_label')}
        type="date"
        value={formData.dueDate}
        onChange={handleChange}
        error={errors.dueDate}
        aria-required="true"
      />
      <Select
        id="customerId"
        label={t('activities.form.related_customer_label')}
        options={customerOptions}
        value={formData.customerId}
        onChange={handleChange}
      />
      <Select
        id="dealId"
        label={t('activities.form.related_deal_label')}
        options={dealOptions}
        value={formData.dealId}
        onChange={handleChange}
      />
      <Select
        id="supplierId"
        label={t('activities.form.related_supplier_label')}
        options={supplierOptions}
        value={formData.supplierId}
        onChange={handleChange}
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
          {t('activities.form.notes_label')}
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
          {t('activities.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {activity ? t('activities.form.update_submit') : t('activities.form.add_submit')}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;