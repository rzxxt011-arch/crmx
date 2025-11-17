import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { CustomLabels } from './types';

interface Translations {
  [key: string]: string | Translations;
}

interface LanguageResources {
  [lang: string]: {
    translation: Translations;
  };
}

interface TranslationContextType {
  t: (key: string, options?: Record<string, any>) => string;
  getLabel: (key: string, options?: { defaultValue?: string }) => string;
  language: string;
  changeLanguage: (lang: string) => void;
  customLabels: CustomLabels;
  setCustomLabel: (key: string, label: string) => void;
  resetCustomLabels: () => void;
}

// Hardcoded translation resources
const resources: LanguageResources = {
  en: {
    translation: {
      app_name: 'CRM App',
      dashboard: {
        title: 'Dashboard Overview',
        total_customers: 'Total Customers',
        active_deals: 'Active Deals',
        pending_activities: 'Pending Activities',
        total_deal_value: 'Total Deal Value',
        deal_forecast: 'Deal Forecast (Weighted)',
        upcoming_activities: 'Upcoming Activities',
        no_upcoming_activities: 'No upcoming activities.',
        recent_won_deals: 'Recently Won Deals',
        no_recent_won_deals: 'No recently won deals.',
        due: 'Due',
        type: 'Type',
        customer: 'Customer',
        value: 'Value',
        won: 'Won',
      },
      customers: {
        title: 'Customers',
        add_button: 'Add Customer',
        search_placeholder: 'Search customers...',
        sort_by: 'Sort by',
        sort_name_asc: 'Name (A-Z)',
        sort_name_desc: 'Name (Z-A)',
        sort_company_asc: 'Company (A-Z)',
        sort_company_desc: 'Company (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        name: 'Name',
        company: 'Company',
        email: 'Email',
        phone: 'Phone',
        status: 'Status',
        actions: 'Actions',
        no_match_search: 'No customers match your search criteria.',
        no_customers_found: 'No customers found. Add a new customer to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this customer? This will also delete related deals and activities.',
        exported_success: 'Customers exported to {{filename}}.json successfully!',
        imported_success: 'Customers imported successfully!',
        import_failed: 'Failed to import customers: {{message}}',
        form: {
          add_title: 'Add New Customer',
          edit_title: 'Edit Customer',
          name_label: 'Name',
          email_label: 'Email',
          phone_label: 'Phone',
          company_label: 'Company',
          status_label: 'Status',
          notes_label: 'Notes',
          name_required: 'Name is required',
          email_required: 'Email is required',
          email_invalid: 'Email is invalid',
          company_required: 'Company is required',
          cancel: 'Cancel',
          add_submit: 'Add Customer',
          update_submit: 'Update Customer',
        },
        detail: {
          details_title: 'Details: {{customerName}}',
          related_deals: 'Related Deals',
          no_related_deals: 'No deals associated with this customer.',
          related_activities: 'Related Activities',
          no_related_activities: 'No activities associated with this customer.',
          gemini_summary: 'Gemini AI Summary',
          generate_summary: 'Generate Summary',
          regenerate_summary: 'Regenerate Summary',
          error_generating_summary: 'Failed to generate summary.',
          no_specific_notes: 'No specific notes.',
          create_related_activity: 'Create Related Activity',
          follow_up_title: 'Follow-up for: {{customerName}}',
          follow_up_notes: 'Follow-up activity for customer: "{{customerName}}"',
        }
      },
      suppliers: {
        title: 'Suppliers',
        add_button: 'Add Supplier',
        search_placeholder: 'Search suppliers...',
        sort_by: 'Sort by',
        sort_name_asc: 'Name (A-Z)',
        sort_name_desc: 'Name (Z-A)',
        sort_contact_asc: 'Contact Person (A-Z)',
        sort_contact_desc: 'Contact Person (Z-A)',
        sort_company_asc: 'Company (A-Z)',
        sort_company_desc: 'Company (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        name: 'Name',
        contact_person: 'Contact Person',
        company: 'Company',
        email: 'Email',
        phone: 'Phone',
        status: 'Status',
        actions: 'Actions',
        no_match_search: 'No suppliers match your search criteria.',
        no_suppliers_found: 'No suppliers found. Add a new supplier to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this supplier? This will also delete related activities.',
        exported_success: 'Suppliers exported to {{filename}}.json successfully!',
        imported_success: 'Suppliers imported successfully!',
        import_failed: 'Failed to import suppliers: {{message}}',
        form: {
          add_title: 'Add New Supplier',
          edit_title: 'Edit Supplier',
          name_label: 'Supplier Name',
          contact_person_label: 'Contact Person',
          email_label: 'Email',
          phone_label: 'Phone',
          company_label: 'Company',
          status_label: 'Status',
          notes_label: 'Notes',
          name_required: 'Supplier Name is required',
          contact_person_required: 'Contact Person is required',
          email_required: 'Email is required',
          email_invalid: 'Email is invalid',
          company_required: 'Company is required',
          cancel: 'Cancel',
          add_submit: 'Add Supplier',
          update_submit: 'Update Supplier',
        },
        detail: {
          details_title: 'Details: {{supplierName}}',
          related_activities: 'Related Activities',
          no_related_activities: 'No activities associated with this supplier.',
          gemini_summary: 'Gemini AI Summary',
          generate_summary: 'Generate Summary',
          regenerate_summary: 'Regenerate Summary',
          error_generating_summary: 'Failed to generate summary.',
          no_specific_notes: 'No specific notes.',
        }
      },
      deals: {
        title: 'Deals',
        add_button: 'Add Deal',
        no_customer_warning_title: 'Heads up!',
        no_customer_warning_message: 'Please add at least one customer before creating a deal.',
        search_placeholder: 'Search deals...',
        sort_by: 'Sort by',
        sort_deal_name_asc: 'Deal Name (A-Z)',
        sort_deal_name_desc: 'Deal Name (Z-A)',
        sort_customer_asc: 'Customer (A-Z)',
        sort_customer_desc: 'Customer (Z-A)',
        sort_value_asc: 'Value (Low-High)',
        sort_value_desc: 'Value (High-Low)',
        sort_stage_asc: 'Stage (A-Z)',
        sort_stage_desc: 'Stage (Z-A)',
        sort_close_date_asc: 'Close Date (Asc)',
        sort_close_date_desc: 'Close Date (Desc)',
        deal_name: 'Deal Name',
        customer: 'Customer',
        value: 'Value',
        stage: 'Stage',
        close_date: 'Close Date',
        actions: 'Actions',
        no_match_search: 'No deals match your search criteria.',
        no_deals_found: 'No deals found. Add a new deal to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this deal? This will also delete related activities.',
        exported_success: 'Deals exported to {{filename}}.json successfully!',
        imported_success: 'Deals imported successfully!',
        import_failed: 'Failed to import deals: {{message}}',
        form: {
          add_title: 'Add New Deal',
          edit_title: 'Edit Deal',
          deal_name_label: 'Deal Name',
          customer_label: 'Customer',
          value_label: 'Value ($)',
          stage_label: 'Stage',
          close_date_label: 'Expected Close Date',
          notes_label: 'Notes',
          deal_name_required: 'Deal Name is required',
          customer_required: 'Customer is required',
          value_positive: 'Value must be positive',
          close_date_required: 'Close Date is required',
          no_customer_message: 'Please add a customer before creating a deal.',
          cancel: 'Cancel',
          add_submit: 'Add Deal',
          update_submit: 'Update Deal',
        },
        detail: {
          details_title: 'Details: {{dealName}}',
          related_activities: 'Related Activities',
          no_related_activities: 'No activities associated with this deal.',
          gemini_summary: 'Gemini AI Summary',
          generate_summary: 'Generate Summary',
          regenerate_summary: 'Regenerate Summary',
          error_generating_summary: 'Failed to generate summary.',
          no_specific_notes: 'No specific notes.',
        }
      },
      activities: {
        title: 'Activities',
        add_button: 'Add Activity',
        search_placeholder: 'Search activities...',
        sort_by: 'Sort by',
        sort_due_date_asc: 'Due Date (Asc)',
        sort_due_date_desc: 'Due Date (Desc)',
        sort_title_asc: 'Title (A-Z)',
        sort_title_desc: 'Title (Z-A)',
        sort_type_asc: 'Type (A-Z)',
        sort_type_desc: 'Type (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        activity_title: 'Title',
        type: 'Type',
        status: 'Status',
        due_date: 'Due Date',
        related_to: 'Related To',
        actions: 'Actions',
        no_match_search: 'No activities match your search criteria.',
        no_activities_found: 'No activities found. Add a new activity to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this activity?',
        exported_success: 'Activities exported to {{filename}}.json successfully!',
        imported_success: 'Activities imported successfully!',
        import_failed: 'Failed to import activities: {{message}}',
        form: {
          add_title: 'Add New Activity',
          edit_title: 'Edit Activity',
          title_label: 'Título',
          type_label: 'Type',
          status_label: 'Status',
          due_date_label: 'Due Date',
          related_customer_label: 'Related Customer',
          related_deal_label: 'Related Deal',
          related_supplier_label: 'Related Supplier',
          notes_label: 'Notes',
          select_customer_optional: 'Select Customer (Optional)',
          select_deal_optional: 'Select Deal (Optional)',
          select_supplier_optional: 'Select Supplier (Optional)',
          title_required: 'Title is required',
          due_date_required: 'Due Date is required',
          cancel: 'Cancel',
          add_submit: 'Add Activity',
          update_submit: 'Update Activity',
        },
        detail: {
          details_title: 'Detalhes: {{activityTitle}}',
          notes: 'Notas',
          na: 'N/D',
          create_related_activity: 'Criar Atividade Relacionada',
          follow_up_title: 'Seguimento para: {{title}}',
          follow_up_notes: 'Seguimento para a atividade: "{{title}}"',
        }
      },
      campaigns: {
        title: 'Marketing Campaigns',
        add_button: 'Add Campaign',
        search_placeholder: 'Search campaigns...',
        sort_by: 'Sort by',
        sort_name_asc: 'Name (A-Z)',
        sort_name_desc: 'Name (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        sort_start_date_asc: 'Start Date (Asc)',
        sort_start_date_desc: 'Start Date (Desc)',
        sort_end_date_asc: 'End Date (Asc)',
        sort_end_date_desc: 'End Date (Desc)',
        name: 'Name',
        description: 'Description',
        status: 'Status',
        start_date: 'Start Date',
        end_date: 'End Date',
        linked_customers: 'Linked Customers',
        actions: 'Actions',
        no_match_search: 'No campaigns match your search criteria.',
        no_campaigns_found: 'No campaigns found. Add a new campaign to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this campaign?',
        exported_success: 'Campaigns exported to {{filename}}.json successfully!',
        imported_success: 'Campaigns imported successfully!',
        import_failed: 'Failed to import campaigns: {{message}}',
        form: {
          add_title: 'Add New Campaign',
          edit_title: 'Edit Campaign',
          name_label: 'Campaign Name',
          description_label: 'Description',
          status_label: 'Status',
          start_date_label: 'Start Date',
          end_date_label: 'End Date',
          link_customers_label: 'Link Customers',
          name_required: 'Campaign name is required',
          start_date_required: 'Start date is required',
          end_date_required: 'End date is required',
          end_date_after_start: 'End date must be after start date',
          cancel: 'Cancel',
          add_submit: 'Add Campaign',
          update_submit: 'Update Campaign',
        },
        detail: {
          details_title: 'Details: {{campaignName}}',
          related_customers: 'Related Customers',
          no_related_customers: 'No customers associated with this campaign.',
          no_specific_notes: 'No specific description.',
        }
      },
      products: { // New section for Products
        title: 'Products',
        add_button: 'Add Product',
        search_placeholder: 'Search products...',
        sort_by: 'Sort by',
        sort_name_asc: 'Name (A-Z)',
        sort_name_desc: 'Name (Z-A)',
        sort_price_asc: 'Price (Low-High)',
        sort_price_desc: 'Price (High-Low)',
        sort_category_asc: 'Category (A-Z)',
        sort_category_desc: 'Category (Z-A)',
        name: 'Name',
        price: 'Price',
        category: 'Category',
        sku: 'SKU',
        actions: 'Actions',
        no_match_search: 'No products match your search criteria.',
        no_products_found: 'No products found. Add a new product to get started.',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this product?',
        exported_success: 'Products exported to {{filename}}.json successfully!',
        imported_success: 'Products imported successfully!',
        import_failed: 'Failed to import products: {{message}}',
        form: {
          add_title: 'Add New Product',
          edit_title: 'Edit Product',
          name_label: 'Product Name',
          description_label: 'Description',
          price_label: 'Price ($)',
          category_label: 'Category',
          sku_label: 'SKU',
          name_required: 'Product name is required',
          price_required: 'Price is required',
          price_positive: 'Price must be a positive number',
          sku_required: 'SKU is required',
          cancel: 'Cancel',
          add_submit: 'Add Product',
          update_submit: 'Update Product',
        },
        detail: {
          details_title: 'Details: {{productName}}',
          no_specific_notes: 'No specific description.',
        }
      },
      commissions: {
        title: 'Commissions Overview',
        total_won_value: 'Total Won Deal Value',
        total_commission: 'Total Commission',
        set_rate: 'Set Commission Rate',
        rate_label: 'Commission Rate (e.g., 0.10 for 10%)',
        current_rate: 'Current Rate: {{rate}}%',
        won_deals_commissions: 'Won Deals and Commissions',
        no_won_deals: 'No deals have been won yet.',
        present_rate: 'Current rate:',
        deal_name: 'Deal Name',
        customer: 'Customer',
        deal_value: 'Deal Value',
        commission: 'Commission',
      },
      auth_page: { // New section for authentication
        login_tab: 'Login',
        register_tab: 'Register',
        login_title: 'Login to CRM',
        register_title: 'Register for CRM',
        email_label: 'Email',
        password_label: 'Password',
        confirm_password_label: 'Confirm Password',
        username_label: 'Username',
        role_label: 'Role',
        email_required: 'Email is required',
        email_invalid: 'Email is invalid',
        email_already_registered: 'Email is already registered.',
        password_required: 'Password is required',
        password_length: 'Password must be at least 6 characters long',
        confirm_password_required: 'Confirm password is required',
        passwords_not_match: 'Passwords do not match',
        username_required: 'Username is required',
        login_button: 'Login',
        register_button: 'Register',
        invalid_credentials: 'Invalid email or password.',
      },
      roles: { // Translations for UserRole
        admin: 'Admin',
        sales: 'Sales',
        viewer: 'Viewer',
      },
      common: {
        export: 'Export',
        import: 'Import',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        cancel: 'Cancel',
        logout: 'Logout',
        welcome: 'Welcome, {{username}}!',
        na: 'N/A',
        error: 'Error!',
        error_message: '{{message}}',
        loading: 'Loading...',
        language: 'Language',
        personalize_labels: 'Personalize Labels',
        settings: 'Settings',
        save: 'Save',
        back_to_dashboard: 'Back to Dashboard',
        permission_denied: 'Permission Denied: You do not have the necessary permissions for this action.',
        permission_denied_tooltip: "You don't have permission to perform this action.",
        owner: 'Owner',
      },
      sidebar: {
        dashboard: 'Dashboard',
        customers: 'Customers',
        suppliers: 'Suppliers',
        products: 'Products', // New sidebar item
        deals: 'Deals',
        activities: 'Activities',
        campaigns: 'Campaigns',
        commissions: 'Commissions',
      },
      settings: {
        title: 'Personalize Labels',
        intro: 'You can customize the display names for key sections of the application here. Your custom labels will override the default names and translations.',
        original_label_title: 'Label for: {{label}}',
        custom_label: 'Custom Label',
        apply_changes: 'Apply Changes',
        reset_all: 'Reset All',
        reset_confirm: 'Are you sure you want to reset all custom labels to their default values?',
        label_customers_title: 'Customers Section Title',
        label_suppliers_title: 'Suppliers Section Title',
        label_products_title: 'Products Section Title', // New key
        label_deals_title: 'Deals Section Title',
        label_activities_title: 'Activities Section Title',
        label_campaigns_title: 'Campaigns Section Title',
        label_commissions_title: 'Commissions Section Title',
        current_custom_label_status: '(Currently customized: "{{customLabel}}")',
      }
    },
  },
  pt: {
    translation: {
      app_name: 'App de CRM',
      dashboard: {
        title: 'Visão Geral do Painel',
        total_customers: 'Total de Clientes',
        active_deals: 'Negócios Ativos',
        pending_activities: 'Atividades Pendentes',
        total_deal_value: 'Valor Total dos Negócios',
        deal_forecast: 'Previsão de Negócios (Ponderada)',
        upcoming_activities: 'Próximas Atividades',
        no_upcoming_activities: 'Nenhuma atividade futura.',
        recent_won_deals: 'Negócios Ganhos Recentemente',
        no_recent_won_deals: 'Nenhum negócio ganho recentemente.',
        due: 'Vence',
        type: 'Tipo',
        customer: 'Cliente',
        value: 'Valor',
        won: 'Ganho',
      },
      customers: {
        title: 'Clientes',
        add_button: 'Adicionar Cliente',
        search_placeholder: 'Buscar clientes...',
        sort_by: 'Ordenar por',
        sort_name_asc: 'Nome (A-Z)',
        sort_name_desc: 'Nome (Z-A)',
        sort_company_asc: 'Empresa (A-Z)',
        sort_company_desc: 'Empresa (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        name: 'Nome',
        company: 'Empresa',
        email: 'Email',
        phone: 'Telefone',
        status: 'Status',
        actions: 'Ações',
        no_match_search: 'Nenhum cliente corresponde à sua busca.',
        no_customers_found: 'Nenhum cliente encontrado. Adicione um novo cliente para começar.',
        view: 'Ver',
        edit: 'Editar',
        delete: 'Excluir',
        confirm_delete: 'Tem certeza de que deseja excluir este cliente? Isso também excluirá negócios e atividades relacionados.',
        exported_success: 'Clientes exportados para {{filename}}.json com sucesso!',
        imported_success: 'Clientes importados com sucesso!',
        import_failed: 'Falha ao importar clientes: {{message}}',
        form: {
          add_title: 'Adicionar Novo Cliente',
          edit_title: 'Editar Cliente',
          name_label: 'Nome',
          email_label: 'Email',
          phone_label: 'Telefone',
          company_label: 'Empresa',
          status_label: 'Status',
          notes_label: 'Notas',
          name_required: 'O nome é obrigatório',
          email_required: 'O email é obrigatório',
          email_invalid: 'O email é inválido',
          company_required: 'A empresa é obrigatória',
          cancel: 'Cancelar',
          add_submit: 'Adicionar Cliente',
          update_submit: 'Atualizar Cliente',
        },
        detail: {
          details_title: 'Detalhes: {{customerName}}',
          related_deals: 'Negócios Relacionados',
          no_related_deals: 'Nenhum negócio associado a este cliente.',
          related_activities: 'Atividades Relacionadas',
          no_related_activities: 'Nenhuma atividade associada a este cliente.',
          gemini_summary: 'Resumo da IA Gemini',
          generate_summary: 'Gerar Resumo',
          regenerate_summary: 'Regenerar Resumo',
          error_generating_summary: 'Falha ao gerar resumo.',
          no_specific_notes: 'Nenhuma nota específica.',
          create_related_activity: 'Criar Atividade Relacionada',
          follow_up_title: 'Seguimento para: {{customerName}}',
          follow_up_notes: 'Atividade de seguimento para o cliente: "{{customerName}}"',
        }
      },
      suppliers: {
        title: 'Fornecedores',
        add_button: 'Adicionar Fornecedor',
        search_placeholder: 'Buscar fornecedores...',
        sort_by: 'Ordenar por',
        sort_name_asc: 'Nome (A-Z)',
        sort_name_desc: 'Nome (Z-A)',
        sort_contact_asc: 'Pessoa de Contato (A-Z)',
        sort_contact_desc: 'Pessoa de Contato (Z-A)',
        sort_company_asc: 'Empresa (A-Z)',
        sort_company_desc: 'Empresa (Z-A)',
        sort_status_asc: 'Status (A-Z)',
        sort_status_desc: 'Status (Z-A)',
        name: 'Nome',
        contact_person: 'Pessoa de Contato',
        company: 'Empresa',
        email: 'Email',
        phone: 'Telefone',
        status: 'Status',
        actions: 'Ações',
        no_match_search: 'Nenhum fornecedor corresponde à sua busca.',
        no_suppliers_found: 'Nenhum fornecedor encontrado. Adicione um novo fornecedor para começar.',
        view: 'Ver',
        edit: 'Editar',
        delete: 'Excluir',
        confirm_delete: 'Tem certeza de que deseja excluir este fornecedor? Isso também excluirá atividades relacionadas.',
        exported_success: 'Fornecedores exportados para {{filename}}.json com sucesso!',
        imported_success: 'Fornecedores importados com sucesso!',
        import_failed: 'Falha ao importar fornecedores: {{message}}',
        form: {
          add_title: 'Adicionar Novo Fornecedor',
          edit_title: 'Editar Fornecedor',
          name_label: 'Nome do Fornecedor',
          contact_person_label: 'Pessoa de Contato',
          email_label: 'Email',
          phone_label: 'Telefone',
          company_label: 'Empresa',
          status_label: 'Status',
          notes_label: 'Notas',
          name_required: 'O nome do fornecedor é obrigatório',
          contact_person_required: 'A pessoa de contato é obrigatória',
          email_required: 'O email é obrigatório',
          email_invalid: 'O email é inválido',
          company_required: 'A empresa é obrigatória',
          cancel: 'Cancelar',
          add_submit: 'Adicionar Fornecedor',
          update_submit: 'Atualizar Fornecedor',
        },
        detail: {
          details_title: 'Detalhes: {{supplierName}}',
          related_activities: 'Atividades Relacionadas',
          no_related_activities: 'Nenhuma atividade associada a este fornecedor.',
          gemini_summary: 'Resumo da IA Gemini',
          generate_summary: 'Gerar Resumo',
          regenerate_summary: 'Regenerar Resumo',
          error_generating_summary: 'Falha ao gerar resumo.',
          no_specific_notes: 'Nenhuma nota específica.',
        }
      },
      deals: {
        title: 'Negócios',
        add_button: 'Adicionar Negócio',
        no_customer_warning_title: 'Atenção!',
        no_customer_warning_message: 'Por favor, adicione pelo menos um cliente antes de criar um negócio.',
        search_placeholder: 'Buscar negócios...',
        sort_by: 'Ordenar por',
        sort_deal_name_asc: 'Nome do Negócio (A-Z)',
        sort_deal_name_desc: 'Nome do Negócio (Z-A)',
        sort_customer_asc: 'Cliente (A-Z)',
        sort_customer_desc: 'Cliente (Z-A)',
        sort_value_asc: 'Valor (Menor-Maior)',
        sort_value_desc: 'Valor (Maior-Menor)',
        sort_stage_asc: 'Etapa (A-Z)',
        sort_stage_desc: 'Etapa (Z-A)',
        sort_close_date_asc: 'Data de Fechamento (Cresc.)',
        sort_close_date_desc: 'Data de Fechamento (Decresc.)',
        deal_name: 'Nome do Negócio',
        customer: 'Cliente',
        value: 'Valor',
        stage: 'Etapa',
        close_date: 'Data de Fechamento',
        actions: 'Ações',
        no_match_search: 'Nenhum negócio corresponde à sua busca.',
        no_deals_found: 'Nenhum negócio encontrado. Adicione um novo negócio para começar.',
        view: 'Ver',
        edit: 'Editar',
        delete: 'Excluir',
        confirm_delete: 'Tem certeza de que deseja excluir este negócio? Isso também excluirá atividades relacionadas.',
        exported_success: 'Negócios exportados para {{filename}}.json com sucesso!',
        imported_success: 'Negócios importados com sucesso!',
        import_failed: 'Falha ao importar negócios: {{message}}',
        form: {
          add_title: 'Adicionar Novo Negócio',
          edit_title: 'Editar Negócio',
          deal_name_label: 'Nome do Negócio',
          customer_label: 'Cliente',
          value_label: 'Valor ($)',
          stage_label: 'Etapa',
          close_date_label: 'Data de Fechamento Prevista',
          notes_label: 'Notas',
          deal_name_required: 'O nome do negócio é obrigatório',
          // Fix: Complete truncated pt translations
          customer_required: 'Cliente é obrigatório',
          value_positive: 'O valor deve ser positivo',
          close_date_required: 'A data de fechamento é obrigatória',
          no_customer_message: 'Por favor, adicione um cliente antes de criar um negócio.',
          cancel: 'Cancelar',
          add_submit: 'Adicionar Negócio',
          update_submit: 'Atualizar Negócio',
        },
        detail: {
          details_title: 'Detalhes: {{dealName}}',
          related_activities: 'Atividades Relacionadas',
          no_related_activities: 'Nenhuma atividade associada a este negócio.',
          gemini_summary: 'Resumo da IA Gemini',
          generate_summary: 'Gerar Resumo',
          regenerate_summary: 'Regenerar Resumo',
          error_generating_summary: 'Falha ao gerar resumo.',
          no_specific_notes: 'Nenhuma nota específica.',
        },
      },
    },
  },
};

