import React, { useState, useEffect } from 'react';
import { Deal, Activity, UserRole } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import { generateText } from '../services/geminiService';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface DealDetailProps {
  deal: Deal;
  customerName: string;
  activities: Activity[]; // Should be already filtered activities for this deal
  loggedInUserRole?: UserRole | null; // New prop, made optional for flexibility
  isOwner?: boolean; // New prop, made optional for flexibility
}

const DealDetail: React.FC<DealDetailProps> = ({ deal, customerName, activities, loggedInUserRole = null, isOwner = false }) => {
  const { t } = useTranslation();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>('');

  const canGenerateSummary = loggedInUserRole !== null; // Any logged-in user can generate a summary

  const generateDealSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    setAiSummary(''); // Clear previous summary

    // NOTE: For best AI results, the core prompt is kept in English.
    // However, the labels within the prompt use the translated/customized terms.
    const prompt = `Provide a concise summary of the following CRM deal data, focusing on key details, current stage, value, and any relevant notes.
    Format the summary as a professional internal report, use markdown.

    Deal Name: ${deal.name}
    Customer: ${customerName}
    Value: $${deal.value.toLocaleString()}
    Stage: ${deal.stage}
    Expected Close Date: ${deal.closeDate}
    Notes: ${deal.notes || t('deals.detail.no_specific_notes')}

    Related Activities:
    ${activities.length > 0 ? activities.map(a => `- Activity: ${a.title}, Type: ${a.type}, Status: ${a.status}, Due: ${a.dueDate}`).join('\n') : t('deals.detail.no_related_activities_summary')}
    `;

    try {
      const summary = await generateText(prompt, { temperature: 0.7 });
      setAiSummary(summary);
    } catch (error: any) {
      setSummaryError(error.message || t('deals.detail.error_generating_summary'));
      console.error('Error generating deal summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Effect to clear summary when deal changes
  useEffect(() => {
    setAiSummary('');
    setSummaryError('');
  }, [deal]);

  return (
    <div className="p-4" aria-labelledby="deal-detail-heading">
      <div className="mb-6 border-b pb-4">
        <h3 id="deal-detail-heading" className="text-xl font-semibold text-gray-900 mb-3">{t('deals.detail.details_title', { dealName: deal.name })}</h3>
        <p className="text-gray-700"><strong>{t('deals.customer')}:</strong> {customerName}</p>
        <p className="text-gray-700"><strong>{t('deals.value')}:</strong> ${deal.value.toLocaleString()}</p>
        <p className="text-gray-700"><strong>{t('deals.stage')}:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
          ${deal.stage === 'Won' ? 'bg-green-100 text-green-800' :
            deal.stage === 'Lost' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'}`}>{deal.stage}</span></p>
        <p className="text-gray-700"><strong>{t('deals.close_date')}:</strong> {deal.closeDate}</p>
        <p className="text-gray-700 mt-2"><strong>{t('deals.form.notes_label')}:</strong> {deal.notes || t('common.na')}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('deals.detail.related_activities')}</h4>
        {activities.length === 0 ? (
          <p className="text-gray-600">{t('deals.detail.no_related_activities')}</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700" aria-label={t('deals.detail.related_activities')}>
            {activities.map(activity => (
              <li key={activity.id}>
                {activity.title} ({activity.type}, {activity.status}) - {t('dashboard.due')}: {activity.dueDate}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          {t('deals.detail.gemini_summary')}
          {canGenerateSummary && (
            <Button
              onClick={generateDealSummary}
              variant="outline"
              size="sm"
              className="ml-4"
              loading={isLoadingSummary}
              disabled={isLoadingSummary}
              aria-live="polite"
              aria-controls="ai-summary-content"
            >
              {aiSummary ? t('deals.detail.regenerate_summary') : t('deals.detail.generate_summary')}
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
          <div id="ai-summary-content" className="bg-blue-50 p-4 rounded-md shadow-inner text-gray-800 mt-4" aria-label={t('deals.detail.gemini_summary')}>
            <MarkdownRenderer content={aiSummary} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetail;