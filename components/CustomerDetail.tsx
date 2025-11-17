import React, { useState, useEffect } from 'react';
import { Customer, Deal, Activity, ActivityStatus, ActivityType, UserRole } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import { generateText } from '../services/geminiService';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface CustomerDetailProps {
  customer: Customer;
  // Fix: Changed prop type from string[] to actual Deal[] for meaningful summarization
  deals: Deal[];
  // Fix: Changed prop type from string[] to actual Activity[] for meaningful summarization
  activities: Activity[];
  onCreateRelatedActivity: (initialData: Partial<Activity>) => void; // New prop
  loggedInUserRole: UserRole | null; // New prop
  isOwner: boolean; // New prop
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, deals, activities, onCreateRelatedActivity, loggedInUserRole, isOwner }) => {
  const { t } = useTranslation();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>('');

  const customerDeals: Deal[] = deals;
  const customerActivities: Activity[] = activities;

  // Permissions for buttons
  const canCreateRelatedActivity = loggedInUserRole !== UserRole.Viewer && (loggedInUserRole === UserRole.Admin || isOwner);
  const canGenerateSummary = loggedInUserRole !== null; // Any logged-in user can generate a summary

  const generateCustomerSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    setAiSummary(''); // Clear previous summary

    const prompt = `Provide a concise summary of the following CRM customer data, focusing on key details, status, and any relevant notes.
    Format the summary as a professional internal report, use markdown.

    Customer Name: ${customer.name}
    Company: ${customer.company}
    Email: ${customer.email}
    Phone: ${customer.phone}
    Status: ${customer.status}
    Notes: ${customer.notes || t('customers.detail.no_specific_notes')}

    Related Deals:
    ${customerDeals.length > 0 ? customerDeals.map(d => `- Deal: ${d.name}, Value: $${d.value.toLocaleString()}, Stage: ${d.stage}, Close Date: ${d.closeDate}`).join('\n') : t('customers.detail.no_related_deals_summary')}

    Related Activities:
    ${customerActivities.length > 0 ? customerActivities.map(a => `- Activity: ${a.title}, Type: ${a.type}, Status: ${a.status}, Due: ${a.dueDate}`).join('\n') : t('customers.detail.no_related_activities_summary')}
    `;

    try {
      const summary = await generateText(prompt, { temperature: 0.7 });
      setAiSummary(summary);
    } catch (error: any) {
      setSummaryError(error.message || t('customers.detail.error_generating_summary'));
      console.error('Error generating customer summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Effect to clear summary when customer changes
  useEffect(() => {
    setAiSummary('');
    setSummaryError('');
  }, [customer]);

  const handleCreateRelatedActivity = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const newActivity: Partial<Activity> = {
      title: t('customers.detail.follow_up_title', { customerName: customer.name }),
      type: ActivityType.Task,
      status: ActivityStatus.Pending,
      dueDate: oneWeekFromNow.toISOString().split('T')[0],
      notes: t('customers.detail.follow_up_notes', { customerName: customer.name }),
      customerId: customer.id,
    };
    onCreateRelatedActivity(newActivity);
  };


  return (
    <div className="p-4" aria-labelledby="customer-detail-heading">
      <div className="mb-6 border-b pb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 id="customer-detail-heading" className="text-xl font-semibold text-gray-900">{t('customers.detail.details_title', { customerName: customer.name })}</h3>
          {canCreateRelatedActivity && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateRelatedActivity}
              aria-label={t('customers.detail.create_related_activity')}
            >
              {t('customers.detail.create_related_activity')}
            </Button>
          )}
        </div>
        <p className="text-gray-700"><strong>{t('customers.company')}:</strong> {customer.company}</p>
        <p className="text-gray-700"><strong>{t('customers.email')}:</strong> {customer.email}</p>
        <p className="text-gray-700"><strong>{t('customers.form.phone_label')}:</strong> {customer.phone}</p>
        <p className="text-gray-700"><strong>{t('customers.status')}:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
          ${customer.status === 'Active' ? 'bg-green-100 text-green-800' :
            customer.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'}`}>{customer.status}</span></p>
        <p className="text-gray-700 mt-2"><strong>{t('customers.form.notes_label')}:</strong> {customer.notes || t('common.na')}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('customers.detail.related_deals')}</h4>
        {customerDeals.length === 0 ? (
          <p className="text-gray-600">{t('customers.detail.no_related_deals')}</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700" aria-label={t('customers.detail.related_deals')}>
            {customerDeals.map(deal => (
              <li key={deal.id}>
                {deal.name} - ${deal.value.toLocaleString()} ({deal.stage}) - {t('dashboard.close_by')} {deal.closeDate}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('customers.detail.related_activities')}</h4>
        {customerActivities.length === 0 ? (
          <p className="text-gray-600">{t('customers.detail.no_related_activities')}</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700" aria-label={t('customers.detail.related_activities')}>
            {customerActivities.map(activity => (
              <li key={activity.id}>
                {activity.title} ({activity.type}, {activity.status}) - {t('dashboard.due')}: {activity.dueDate}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          {t('customers.detail.gemini_summary')}
          {canGenerateSummary && (
            <Button
              onClick={generateCustomerSummary}
              variant="outline"
              size="sm"
              className="ml-4"
              loading={isLoadingSummary}
              disabled={isLoadingSummary}
              aria-live="polite"
              aria-controls="ai-summary-content"
            >
              {aiSummary ? t('customers.detail.regenerate_summary') : t('customers.detail.generate_summary')}
            </Button>
          )}
        </h4>
        {isLoadingSummary && <LoadingSpinner />}
        {summaryError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">{t('common.error')} </strong>
            <span className="block sm:inline">{summaryError}</span>
          </div>
        )}
        {aiSummary && (
          <div id="ai-summary-content" className="bg-blue-50 p-4 rounded-md shadow-inner text-gray-800 mt-4" aria-label={t('customers.detail.gemini_summary')}>
            <MarkdownRenderer content={aiSummary} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;