// Fix: Add context, provider, and hook definitions and export them.
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  return typeof result === 'string' ? result : undefined;
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('crmLanguage') || 'en');
  const [customLabels, setCustomLabels] = useState<CustomLabels>(() => {
    try {
      const stored = localStorage.getItem('crmCustomLabels');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('crmLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('crmCustomLabels', JSON.stringify(customLabels));
  }, [customLabels]);

  const changeLanguage = (lang: string) => {
    if (resources[lang]) {
      setLanguage(lang);
    }
  };

  const setCustomLabel = (key: string, label: string) => {
    setCustomLabels(prev => {
      const newLabels = { ...prev };
      if (label.trim() === '') {
        delete newLabels[key];
      } else {
        newLabels[key] = label;
      }
      return newLabels;
    });
  };

  const resetCustomLabels = () => {
    setCustomLabels({});
  };

  const t = useCallback((key: string, options?: Record<string, any>): string => {
    let translation = getNestedTranslation(resources[language]?.translation, key);

    if (!translation) {
      translation = getNestedTranslation(resources.en.translation, key);
    }

    if (translation) {
      if (options) {
        return Object.keys(options).reduce((acc, optionKey) => {
          return acc.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(options[optionKey]));
        }, translation);
      }
      return translation;
    }

    return key;
  }, [language]);

  const getLabel = useCallback((key: string, options?: { defaultValue?: string }): string => {
    if (customLabels[key]) {
      return customLabels[key];
    }
    const translatedLabel = t(key);
    if (translatedLabel !== key) {
      return translatedLabel;
    }
    return options?.defaultValue || key;
  }, [customLabels, t]);

  const value = {
    t,
    getLabel,
    language,
    changeLanguage,
    customLabels,
    setCustomLabel,
    resetCustomLabels,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
