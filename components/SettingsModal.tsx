import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useTranslation } from '../TranslationContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, getLabel, customLabels, setCustomLabel, resetCustomLabels } = useTranslation();

  const customizableKeys = [
    { key: 'sidebar.customers', defaultLabelKey: 'customers.title' },
    { key: 'sidebar.suppliers', defaultLabelKey: 'suppliers.title' },
    { key: 'sidebar.products', defaultLabelKey: 'products.title' }, // New customizable key
    { key: 'sidebar.deals', defaultLabelKey: 'deals.title' },
    { key: 'sidebar.activities', defaultLabelKey: 'activities.title' },
    { key: 'sidebar.campaigns', defaultLabelKey: 'campaigns.title' },
    { key: 'sidebar.commissions', defaultLabelKey: 'commissions.title' },
    { key: 'dashboard.title', defaultLabelKey: 'dashboard.title' },
  ];

  const [formLabels, setFormLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with current custom labels or default translated labels
    const initialFormState: Record<string, string> = {};
    customizableKeys.forEach(item => {
      // Use customLabels[item.key] for the actual stored custom value, fallback to t(item.defaultLabelKey) for the visual default
      initialFormState[item.key] = customLabels[item.key] || t(item.defaultLabelKey); 
    });
    setFormLabels(initialFormState);
  }, [customLabels, t, isOpen]); // Re-initialize when modal opens or customLabels change

  const handleChange = (key: string, value: string) => {
    setFormLabels(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    customizableKeys.forEach(item => {
      // If the form field is empty, remove the custom label. Otherwise, set it.
      if (formLabels[item.key].trim() === t(item.defaultLabelKey)) {
        setCustomLabel(item.key, ''); // Effectively reset to default if user enters default value
      } else {
        setCustomLabel(item.key, formLabels[item.key]);
      }
    });
    onClose();
  };

  const handleReset = () => {
    if (window.confirm(t('settings.reset_confirm'))) {
      resetCustomLabels();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.title')}
    >
      <div className="p-4">
        <p className="text-gray-700 mb-6">{t('settings.intro')}</p>

        <div className="space-y-4 mb-8">
          {customizableKeys.map(item => (
            <div key={item.key}>
              <Input
                id={`custom-label-${item.key}`}
                label={t('settings.original_label_title', { label: t(item.defaultLabelKey) })} // Display the default translated label as context
                type="text"
                value={formLabels[item.key] || ''}
                onChange={(e) => handleChange(item.key, e.target.value)}
                placeholder={t(item.defaultLabelKey)} // Placeholder is the default translated value
              />
              {customLabels[item.key] && customLabels[item.key] !== t(item.defaultLabelKey) && (
                <p className="text-sm text-blue-600 mt-1">
                  {t('settings.current_custom_label_status', { customLabel: customLabels[item.key] })}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleReset}>
            {t('settings.reset_all')}
          </Button>
          <Button variant="primary" onClick={handleApply}>
            {t('settings.apply_changes')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;