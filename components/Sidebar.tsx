import React from 'react';
import { View, UserRole } from '../types';
import { useTranslation } from '../TranslationContext';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  isSidebarOpen: boolean; // New prop
  toggleSidebar: () => void; // New prop
  loggedInUserRole: UserRole | null; // New prop
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout, isSidebarOpen, toggleSidebar, loggedInUserRole }) => {
  const { t, getLabel } = useTranslation();

  const navItems = [
    { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: '📊', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'customers', labelKey: 'sidebar.customers', icon: '👤', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'suppliers', labelKey: 'sidebar.suppliers', icon: '📦', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'products', labelKey: 'sidebar.products', icon: '🏷️', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'deals', labelKey: 'sidebar.deals', icon: '💰', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'activities', labelKey: 'sidebar.activities', icon: '📝', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
    { id: 'campaigns', labelKey: 'sidebar.campaigns', icon: '📣', roles: [UserRole.Admin, UserRole.Sales] }, // Viewable by Admin/Sales
    { id: 'commissions', labelKey: 'sidebar.commissions', icon: '💸', roles: [UserRole.Admin, UserRole.Sales] }, // Viewable by Admin/Sales
    { id: 'settings', labelKey: 'common.settings', icon: '⚙️', roles: [UserRole.Admin, UserRole.Sales, UserRole.Viewer] },
  ];

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white flex-shrink-0 p-4 flex flex-col justify-between z-50
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:min-h-screen`}
      >
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl font-bold text-blue-400">{t('app_name')}</div>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-md p-1"
              aria-label={t('common.cancel')}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav aria-label={t('common.main_navigation')}>
            <ul>
              {navItems.map((item) => (
                // Only render if the user's role is included in the item's allowed roles
                loggedInUserRole && item.roles.includes(loggedInUserRole) && (
                  <li key={item.id} className="mb-2">
                    <button
                      onClick={() => {
                        onViewChange(item.id as View);
                        toggleSidebar(); // Close sidebar on item click for mobile
                      }}
                      className={`flex items-center w-full p-3 rounded-md text-left transition duration-200 ease-in-out
                        ${currentView === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
                      aria-current={currentView === item.id ? 'page' : undefined}
                    >
                      <span className="mr-3 text-xl" aria-hidden="true">{item.icon}</span>
                      <span className="text-lg">{getLabel(item.labelKey)}</span>
                    </button>
                  </li>
                )
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout button */}
        <div className="mt-8">
          <button
            onClick={() => {
              onLogout();
              toggleSidebar(); // Close sidebar on logout for mobile
            }}
            className="flex items-center w-full p-3 rounded-md text-left transition duration-200 ease-in-out bg-red-600 hover:bg-red-700 text-white shadow-md"
            aria-label={t('common.logout')}
          >
            <span className="mr-3 text-xl" aria-hidden="true">🚪</span>
            <span className="text-lg">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;