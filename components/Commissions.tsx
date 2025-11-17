import React from 'react';
import { Deal, Customer, DealStage, UserRole } from '../types';
import Input from './Input';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface CommissionsProps {
  deals: Deal[];
  customers: Customer[];
  commissionRate: number;
  setCommissionRate: React.Dispatch<React.SetStateAction<number>>;
  loggedInUserRole: UserRole | null; // New prop
}

const Commissions: React.FC<CommissionsProps> = ({ deals, customers, commissionRate, setCommissionRate, loggedInUserRole }) => {
  const { t, getLabel } = useTranslation();

  const wonDeals = deals.filter(deal => deal.stage === DealStage.Won);

  const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const totalCommission = totalWonValue * commissionRate;

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || t('common.na');
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setCommissionRate(value);
    } else if (e.target.value === '') {
      setCommissionRate(0); // Allow clearing the input temporarily
    }
  };

  const canEditCommissionRate = loggedInUserRole === UserRole.Admin;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold text-gray-800">{getLabel('commissions.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="total-won-value-heading">
          <h3 id="total-won-value-heading" className="text-lg font-medium text-gray-600 mb-2">{t('commissions.total_won_value')}</h3>
          <p className="text-4xl font-extrabold text-green-600">${totalWonValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="total-commission-heading">
          <h3 id="total-commission-heading" className="text-lg font-medium text-gray-600 mb-2">{t('commissions.total_commission')}</h3>
          <p className="text-4xl font-extrabold text-purple-600">${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8" aria-labelledby="commission-rate-setting">
        <h3 id="commission-rate-setting" className="text-xl font-semibold text-gray-800 mb-4">{t('commissions.set_rate')}</h3>
        <Input
          id="commission-rate"
          label={t('commissions.rate_label')}
          type="number"
          value={commissionRate}
          onChange={handleRateChange}
          min="0"
          max="1"
          step="0.01"
          className="max-w-xs"
          aria-label={t('commissions.rate_label')}
          disabled={!canEditCommissionRate} // Disable if not admin
        />
        <p className="text-sm text-gray-600 mt-2">{t('commissions.current_rate', { rate: (commissionRate * 100).toFixed(0) })}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('commissions.won_deals_commissions')}</h3>
        {wonDeals.length === 0 ? (
          <p className="text-gray-500">{t('commissions.no_won_deals')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label={t('commissions.won_deals_commissions')}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('commissions.deal_name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('commissions.customer')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('commissions.deal_value')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('commissions.commission')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wonDeals.map(deal => (
                  <tr key={deal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deal.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getCustomerName(deal.customerId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${deal.value.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">${(deal.value * commissionRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commissions;