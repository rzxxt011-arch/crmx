import React, { useState, useRef, useMemo } from 'react';
import { Product, SortConfig, ProductCategory, UserRole, User } from '../types';
import Button from './Button';
import Modal from './Modal';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import Input from './Input';
import Select from './Select';
import { exportToJSON, importFromJSON } from '../utils/dataUtils';
import { useTranslation } from '../TranslationContext';

interface ProductListProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loggedInUserRole: UserRole | null; // New prop
  loggedInUserId: string | null; // New prop
  users: User[]; // New prop for owner assignment
}

const ProductList: React.FC<ProductListProps> = ({ products, onAdd, onUpdate, onDelete, setProducts, loggedInUserRole, loggedInUserId, users }) => {
  const { t, getLabel } = useTranslation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<Product>>({ key: 'name', direction: 'ascending' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdd = loggedInUserRole !== UserRole.Viewer;

  const canEdit = (product: Product) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && product.ownerId === loggedInUserId) return true;
    return false;
  };

  const canDelete = (product: Product) => {
    if (loggedInUserRole === UserRole.Admin) return true;
    if (loggedInUserRole === UserRole.Sales && product.ownerId === loggedInUserId) return true;
    return false;
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (product: Product) => {
    if (product.id) {
      onUpdate(product);
    } else {
      onAdd({ ...product, id: `prod-${Date.now()}` });
    }
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('products.confirm_delete'))) {
      onDelete(id);
    }
  };

  const handleExport = () => {
    exportToJSON(products, t('products.title').toLowerCase());
    alert(t('products.exported_success', { filename: t('products.title').toLowerCase() }));
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedProducts = await importFromJSON<Product>(file, 'prod');
        setProducts((prev) => {
          const newProducts = importedProducts.filter(
            (importedProduct) => !prev.some((existingProduct) => existingProduct.id === importedProduct.id)
          );
          // When importing, assign ownerId to the current user if not admin.
          const finalProducts = loggedInUserRole === UserRole.Admin
            ? newProducts // Admin imports as is
            : newProducts.map(prod => ({ ...prod, ownerId: prod.ownerId || loggedInUserId || undefined })); // Others get their ID if missing
          return [...prev, ...finalProducts];
        });
        alert(t('products.imported_success'));
      } catch (error: any) {
        alert(t('products.import_failed', { message: error.message }));
        console.error('Import error:', error);
      }
    }
  };
  
  const getUserName = (ownerId?: string) => {
    return users.find(u => u.id === ownerId)?.username || t('common.na');
  }

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...products];

    // Filter
    if (searchTerm) {
      sortableItems = sortableItems.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [products, searchTerm, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Product) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  const sortOptions = [
    { value: 'name-asc', label: t('products.sort_name_asc') },
    { value: 'name-desc', label: t('products.sort_name_desc') },
    { value: 'price-asc', label: t('products.sort_price_asc') },
    { value: 'price-desc', label: t('products.sort_price_desc') },
    { value: 'category-asc', label: t('products.sort_category_asc') },
    { value: 'category-desc', label: t('products.sort_category_desc') },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key: key as keyof Product, direction: direction as 'ascending' | 'descending' });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getLabel('products.title')}</h2>
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
              {t('products.add_button')}
            </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          id="search-products"
          placeholder={t('products.search_placeholder')}
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
          id="sort-products"
          label={t('products.sort_by')}
          options={sortOptions}
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={handleSortChange}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {sortedAndFilteredProducts.length === 0 && products.length > 0 ? (
            <p className="p-6 text-gray-600">{t('products.no_match_search')}</p>
        ) : sortedAndFilteredProducts.length === 0 && products.length === 0 ? (
            <p className="p-6 text-gray-600">{t('products.no_products_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('products.title')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>
                    {t('products.name')} {getSortIndicator('name')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('price')}>
                    {t('products.price')} {getSortIndicator('price')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" onClick={() => requestSort('category')}>
                    {t('products.category')} {getSortIndicator('category')}
                  </th>
                  {loggedInUserRole === UserRole.Admin && (
                    <th scope="col" className="px-3 py-2 text-left text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t('common.owner')}
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-right text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700">${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden sm:table-cell">{product.category}</td>
                    {loggedInUserRole === UserRole.Admin && (
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:px-6 sm:py-4 sm:text-sm text-gray-700 hidden md:table-cell">
                        {getUserName(product.ownerId)}
                      </td>
                    )}
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs sm:px-6 sm:py-4 sm:text-sm font-medium flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(product)} aria-label={`${t('products.view')} ${product.name}`}>
                        {t('common.view')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(product)} aria-label={`${t('products.edit')} ${product.name}`} disabled={!canEdit(product)} title={!canEdit(product) ? t('common.permission_denied_tooltip') : ''}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)} aria-label={`${t('products.delete')} ${product.name}`} disabled={!canDelete(product)} title={!canDelete(product) ? t('common.permission_denied_tooltip') : ''}>
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
        title={selectedProduct ? t('products.form.edit_title') : t('products.form.add_title')}
      >
        <ProductForm
          product={selectedProduct || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          users={users}
          loggedInUserRole={loggedInUserRole}
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedProduct ? t('products.detail.details_title', { productName: selectedProduct.name }) : t('products.detail.details_title', { productName: '' })}
      >
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductList;