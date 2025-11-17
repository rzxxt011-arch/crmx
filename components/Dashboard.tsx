import React from 'react';
import { Activity, Customer, Deal, ActivityStatus, DealStage } from '../types';
import { DEAL_STAGE_PROBABILITIES } from '../constants'; // Import probabilities
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface DashboardProps {
  customers: Customer[];
  deals: Deal[];
  activities: Activity[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, deals, activities }) => {
  const { t } = useTranslation();

  const totalCustomers = customers.length;
  const activeDeals = deals.filter(deal => deal.stage !== DealStage.Won && deal.stage !== DealStage.Lost).length;
  const pendingActivities = activities.filter(activity => activity.status === ActivityStatus.Pending).length;
  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  // Calculate Deal Forecast
  const dealForecast = deals.reduce((sum, deal) => {
    if (deal.stage === DealStage.Won || deal.stage === DealStage.Lost) {
      return sum; // Won deals are already revenue, lost deals are 0
    }
    const probability = DEAL_STAGE_PROBABILITIES[deal.stage] || 0;
    return sum + (deal.value * probability);
  }, 0);

  const upcomingActivities = activities
    .filter(activity => activity.status === ActivityStatus.Pending)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5); // Show top 5 upcoming

  const recentDeals = deals
    .filter(deal => deal.stage === DealStage.Won)
    .sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())
    .slice(0, 5); // Show top 5 recent won deals

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || t('common.na');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="total-customers-heading">
          <h3 id="total-customers-heading" className="text-lg font-medium text-gray-600 mb-2">{t('dashboard.total_customers')}</h3>
          <p className="text-4xl font-extrabold text-blue-600">{totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="active-deals-heading">
          <h3 id="active-deals-heading" className="text-lg font-medium text-gray-600 mb-2">{t('dashboard.active_deals')}</h3>
          <p className="text-4xl font-extrabold text-green-600">{activeDeals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="pending-activities-heading">
          <h3 id="pending-activities-heading" className="text-lg font-medium text-gray-600 mb-2">{t('dashboard.pending_activities')}</h3>
          <p className="text-4xl font-extrabold text-yellow-600">{pendingActivities}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="total-deal-value-heading">
          <h3 id="total-deal-value-heading" className="text-lg font-medium text-gray-600 mb-2">{t('dashboard.total_deal_value')}</h3>
          <p className="text-4xl font-extrabold text-purple-600">${totalDealValue.toLocaleString()}</p>
        </div>
        {/* New Deal Forecast Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="deal-forecast-heading">
          <h3 id="deal-forecast-heading" className="text-lg font-medium text-gray-600 mb-2">{t('dashboard.deal_forecast')}</h3>
          <p className="text-4xl font-extrabold text-indigo-600">${dealForecast.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="upcoming-activities-heading">
          <h3 id="upcoming-activities-heading" className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.upcoming_activities')}</h3>
          {upcomingActivities.length === 0 ? (
            <p className="text-gray-500">{t('dashboard.no_upcoming_activities')}</p>
          ) : (
            <ul aria-label={t('dashboard.upcoming_activities')}>
              {upcomingActivities.map(activity => (
                <li key={activity.id} className="mb-3 p-3 border-b border-gray-100 last:border-b-0">
                  <p className="font-semibold text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600">
                    {t('dashboard.due')}: {activity.dueDate} | {t('dashboard.type')}: {activity.type}
                    {activity.customerId && ` | ${t('dashboard.customer')}: ${getCustomerName(activity.customerId)}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200" aria-labelledby="recently-won-deals-heading">
          <h3 id="recently-won-deals-heading" className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.recent_won_deals')}</h3>
          {recentDeals.length === 0 ? (
            <p className="text-gray-500">{t('dashboard.no_recent_won_deals')}</p>
          ) : (
            <ul aria-label={t('dashboard.recent_won_deals')}>
              {recentDeals.map(deal => (
                <li key={deal.id} className="mb-3 p-3 border-b border-gray-100 last:border-b-0">
                  <p className="font-semibold text-gray-800">{deal.name}</p>
                  <p className="text-sm text-gray-600">
                    {t('dashboard.value')}: ${deal.value.toLocaleString()} | {t('dashboard.won')}: {deal.closeDate} | {t('dashboard.customer')}: ${getCustomerName(deal.customerId)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;