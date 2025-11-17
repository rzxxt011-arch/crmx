import React, { useState, useEffect } from 'react';
import { Supplier, Activity, UserRole } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import MarkdownRenderer from './MarkdownRenderer';
import { generateText } from '../services/geminiService';
import { useTranslation } from '../TranslationContext'; // Import useTranslation

interface SupplierDetailProps {
  supplier: Supplier;
  activities: Activity[]; // Should be already filtered activities for this supplier
  loggedInUserRole: UserRole | null; // New prop
  isOwner: boolean; // New prop
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier, activities, loggedInUserRole, isOwner }) => {
  const { t } = useTranslation();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string>('');

  const canGenerateSummary = loggedInUserRole !== null; // Any logged-in user can generate a summary

  const generateSupplierSummary = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    setAiSummary(''); // Clear previous summary

    // NOTE: For best AI results, the core prompt is kept in English.
    // However, the labels within the prompt use the translated/customized terms.
    const prompt = `Provide a concise summary of the following CRM supplier data, focusing on key details, contact information, status, and any relevant notes.
    Format the summary as a professional internal report, use markdown.

    Supplier Name: ${supplier.name}
    Company: ${supplier.company}
    Contact Person: ${supplier.contactPerson}
    Email: ${supplier.email}
    Phone: ${supplier.phone}
    Status: ${supplier.status}
    Notes: ${supplier.notes || t('suppliers.detail.no_specific_notes')}

    Related Activities:
    ${activities.length > 0 ? activities.map(a => `- Activity: ${a.title}, Type: ${a.type}, Status: ${a.status}, Due: ${a.dueDate}`).join('\n') : t('suppliers.detail.no_related_activities_summary')}
    `;

    try {
      const summary = await generateText(prompt, { temperature: 0.7 });
      setAiSummary(summary);
    } catch (error: any) {
      setSummaryError(error.message || t('suppliers.detail.error_generating_summary'));
      console.error('Error generating supplier summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Effect to clear summary when supplier changes
  useEffect(() => {
    setAiSummary('');
    setSummaryError('');
  }, [supplier]);

  return (
    <div className="p-4" aria-labelledby="supplier-detail-heading">
      <div className="mb-6 border-b pb-4">
        <h3 id="supplier-detail-heading" className="text-xl font-semibold text-gray-900 mb-3">{t('suppliers.detail.details_title', { supplierName: supplier.name })}</h3>
        <p className="text-gray-700"><strong>{t('suppliers.company')}:</strong> {supplier.company}</p>
        <p className="text-gray-700"><strong>{t('suppliers.contact_person')}:</strong> {supplier.contactPerson}</p>
        <p className="text-gray-700"><strong>{t('suppliers.form.email_label')}:</strong> {supplier.email}</p>
        <p className="text-gray-700"><strong>{t('suppliers.form.phone_label')}:</strong> {supplier.phone}</p>
        <p className="text-gray-700"><strong>{t('suppliers.status')}:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
          ${supplier.status === 'Active' ? 'bg-green-100 text-green-800' :
            supplier.status === 'Preferred' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'}`}>{supplier.status}</span></p>
        <p className="text-gray-700 mt-2"><strong>{t('suppliers.form.notes_label')}:</strong> {supplier.notes || t('common.na')}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('suppliers.detail.related_activities')}</h4>
        {activities.length === 0 ? (
          <p className="text-gray-600">{t('suppliers.detail.no_related_activities')}</p>
        ) : (
          <ul className="list-disc list-inside text-gray-700" aria-label={t('suppliers.detail.related_activities')}>
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
          {t('suppliers.detail.gemini_summary')}
          {canGenerateSummary && (
            <Button
              onClick={generateSupplierSummary}
              variant="outline"
              size="sm"
              className="ml-4"
              loading={isLoadingSummary}
              disabled={isLoadingSummary}
              aria-live="polite"
              aria-controls="ai-supplier-summary-content"
            >
              {aiSummary ? t('suppliers.detail.regenerate_summary') : t('suppliers.detail.generate_summary')}
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
          <div id="ai-supplier-summary-content" className="bg-blue-50 p-4 rounded-md shadow-inner text-gray-800 mt-4" aria-label={t('suppliers.detail.gemini_summary')}>
            <MarkdownRenderer content={aiSummary} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDetail;