import React, { useState, useEffect } from 'react';
import { Supplier, SupplierStatus, User, UserRole } from '../types';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (supplier: Supplier) => void;
  onCancel: () => void;
  users: User[];
  loggedInUserRole: UserRole | null;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel, users, loggedInUserRole }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Supplier>({
    id: supplier?.id || '',
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    company: supplier?.company || '',
    status: supplier?.status || SupplierStatus.Active,
    notes: supplier?.notes || '',
    ownerId: supplier?.ownerId || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    }
  }, [supplier]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = t('suppliers.form.name_required');
    if (!formData.contactPerson.trim()) newErrors.contactPerson = t('suppliers.form.contact_person_required');
    if (!formData.email.trim()) newErrors.email = t('suppliers.form.email_required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('suppliers.form.email_invalid');
    if (!formData.company.trim()) newErrors.company = t('suppliers.form.company_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const statusOptions = Object.values(SupplierStatus).map((status) => ({
    value: status,
    label: status, // Enum values not translated here
  }));

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username
  }));

  return (
    <form onSubmit={handleSubmit} className="p-4" aria-label={supplier ? t('suppliers.form.edit_title') : t('suppliers.form.add_title')}>
      <Input
        id="name"
        label={t('suppliers.form.name_label')}
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        aria-required="true"
      />
      <Input
        id="contactPerson"
        label={t('suppliers.form.contact_person_label')}
        type="text"
        value={formData.contactPerson}
        onChange={handleChange}
        error={errors.contactPerson}
        aria-required="true"
      />
      <Input
        id="email"
        label={t('suppliers.form.email_label')}
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        aria-required="true"
      />
      <Input
        id="phone"
        label={t('suppliers.form.phone_label')}
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      <Input
        id="company"
        label={t('suppliers.form.company_label')}
        type="text"
        value={formData.company}
        onChange={handleChange}
        error={errors.company}
        aria-required="true"
      />
      <Select
        id="status"
        label={t('suppliers.form.status_label')}
        options={statusOptions}
        value={formData.status}
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
          {t('suppliers.form.notes_label')}
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
          {t('suppliers.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {supplier ? t('suppliers.form.update_submit') : t('suppliers.form.add_submit')}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;