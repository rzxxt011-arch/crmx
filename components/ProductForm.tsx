import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, User, UserRole } from '../types';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { useTranslation } from '../TranslationContext';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  users: User[];
  loggedInUserRole: UserRole | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, users, loggedInUserRole }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Product>({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || ProductCategory.Other,
    sku: product?.sku || '',
    ownerId: product?.ownerId || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'price' ? parseFloat(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [id]: '' })); // Clear error on change
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = t('products.form.name_required');
    if (formData.price <= 0) newErrors.price = t('products.form.price_positive');
    if (!formData.sku.trim()) newErrors.sku = t('products.form.sku_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const categoryOptions = Object.values(ProductCategory).map((category) => ({
    value: category,
    label: category,
  }));
  
  const userOptions = users.map(user => ({
    value: user.id,
    label: user.username
  }));

  return (
    <form onSubmit={handleSubmit} className="p-4" aria-label={product ? t('products.form.edit_title') : t('products.form.add_title')}>
      <Input
        id="name"
        label={t('products.form.name_label')}
        type="text"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        aria-required="true"
      />
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('products.form.description_label')}
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      <Input
        id="price"
        label={t('products.form.price_label')}
        type="number"
        value={formData.price}
        onChange={handleChange}
        error={errors.price}
        min="0"
        step="0.01"
        aria-required="true"
      />
      <Select
        id="category"
        label={t('products.form.category_label')}
        options={categoryOptions}
        value={formData.category}
        onChange={handleChange}
      />
      <Input
        id="sku"
        label={t('products.form.sku_label')}
        type="text"
        value={formData.sku}
        onChange={handleChange}
        error={errors.sku}
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

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('products.form.cancel')}
        </Button>
        <Button type="submit" variant="primary">
          {product ? t('products.form.update_submit') : t('products.form.add_submit')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;