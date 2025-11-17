import React from 'react';
import { Campaign, Customer } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { useTranslation } from '../TranslationContext';

interface CampaignDetailProps {
  campaign: Campaign;
  customers: Customer[]; // All customers to resolve linked customer names
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, customers }) => {
  const { t } = useTranslation();

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || t('common.na');
  };

  const linkedCustomerNames = campaign.linkedCustomerIds.map(getCustomerName);

  return (
    <div className="p-4" aria-labelledby="campaign-detail-heading">
      <div className="mb-6 border-b pb-4">
        <h3 id="campaign-detail-heading" className="text-xl font-semibold text-gray-900 mb-3">{t('campaigns.detail.details_title', { campaignName: campaign.name })}</h3>
        <p className="text-gray-700"><strong>{t('campaigns.description')}:</strong> {campaign.description ? <MarkdownRenderer content={campaign.description} /> : t('campaigns.detail.no_specific_notes')}</p>
        <p className="text-gray-700"><strong>{t('campaigns.status')}:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
          ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'}`}>{campaign.status}</span></p>
        <p className="text-gray-700"><strong>{t('campaigns.start_date')}:</strong> {campaign.startDate}</p>
        <p className="text-gray-700"><strong>{t('campaigns.end_date')}:</strong> {campaign.endDate}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('campaigns.detail.related_customers')}</h4>
        {linkedCustomerNames.length === 0 ? (
          <p className="text-gray-600">{t('campaigns.detail.no_related_customers')}</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700" aria-label={t('campaigns.detail.related_customers')}>
            {linkedCustomerNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;