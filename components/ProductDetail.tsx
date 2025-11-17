import React from 'react';
import { Product } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { useTranslation } from '../TranslationContext';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4" aria-labelledby="product-detail-heading">
      <div className="mb-6 border-b pb-4">
        <h3 id="product-detail-heading" className="text-xl font-semibold text-gray-900 mb-3">{t('products.detail.details_title', { productName: product.name })}</h3>
        <p className="text-gray-700"><strong>{t('products.name')}:</strong> {product.name}</p>
        <p className="text-gray-700"><strong>{t('products.form.description_label')}:</strong> {product.description ? <MarkdownRenderer content={product.description} /> : t('products.detail.no_specific_notes')}</p>
        <p className="text-gray-700"><strong>{t('products.price')}:</strong> ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-gray-700"><strong>{t('products.category')}:</strong> {product.category}</p>
        <p className="text-gray-700"><strong>{t('products.sku')}:</strong> {product.sku}</p>
      </div>
    </div>
  );
};

export default ProductDetail;