/* ============================================================
   CHAITANYA IMPEX CRM — MAIN APPLICATION LOGIC
   Version 2.0 — Google Apps Script integration
   ============================================================ */

/* ============================================================
   PART A — CONFIG
   ============================================================ */

const CONFIG = {
  appName: 'Chaitanya Impex',
  currency: '₹',
  currencyCode: 'INR',
  locale: 'en-IN',
  theme: localStorage.getItem('ci_theme') || 'light'
};

const MODULES = {
  dashboard:  { label: 'Dashboard',   icon: 'fa-gauge-high',        group: 'main',     color: 'brand' },
  leads:      { label: 'Leads',       icon: 'fa-user-plus',         group: 'sales',    color: 'info',     sheet: 'Leads',      key: 'Lead_ID' },
  deals:      { label: 'Deals',       icon: 'fa-handshake',         group: 'sales',    color: 'brand',    sheet: 'Deals',      key: 'Deal_ID' },
  companies:  { label: 'Companies',   icon: 'fa-building',          group: 'sales',    color: 'purple',   sheet: 'Companies',  key: 'Company_ID' },
  contacts:   { label: 'Contacts',    icon: 'fa-user-group',        group: 'sales',    color: 'pink',     sheet: 'Contacts',   key: 'Contact_ID' },
  activities: { label: 'Activities',  icon: 'fa-calendar-check',    group: 'engage',   color: 'success',  sheet: 'Activities', key: 'Activity_ID' },
  tasks:      { label: 'Tasks',       icon: 'fa-square-check',      group: 'engage',   color: 'warning',  sheet: 'Tasks',      key: 'Task_ID' },
  notes:      { label: 'Notes',       icon: 'fa-note-sticky',       group: 'engage',   color: 'info',     sheet: 'Notes',      key: 'Note_ID' },
  products:   { label: 'Products',    icon: 'fa-box',               group: 'catalog',  color: 'warning',  sheet: 'Products',   key: 'Product_ID' },
  templates:  { label: 'Templates',   icon: 'fa-envelope-open-text',group: 'catalog',  color: 'purple',   sheet: 'Templates',  key: 'Template_ID' },
  reports:    { label: 'Reports',     icon: 'fa-chart-column',      group: 'insight',  color: 'danger' },
  users:      { label: 'Users',       icon: 'fa-users-gear',        group: 'admin',    color: 'text',     sheet: 'Users',      key: 'User_ID' },
  websites:   { label: 'Websites',    icon: 'fa-globe',             group: 'admin',    color: 'info',     sheet: 'Websites',   key: 'Website_ID' },
  settings:   { label: 'Settings',    icon: 'fa-sliders',           group: 'admin',    color: 'text' }
};

const NAV_GROUPS = [
  { id: 'main',    label: null },
  { id: 'sales',   label: 'Sales' },
  { id: 'engage',  label: 'Engagement' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'insight', label: 'Insights' },
  { id: 'admin',   label: 'Administration' }
];

const FIELD_DEFS = {
  leads: {
    sections: [
      { title: 'Lead Information', icon: 'fa-circle-info', fields: [
        { key: 'Company_Name', label: 'Company Name', type: 'text', span: 1 },
        { key: 'Contact_Name', label: 'Contact Name', type: 'text', span: 1 },
        { key: 'Email',        label: 'Email',        type: 'email', span: 1 },
        { key: 'Phone',        label: 'Phone',        type: 'tel', span: 1 },
        { key: 'Website_ID',   label: 'Website',      type: 'select', options: 'websites', span: 1 },
        { key: 'Source_ID',    label: 'Source',       type: 'select', options: 'sources', span: 1 }
      ]},
      { title: 'Location', icon: 'fa-location-dot', fields: [
        { key: 'City',    label: 'City',    type: 'text' },
        { key: 'State',   label: 'State',   type: 'text' },
        { key: 'Country', label: 'Country', type: 'select', options: ['India','UAE','USA','UK','Italy','Kenya','Germany','France'] }
      ]},
      { title: 'Requirement', icon: 'fa-clipboard-list', fields: [
        { key: 'Industry',        label: 'Industry',        type: 'select', options: 'industries' },
        { key: 'Requirement',     label: 'Requirement',     type: 'textarea', span: 2 },
        { key: 'Quantity',        label: 'Quantity',        type: 'number' },
        { key: 'Estimated_Value', label: 'Estimated Value', type: 'number', prefix: '₹' },
        { key: 'Currency',        label: 'Currency',        type: 'select', options: ['INR','USD','AED','EUR'] },
        { key: 'Message',         label: 'Message',         type: 'textarea', span: 2 }
      ]},
      { title: 'Pipeline', icon: 'fa-diagram-project', fields: [
        { key: 'Status',              label: 'Status',       type: 'select', options: 'leadStatuses' },
        { key: 'Stage_ID',            label: 'Stage',        type: 'select', options: 'stages' },
        { key: 'Assigned_To',         label: 'Assigned To',  type: 'select', options: 'users' },
        { key: 'Priority',            label: 'Priority',     type: 'select', options: ['High','Medium','Low'] },
        { key: 'Date_Received',       label: 'Date Received', type: 'date' },
        { key: 'Next_Followup_Date',  label: 'Next Follow-up', type: 'date' },
        { key: 'Tags',                label: 'Tags',         type: 'text', span: 2, placeholder: 'comma,separated,tags' },
        { key: 'Catalogue_Sent',      label: 'Catalogue Sent', type: 'select', options: ['Yes','No'] }
      ]}
    ]
  },
  deals: {
    sections: [
      { title: 'Deal Information', icon: 'fa-circle-info', fields: [
        { key: 'Deal_Name',    label: 'Deal Name',  type: 'text', span: 2, required: true },
        { key: 'Company_ID',   label: 'Company',    type: 'select', options: 'companies' },
        { key: 'Contact_ID',   label: 'Contact',    type: 'select', options: 'contacts' },
        { key: 'Lead_ID',      label: 'Source Lead', type: 'select', options: 'leads' }
      ]},
      { title: 'Value & Stage', icon: 'fa-indian-rupee-sign', fields: [
        { key: 'Value',        label: 'Deal Value', type: 'number', prefix: '₹', required: true },
        { key: 'Currency',     label: 'Currency',   type: 'select', options: ['INR','USD','AED','EUR'] },
        { key: 'Probability_%', label: 'Probability %', type: 'number' },
        { key: 'Stage_ID',     label: 'Stage',      type: 'select', options: 'stages' },
        { key: 'Expected_Close_Date', label: 'Expected Close', type: 'date' },
        { key: 'Actual_Close_Date',   label: 'Actual Close',   type: 'date' }
      ]},
      { title: 'Ownership', icon: 'fa-user-tie', fields: [
        { key: 'Owner',  label: 'Owner',  type: 'select', options: 'users' },
        { key: 'Status', label: 'Status', type: 'select', options: ['Open','Won','Lost','On Hold'] },
        { key: 'Lost_Reason', label: 'Lost Reason (if lost)', type: 'textarea', span: 2 }
      ]}
    ]
  },
  companies: {
    sections: [
      { title: 'Company Details', icon: 'fa-building', fields: [
        { key: 'Company_Name',     label: 'Company Name', type: 'text', span: 2, required: true },
        { key: 'Industry',         label: 'Industry',     type: 'select', options: 'industries' },
        { key: 'Company_Website',  label: 'Website',      type: 'url' },
        { key: 'GST_No',           label: 'GST No',       type: 'text' },
        { key: 'Client_Type',      label: 'Client Type',  type: 'select', options: 'clientTypes' }
      ]},
      { title: 'Address', icon: 'fa-location-dot', fields: [
        { key: 'Address', label: 'Address', type: 'textarea', span: 2 },
        { key: 'City',    label: 'City',    type: 'text' },
        { key: 'State',   label: 'State',   type: 'text' },
        { key: 'Country', label: 'Country', type: 'select', options: ['India','UAE','USA','UK','Italy','Kenya'] }
      ]},
      { title: 'Contact & Ownership', icon: 'fa-address-card', fields: [
        { key: 'Phone',         label: 'Phone',         type: 'tel' },
        { key: 'Email',         label: 'Email',         type: 'email' },
        { key: 'Account_Owner', label: 'Account Owner', type: 'select', options: 'users' },
        { key: 'Source_ID',     label: 'Source',        type: 'select', options: 'sources' },
        { key: 'Website_ID',    label: 'Website',       type: 'select', options: 'websites' }
      ]}
    ]
  },
  contacts: {
    sections: [
      { title: 'Contact Details', icon: 'fa-user', fields: [
        { key: 'Full_Name',   label: 'Full Name',   type: 'text', required: true },
        { key: 'Company_ID',  label: 'Company',     type: 'select', options: 'companies' },
        { key: 'Designation', label: 'Designation', type: 'text' },
        { key: 'Is_Primary',  label: 'Primary Contact', type: 'select', options: ['Yes','No'] }
      ]},
      { title: 'Reach', icon: 'fa-phone', fields: [
        { key: 'Email',     label: 'Email',     type: 'email' },
        { key: 'Phone',     label: 'Phone',     type: 'tel' },
        { key: 'Alt_Phone', label: 'Alt Phone', type: 'tel' }
      ]}
    ]
  },
  activities: {
    sections: [
      { title: 'Activity Details', icon: 'fa-circle-info', fields: [
        { key: 'Activity_Type',   label: 'Type',    type: 'select', options: ['Call','Email','Meeting','WhatsApp','SMS'] },
        { key: 'Subject',         label: 'Subject', type: 'text', required: true, span: 2 },
        { key: 'Related_To_Type', label: 'Related To Type', type: 'select', options: ['Lead','Deal','Company','Contact'] },
        { key: 'Related_To_ID',   label: 'Related To', type: 'text' },
        { key: 'Activity_Date',   label: 'Date',     type: 'date' },
        { key: 'Activity_Time',   label: 'Time',     type: 'time' },
        { key: 'Duration_Min',    label: 'Duration (min)', type: 'number' },
        { key: 'Notes',           label: 'Notes',    type: 'textarea', span: 2 },
        { key: 'Outcome',         label: 'Outcome',  type: 'select', options: ['Interested','Positive','Pending','Approved','Neutral','Won','Sent','Needs info','New enquiry','Awaiting response','In progress'] },
        { key: 'Next_Action',     label: 'Next Action', type: 'text' },
        { key: 'Next_Followup_Date', label: 'Next Follow-up', type: 'date' },
        { key: 'Assigned_To',     label: 'Assigned To', type: 'select', options: 'users' },
        { key: 'Status',          label: 'Status',   type: 'select', options: ['Completed','Pending','Cancelled'] }
      ]}
    ]
  },
  tasks: {
    sections: [
      { title: 'Task', icon: 'fa-list-check', fields: [
        { key: 'Title',           label: 'Title',       type: 'text', required: true, span: 2 },
        { key: 'Description',     label: 'Description', type: 'textarea', span: 2 },
        { key: 'Related_To_Type', label: 'Related To Type', type: 'select', options: ['Lead','Deal','Company','Contact'] },
        { key: 'Related_To_ID',   label: 'Related To',  type: 'text' },
        { key: 'Due_Date',        label: 'Due Date',    type: 'date' },
        { key: 'Priority',        label: 'Priority',    type: 'select', options: ['High','Medium','Low'] },
        { key: 'Status',          label: 'Status',      type: 'select', options: ['Open','In Progress','Done','Cancelled'] },
        { key: 'Assigned_To',     label: 'Assigned To', type: 'select', options: 'users' }
      ]}
    ]
  },
  products: {
    sections: [
      { title: 'Product', icon: 'fa-box', fields: [
        { key: 'Product_Name', label: 'Product Name', type: 'text', required: true, span: 2 },
        { key: 'Category',     label: 'Category',     type: 'select', options: 'productCategories' },
        { key: 'Website_ID',   label: 'Website',      type: 'select', options: 'websites' },
        { key: 'Fabric_Spec',  label: 'Fabric Spec',  type: 'text' },
        { key: 'HSN_Code',     label: 'HSN Code',     type: 'text' },
        { key: 'Unit',         label: 'Unit',         type: 'select', options: ['Piece','Meter','Set','Kg','Roll'] },
        { key: 'Unit_Price',   label: 'Unit Price',   type: 'number', prefix: '₹' },
        { key: 'Currency',     label: 'Currency',     type: 'select', options: ['INR','USD','AED','EUR'] },
        { key: 'Stock_Status', label: 'Stock Status', type: 'select', options: ['In Stock','Made to Order','Out of Stock'] },
        { key: 'Certification',label: 'Certification', type: 'text' },
        { key: 'Description',  label: 'Description',  type: 'textarea', span: 2 },
        { key: 'Image_URL',    label: 'Image URL',    type: 'url', span: 2 }
      ]}
    ]
  },
  templates: {
    sections: [
      { title: 'Template', icon: 'fa-envelope-open-text', fields: [
        { key: 'Template_Name', label: 'Template Name', type: 'text', required: true, span: 2 },
        { key: 'Channel',       label: 'Channel',  type: 'select', options: ['Email','WhatsApp','SMS'] },
        { key: 'Website_ID',    label: 'Website',  type: 'select', options: 'websites' },
        { key: 'Category',      label: 'Category', type: 'select', options: ['Intro','Follow-up','Quotation Note','Order','Finance','Compliance','Update'] },
        { key: 'Subject',       label: 'Subject',  type: 'text', span: 2 },
        { key: 'Body',          label: 'Body',     type: 'textarea', span: 2, rows: 8 },
        { key: 'Created_By',    label: 'Created By', type: 'select', options: 'users' }
      ]}
    ]
  },
  notes: {
    sections: [
      { title: 'Note', icon: 'fa-note-sticky', fields: [
        { key: 'Related_To_Type', label: 'Related To Type', type: 'select', options: ['Lead','Deal','Company','Contact'] },
        { key: 'Related_To_ID',   label: 'Related To',      type: 'text' },
        { key: 'Note_Text',       label: 'Note',  type: 'textarea', span: 2, rows: 6, required: true },
        { key: 'Created_By',      label: 'Created By', type: 'select', options: 'users' }
      ]}
    ]
  },
  users: {
    sections: [
      { title: 'User', icon: 'fa-user', fields: [
        { key: 'Full_Name',  label: 'Full Name',  type: 'text', required: true },
        { key: 'Email',      label: 'Email',      type: 'email', required: true },
        { key: 'Phone',      label: 'Phone',      type: 'tel' },
        { key: 'Role',       label: 'Role',       type: 'select', options: ['Admin','Sales Manager','Sales Executive','Support Executive','Accounts','Warehouse Manager'] },
        { key: 'Department', label: 'Department', type: 'select', options: ['Management','Sales','Customer Support','Finance','Operations'] },
        { key: 'Status',     label: 'Status',     type: 'select', options: ['Active','Inactive'] }
      ]}
    ]
  },
  websites: {
    sections: [
      { title: 'Website', icon: 'fa-globe', fields: [
        { key: 'Website_Name',     label: 'Website Name',     type: 'text', required: true, span: 2 },
        { key: 'URL',              label: 'URL',              type: 'url', span: 2 },
        { key: 'Hosting_Platform', label: 'Hosting Platform', type: 'text' },
        { key: 'Focus_Category',   label: 'Focus Category',   type: 'text', span: 2 },
        { key: 'Is_Active',        label: 'Active',           type: 'select', options: ['Yes','No'] }
      ]}
    ]
  }
};

const CONFIG_OPTIONS = {
  leadStatuses: ['New','Contacted','Qualified','Nurture','Quotation Sent','Negotiation','Converted','Won','Lost'],
  industries: ['Manufacturing','PPE / Safety Equipment','Textile Trading','Chemicals','Agro Exports','Import/Export','Construction / EPC','Oil & Gas','Facility Management','Industrial Supplies','Workwear Manufacturing','Food-tech / Corporate','Insurance Surveying','Electrical','Trading'],
  clientTypes: ['New','Active','Repeat Buyer','Corporate Account','Inactive']
};

/* ============================================================
   PART B — DEMO FALLBACK DATA
   ============================================================ */

const DEMO_DATA = {
  Users: [
    { User_ID:'U001', Full_Name:'Tarangg Gupta', Email:'tarangg@chaitanyaimpex.com', Phone:'9953333520', Role:'Admin', Department:'Management', Status:'Active', Date_Joined:'2008-04-01', Last_Login:'2026-09-25 09:12' },
    { User_ID:'U002', Full_Name:'Priya Nair', Email:'priya@canvasfabric.in', Phone:'9811223344', Role:'Sales Manager', Department:'Sales', Status:'Active', Date_Joined:'2020-06-15', Last_Login:'2026-09-25 10:05' },
    { User_ID:'U003', Full_Name:'Rekha Sharma', Email:'rekha@canvasfabric.in', Phone:'9873317792', Role:'Sales Executive', Department:'Sales', Status:'Active', Date_Joined:'2021-01-10', Last_Login:'2026-09-24 18:40' },
    { User_ID:'U004', Full_Name:'Aman Verma', Email:'aman@canvasfabric.in', Phone:'9818626081', Role:'Sales Executive', Department:'Sales', Status:'Active', Date_Joined:'2021-08-20', Last_Login:'2026-09-25 11:20' },
    { User_ID:'U005', Full_Name:'Neha Gupta', Email:'neha@canvasfabric.in', Phone:'9899141023', Role:'Sales Executive', Department:'Sales', Status:'Active', Date_Joined:'2022-03-05', Last_Login:'2026-09-23 16:00' }
  ],
  Websites: [
    { Website_ID:'WEB1', Website_Name:'Canvas Fabric', URL:'https://www.canvasfabric.in', Hosting_Platform:'IndiaMart Catalog Site', Focus_Category:'Industrial Coverall, Uniform & Canvas Fabric', Is_Active:'Yes' },
    { Website_ID:'WEB2', Website_Name:'Chaitanya Impex', URL:'https://www.chaitanyaimpex.com', Hosting_Platform:'TradeIndia Catalog Site', Focus_Category:'Industrial Uniforms, Twill/Drill Fabric', Is_Active:'Yes' },
    { Website_ID:'WEB3', Website_Name:'SafeCare', URL:'https://www.safe-care.in', Hosting_Platform:'Own Website', Focus_Category:'Boiler Suits, Coveralls, Safety/FR/IFR Suits', Is_Active:'Yes' }
  ],
  Lead_Sources: [
    { Source_ID:'SRC01', Source_Name:'IndiaMart', Source_Type:'B2B Portal', Is_Active:'Yes' },
    { Source_ID:'SRC02', Source_Name:'TradeIndia', Source_Type:'B2B Portal', Is_Active:'Yes' },
    { Source_ID:'SRC03', Source_Name:'Website Enquiry Form', Source_Type:'Website', Is_Active:'Yes' },
    { Source_ID:'SRC04', Source_Name:'Referral', Source_Type:'Referral', Is_Active:'Yes' },
    { Source_ID:'SRC05', Source_Name:'Exhibition - Auto Expo', Source_Type:'Exhibition', Is_Active:'Yes' },
    { Source_ID:'SRC06', Source_Name:'Cold Call', Source_Type:'Outbound', Is_Active:'Yes' },
    { Source_ID:'SRC08', Source_Name:'LinkedIn', Source_Type:'Social Media', Is_Active:'Yes' },
    { Source_ID:'SRC09', Source_Name:'WhatsApp Inquiry', Source_Type:'Direct', Is_Active:'Yes' },
    { Source_ID:'SRC13', Source_Name:'Website Callback Request', Source_Type:'Website', Is_Active:'Yes' },
    { Source_ID:'SRC14', Source_Name:'Website Quick Enquiry Widget', Source_Type:'Website', Is_Active:'Yes' }
  ],
  Pipeline_Stages: [
    { Stage_ID:'STG1', Stage_Name:'New',            Stage_Order:1, Win_Probability:5,   Color_Code:'#94A3B8' },
    { Stage_ID:'STG2', Stage_Name:'Contacted',      Stage_Order:2, Win_Probability:15,  Color_Code:'#60A5FA' },
    { Stage_ID:'STG3', Stage_Name:'Qualified',      Stage_Order:3, Win_Probability:30,  Color_Code:'#38BDF8' },
    { Stage_ID:'STG4', Stage_Name:'Nurture',        Stage_Order:4, Win_Probability:20,  Color_Code:'#A78BFA' },
    { Stage_ID:'STG5', Stage_Name:'Quotation Sent', Stage_Order:5, Win_Probability:50,  Color_Code:'#FBBF24' },
    { Stage_ID:'STG6', Stage_Name:'Negotiation',    Stage_Order:6, Win_Probability:70,  Color_Code:'#FB923C' },
    { Stage_ID:'STG7', Stage_Name:'Won',            Stage_Order:7, Win_Probability:100, Color_Code:'#22C55E' },
    { Stage_ID:'STG8', Stage_Name:'Lost',           Stage_Order:8, Win_Probability:0,   Color_Code:'#EF4444' }
  ],
  Companies: [
    { Company_ID:'CO0001', Company_Name:'Alwin Switchgear Solutions', Industry:'Manufacturing', City:'Salem', State:'Tamil Nadu', Country:'India', Phone:'9790448519', Email:'gearsolutions@gmail.com', Account_Owner:'U003', Source_ID:'SRC03', Website_ID:'WEB1', Client_Type:'Repeat Buyer', Created_Date:'2021-11-24' },
    { Company_ID:'CO0002', Company_Name:'Paracoat Industries', Industry:'Chemicals', City:'Pune', State:'Maharashtra', Country:'India', Phone:'7503061471', Email:'saurabh.duvey@paracoat.com', Account_Owner:'U004', Source_ID:'SRC05', Website_ID:'WEB2', Client_Type:'Active', Created_Date:'2022-02-10' },
    { Company_ID:'CO0006', Company_Name:'UAE Yellow Pages Trading LLC', Industry:'Import/Export', City:'Dubai', State:'Dubai', Country:'UAE', Phone:'+971552099466', Email:'siggi@cert.assind.vi.it', Account_Owner:'U002', Source_ID:'SRC02', Website_ID:'WEB2', Client_Type:'Repeat Buyer', Created_Date:'2021-08-15' },
    { Company_ID:'CO0013', Company_Name:'Larsen & Toubro Ltd', Industry:'Construction / EPC', City:'Mumbai', State:'Maharashtra', Country:'India', Phone:'-', Email:'procurement.workwear@larsentoubro.com', Account_Owner:'U002', Source_ID:'SRC04', Website_ID:'WEB3', Client_Type:'Corporate Account', Created_Date:'2023-09-12' }
  ],
  Contacts: [
    { Contact_ID:'C0001', Company_ID:'CO0001', Full_Name:'Ali Ansari', Designation:'Manager', Email:'gearsolutions@gmail.com', Phone:'9790448519', Alt_Phone:'-', Is_Primary:'Yes', Created_Date:'2021-11-24' },
    { Contact_ID:'C0002', Company_ID:'CO0002', Full_Name:'Saurabh Duvey', Designation:'Purchase Head', Email:'saurabh.duvey@paracoat.com', Phone:'7503061471', Alt_Phone:'-', Is_Primary:'Yes', Created_Date:'2022-02-10' },
    { Contact_ID:'C0006', Company_ID:'CO0006', Full_Name:'Siggi Muller', Designation:'Import Manager', Email:'siggi@cert.assind.vi.it', Phone:'+971552099466', Alt_Phone:'+264811271819', Is_Primary:'Yes', Created_Date:'2021-08-15' }
  ],
  Leads: [
    { Lead_ID:'L0004', Date_Received:'2022-02-10', Source_ID:'SRC05', Website_ID:'WEB2', Company_Name:'Paracoat Industries', Contact_Name:'Saurabh Duvey', Email:'saurabh.duvey@paracoat.com', Phone:'7503061471', City:'Pune', State:'Maharashtra', Country:'India', Industry:'Chemicals', Requirement:'Chemical protective coveralls - bulk', Quantity:'500', Estimated_Value:'350000', Currency:'INR', Status:'Qualified', Stage_ID:'STG3', Assigned_To:'U004', Priority:'High', Tags:'coverall,bulk', Message:'Interested after Auto Expo demo', Catalogue_Sent:'Yes', Next_Followup_Date:'2026-10-02', Created_Date:'2022-02-10', Updated_Date:'2026-09-18' },
    { Lead_ID:'L0005', Date_Received:'2022-02-11', Source_ID:'SRC05', Website_ID:'WEB2', Company_Name:'Rivon Gaskets Pvt Ltd', Contact_Name:'Prateek Malhotra', Email:'prateek@rivongaskets.com', Phone:'9811357656', City:'Ahmedabad', State:'Gujarat', Country:'India', Industry:'Manufacturing', Requirement:'Cotton twill workwear uniforms', Quantity:'300', Estimated_Value:'210000', Currency:'INR', Status:'Quotation Sent', Stage_ID:'STG5', Assigned_To:'U004', Priority:'High', Tags:'uniform,twill', Message:'Needs GSM 240 fabric', Catalogue_Sent:'Yes', Next_Followup_Date:'2026-09-29', Created_Date:'2022-02-11', Updated_Date:'2026-09-19' },
    { Lead_ID:'L0007', Date_Received:'2021-08-15', Source_ID:'SRC02', Website_ID:'WEB2', Company_Name:'UAE Yellow Pages Trading LLC', Contact_Name:'Siggi Muller', Email:'siggi@cert.assind.vi.it', Phone:'+971552099466', City:'Dubai', State:'Dubai', Country:'UAE', Industry:'Import/Export', Requirement:'Canvas fabric - container load', Quantity:'1', Estimated_Value:'2500000', Currency:'INR', Status:'Won', Stage_ID:'STG7', Assigned_To:'U002', Priority:'High', Tags:'canvas,export,container', Message:'Repeat buyer since 2021', Catalogue_Sent:'Yes', Created_Date:'2021-08-15', Updated_Date:'2026-08-01' },
    { Lead_ID:'L0008', Date_Received:'2023-01-20', Source_ID:'SRC01', Website_ID:'WEB1', Company_Name:'Falcon Safety Wear Trading', Contact_Name:'Hamdan Al Marri', Email:'info@falconsafety.ae', Phone:'+971501122334', City:'Sharjah', State:'Sharjah', Country:'UAE', Industry:'PPE / Safety Equipment', Requirement:'Hi-Vis coveralls with reflective tape', Quantity:'1000', Estimated_Value:'900000', Currency:'INR', Status:'Quotation Sent', Stage_ID:'STG5', Assigned_To:'U003', Priority:'High', Tags:'hivis,reflective,export', Message:'Sent catalogue + price list', Catalogue_Sent:'Yes', Next_Followup_Date:'2026-10-01', Created_Date:'2023-01-20', Updated_Date:'2026-09-21' }
  ],
  Deals: [
    { Deal_ID:'D0002', Deal_Name:'Paracoat - Chemical Coverall Bulk Order', Lead_ID:'L0004', Company_ID:'CO0002', Contact_ID:'C0002', Stage_ID:'STG3', Value:350000, Currency:'INR', Probability:30, Expected_Close_Date:'2026-10-15', Actual_Close_Date:'-', Owner:'U004', Status:'Open', Lost_Reason:'-', Created_Date:'2022-02-10' },
    { Deal_ID:'D0005', Deal_Name:'UAE Yellow Pages - Canvas Container Deal', Lead_ID:'L0007', Company_ID:'CO0006', Contact_ID:'C0006', Stage_ID:'STG7', Value:2500000, Currency:'INR', Probability:100, Expected_Close_Date:'2026-07-20', Actual_Close_Date:'2026-08-01', Owner:'U002', Status:'Won', Lost_Reason:'-', Created_Date:'2021-08-15' },
    { Deal_ID:'D0006', Deal_Name:'Falcon Safety - HiVis Coverall Export', Lead_ID:'L0008', Company_ID:'CO0007', Contact_ID:'C0007', Stage_ID:'STG5', Value:900000, Currency:'INR', Probability:50, Expected_Close_Date:'2026-10-10', Actual_Close_Date:'-', Owner:'U003', Status:'Open', Lost_Reason:'-', Created_Date:'2023-01-20' }
  ],
  Activities: [
    { Activity_ID:'A0002', Related_To_Type:'Deal', Related_To_ID:'D0002', Activity_Type:'Email', Subject:'Sent chemical coverall quote', Notes:'Quoted GSM 240, 500 pcs @ Rs.700', Activity_Date:'2026-09-24', Activity_Time:'11:30', Duration_Min:5, Outcome:'Awaiting response', Next_Action:'Follow up call', Next_Followup_Date:'2026-10-02', Assigned_To:'U004', Status:'Completed' },
    { Activity_ID:'A0005', Related_To_Type:'Lead', Related_To_ID:'L0008', Activity_Type:'Email', Subject:'Hi-Vis coverall catalogue sent', Notes:'Sent catalogue + price list PDF', Activity_Date:'2026-09-21', Activity_Time:'10:15', Duration_Min:5, Outcome:'Sent', Next_Action:'Wait for buyer feedback', Next_Followup_Date:'2026-10-01', Assigned_To:'U003', Status:'Completed' }
  ],
  Tasks: [
    { Task_ID:'T0002', Title:'Prepare formal quotation - Rivon', Description:'Draft quotation for 300 pcs cotton twill uniforms', Related_To_Type:'Deal', Related_To_ID:'D0003', Due_Date:'2026-09-28', Priority:'High', Status:'In Progress', Assigned_To:'U004', Created_By:'U002', Created_Date:'2026-09-19' },
    { Task_ID:'T0009', Title:'Weekly sales review meeting', Description:'Review pipeline with all sales executives', Related_To_Type:'-', Related_To_ID:'-', Due_Date:'2026-09-29', Priority:'Medium', Status:'Open', Assigned_To:'U002', Created_By:'U001', Created_Date:'2026-09-22' }
  ],
  Products: [
    { Product_ID:'P0001', Product_Name:'Orange Zipper Cotton Boiler Suit', Category:'Boiler Suit', Website_ID:'WEB1', Fabric_Spec:'Cotton, approx 210 GSM', HSN_Code:'6211', Unit:'Piece', Unit_Price:500, Currency:'INR', Certification:'-', Description:'Zipper-front cotton boiler suit', Stock_Status:'In Stock' },
    { Product_ID:'P0004', Product_Name:'ADNOC Approved IFR Coverall', Category:'Fire Retardant Suit', Website_ID:'WEB1', Fabric_Spec:'Inherent Fire Retardant fabric', HSN_Code:'6211', Unit:'Piece', Unit_Price:2100, Currency:'INR', Certification:'ADNOC Approved', Description:'Certified inherent FR coverall', Stock_Status:'Made to Order' }
  ],
  Templates: [
    { Template_ID:'TP01', Template_Name:'HiVis Fabric Intro', Channel:'Email', Website_ID:'WEB1', Subject:'Re: Fluorescent Hi-Viz fabric', Body:'Thanks for your enquiry...', Category:'Intro', Created_By:'U002' }
  ],
  Notes: [
    { Note_ID:'N0003', Related_To_Type:'Deal', Related_To_ID:'D0003', Note_Text:'Client wants sample GSM 240 approved before confirming.', Created_By:'U004', Created_Date:'2026-09-19' }
  ]
};

/* ============================================================
   PART C — APP STATE
   ============================================================ */

const APP = {
  view: 'dashboard',
  subview: 'list',
  data: {},
  user: null,
  filters: {},
  sort: { field: null, dir: 'asc' },
  page: 1,
  pageSize: 15,
  selected: new Set(),
  calendarMonth: new Date(),
  editing: null,
  searchQuery: '',
  loading: false
};

/* ============================================================
   PART D — UTILITIES
   ============================================================ */

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
}
function uid() { return 'x' + Math.random().toString(36).slice(2, 10); }
function fmt(n, opts) {
  if (n == null || n === '' || isNaN(n)) return '—';
  return Number(n).toLocaleString(CONFIG.locale, opts || {});
}
function fmtCur(n) {
  if (n == null || n === '' || isNaN(n) || Number(n) === 0) return '—';
  const v = Number(n);
  if (v >= 10000000) return CONFIG.currency + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000)   return CONFIG.currency + (v / 100000).toFixed(2) + ' L';
  if (v >= 1000)     return CONFIG.currency + (v / 1000).toFixed(1) + 'K';
  return CONFIG.currency + fmt(v);
}
function fmtDate(d) {
  if (!d || d === '-' || d === '') return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const day = dt.getDate().toString().padStart(2,'0');
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()];
  return `${day} ${mon} ${dt.getFullYear()}`;
}
function fmtDateShort(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()];
  return `${dt.getDate()} ${mon}`;
}
function relTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const diff = Math.floor((now - dt) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return fmtDate(d);
}
function initials(name) {
  if (!name) return '??';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}
function avatarColor(seed) {
  const palette = ['#4f46e5','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#0ea5e9','#06b6d4'];
  let h = 0;
  String(seed || '').split('').forEach(c => { h = ((h << 5) - h) + c.charCodeAt(0); h |= 0; });
  return palette[Math.abs(h) % palette.length];
}
function firstCharColor(str) {
  const c = avatarColor(str);
  return `background: linear-gradient(135deg, ${c}, ${shadeColor(c, -20)})`;
}
function shadeColor(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  r = Math.max(0, Math.min(255, r + Math.round(2.55 * pct)));
  g = Math.max(0, Math.min(255, g + Math.round(2.55 * pct)));
  b = Math.max(0, Math.min(255, b + Math.round(2.55 * pct)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function debounce(fn, ms) {
  let t;
  return function() { clearTimeout(t); const a = arguments, c = this; t = setTimeout(() => fn.apply(c, a), ms || 200); };
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function isToday(d) { return d === today(); }
function isOverdue(d) {
  if (!d || d === '-' || d === '') return false;
  return new Date(d) < new Date(today());
}

/* ---------- Getter helpers ---------- */
function getRows(module) {
  const m = MODULES[module];
  if (!m || !m.sheet) return [];
  return APP.data[m.sheet] || [];
}
function getStages() { return APP.data.Pipeline_Stages || []; }
function getStageById(id) { return getStages().find(s => s.Stage_ID === id); }
function getStageName(id) { const s = getStageById(id); return s ? s.Stage_Name : (id || '—'); }
function getStageColor(id) { const s = getStageById(id); return s ? s.Color_Code : '#94A3B8'; }
function getUserById(id) { return (APP.data.Users || []).find(u => u.User_ID === id); }
function getUserName(id) { const u = getUserById(id); return u ? u.Full_Name : (id || '—'); }
function getCompanyById(id) { return (APP.data.Companies || []).find(c => c.Company_ID === id); }
function getCompanyName(id) { const c = getCompanyById(id); return c ? c.Company_Name : (id || '—'); }
function getSourceById(id) { return (APP.data.Lead_Sources || []).find(s => s.Source_ID === id); }
function getSourceName(id) { const s = getSourceById(id); return s ? s.Source_Name : (id || '—'); }
function getWebsiteById(id) { return (APP.data.Websites || []).find(w => w.Website_ID === id); }
function getWebsiteName(id) { const w = getWebsiteById(id); return w ? w.Website_Name : (id || '—'); }

/* ============================================================
   PART E — AUTH / LOGIN
   ============================================================ */

function showLogin() {
  $('#loginView').classList.remove('hidden');
  $('#app').classList.add('hidden'); 
  const pw = $('#loginPassword'); if (pw) pw.value = '';
  const em = $('#loginEmail'); if (em && APP.user) em.value = APP.user.email || '';
}

function showApp() {
  $('#loginView').classList.add('hidden');
  $('#app').classList.remove('hidden');
  updateUserUI();
  buildNav();
  updateTopbar();
  renderView();
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  const errEl = $('#loginError');
  errEl.style.color = '';
  errEl.textContent = 'Signing in...';

  try {
    const r = await API.login(email, password);

    if (r && r.firstLogin) {
      errEl.style.color = '#16a34a';
      errEl.textContent = r.message || 'Password saved. Please login again with the same password.';
      $('#loginPassword').value = '';
      $('#loginPassword').focus();
      return;
    }
    if (!r || !r.success) {
      errEl.style.color = '#dc2626';
      errEl.textContent = (r && r.error) || 'Login failed';
      return;
    }

    errEl.textContent = '';
    APP.user = r.user;
    setSession(r.user, r.token);
    showApp();
    await loadAllData();

    setTimeout(() => toast('Welcome back, ' + (APP.user.name || APP.user.email).split(' ')[0] + '!', 'Logged in successfully', 'success'), 400);
  } catch (err) {
    errEl.style.color = '#dc2626';
    errEl.textContent = describeApiError(err);
  }
}

async function handleLogout() {
  const ok = await confirmDialog({
    title: 'Sign out?',
    message: 'You will need to login again with your email and password.',
    confirmText: 'Sign out',
    danger: true
  });
  if (!ok) return;
  try { await API.logout(); } catch (e) {}
  APP.data = {};
  APP.user = null;
  showLogin();
  toast('Signed out', 'Come back soon!', 'info');
}

async function loadAllData(silent) {
  if (APP.loading) return;
  APP.loading = true;
  try {
    const r = await API.getAllData();
    if (!r || !r.success) {
      if (!silent) toast('Data load failed', (r && r.error) || 'Using cached data', 'warning');
      return;
    }
    APP.data = DataXform.fullDataset(r);
    buildNav();
    renderView();
    if (!silent) toast('Synced', 'Data loaded from Google Sheet', 'success');
  } catch (err) {
    /* Fallback to demo data if backend unreachable */
    if (!Object.keys(APP.data).length) {
      APP.data = JSON.parse(JSON.stringify(DEMO_DATA));
      toast('Offline mode', 'Using demo data — backend unreachable', 'warning');
      renderView();
    }
  } finally {
    APP.loading = false;
  }
}

/* Register session expiry handler */
if (typeof onSessionExpired === 'function') {
  onSessionExpired(() => {
    toast('Session expired', 'Please login again', 'warning');
    APP.data = {};
    APP.user = null;
    showLogin();
  });
}

/* ============================================================
   PART F — NAVIGATION
   ============================================================ */

function buildNav() {
  const root = $('#navRoot');
  if (!root) return;
  let html = '';
  NAV_GROUPS.forEach(g => {
    const items = Object.entries(MODULES).filter(([k, m]) => m.group === g.id);
    if (!items.length) return;
    const isCollapsed = g.id !== 'main' && g.id !== 'sales' && localStorage.getItem('ci_nav_' + g.id) === 'closed';
    html += `<div class="nav-group ${isCollapsed ? 'collapsed' : ''}" data-group="${g.id}">`;
    if (g.label) {
      html += `<div class="nav-group-title" onclick="toggleNavGroup('${g.id}')">
        <span>${g.label}</span><i class="fa-solid fa-chevron-down"></i></div>`;
    }
    html += `<div class="nav-group-items">`;
    items.forEach(([key, m]) => {
      const count = m.sheet ? (APP.data[m.sheet] || []).length : '';
      const active = APP.view === key ? 'active' : '';
      html += `<div class="nav-item ${active}" data-key="${key}" onclick="go('${key}')">
        <i class="fa-solid ${m.icon} nav-icon"></i>
        <span class="nav-label">${m.label}</span>
        ${count !== '' && count > 0 ? `<span class="nav-badge">${count}</span>` : ''}
      </div>`;
    });
    html += `</div></div>`;
  });
  root.innerHTML = html;
}

function toggleNavGroup(id) {
  const el = document.querySelector(`.nav-group[data-group="${id}"]`);
  if (!el) return;
  el.classList.toggle('collapsed');
  localStorage.setItem('ci_nav_' + id, el.classList.contains('collapsed') ? 'closed' : 'open');
}

function filterMenu(q) {
  q = (q || '').toLowerCase().trim();
  $$('.nav-item').forEach(el => {
    const label = MODULES[el.dataset.key]?.label.toLowerCase() || '';
    el.style.display = (!q || label.includes(q)) ? '' : 'none';
  });
  $$('.nav-group').forEach(g => {
    const any = $$('.nav-item', g).some(el => el.style.display !== 'none');
    g.style.display = any ? '' : 'none';
  });
}

function toggleSidebar() {
  const sb = $('#sidebar');
  const bd = $('#sidebarBackdrop');
  const isOpen = sb.classList.toggle('open');
  if (bd) bd.classList.toggle('active', isOpen);
}

function setActiveNav() {
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.key === APP.view));
}

function updateTopbar() {
  const m = MODULES[APP.view];
  if (!m) return;
  $('#pageTitle').textContent = m.label;
  const group = NAV_GROUPS.find(g => g.id === m.group);
  const crumb = $('#pageCrumb');
  if (crumb) {
    crumb.innerHTML = `<i class="fa-solid fa-house"></i><span>Home</span>
      ${group && group.label ? `<i class="fa-solid fa-chevron-right"></i><span>${group.label}</span>` : ''}
      <i class="fa-solid fa-chevron-right"></i><span>${m.label}</span>`;
  }
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ci_theme', next);
  $('#themeIcon').className = next === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
}

function initTheme() {
  document.documentElement.setAttribute('data-theme', CONFIG.theme);
  if (CONFIG.theme === 'dark') $('#themeIcon').className = 'fa-regular fa-sun';
}

function updateUserUI() {
  const u = APP.user || {};
  const name = u.name || u.email || 'User';
  $('#userName').textContent = name;
  $('#userRole').textContent = (u.role || '') + (u.department ? ' • ' + u.department : '');
  $('#userAvatar').textContent = initials(name);
  $('#topAvatar').textContent = initials(name);
  $('#userAvatar').style.cssText = firstCharColor(name);
  $('#topAvatar').style.cssText = firstCharColor(name);
}

/* ============================================================
   PART G — UI HELPERS (toast / modal / dropdown / drawer)
   ============================================================ */

function toast(title, desc, type) {
  const id = uid();
  const icons = { success: 'fa-check', error: 'fa-xmark', warning: 'fa-triangle-exclamation', info: 'fa-info' };
  const html = `<div class="toast ${type || ''}" id="${id}">
    <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
    <div class="toast-body">
      <div class="toast-title">${esc(title)}</div>
      ${desc ? `<div class="toast-desc">${esc(desc)}</div>` : ''}
    </div>
    <button class="icon-btn" onclick="document.getElementById('${id}').remove()" style="width:20px;height:20px;font-size:11px">
      <i class="fa-solid fa-xmark"></i></button>
  </div>`;
  const wrap = $('#toastWrap');
  if (wrap) {
    wrap.insertAdjacentHTML('beforeend', html);
    setTimeout(() => { const el = document.getElementById(id); if (el) el.remove(); }, 4200);
  }
}

function closeAllDropdowns() { const l = $('#dropdownLayer'); if (l) l.innerHTML = ''; }

function openDropdown(anchorEl, html, opts) {
  closeAllDropdowns();
  opts = opts || {};
  const rect = anchorEl.getBoundingClientRect();
  const wrap = document.createElement('div');
  const pos = opts.align === 'left'
    ? `left:${rect.left}px;top:${rect.bottom + 6}px`
    : `left:${rect.right}px;top:${rect.bottom + 6}px;transform:translateX(-100%)`;
  wrap.style.cssText = `position:fixed;${pos};z-index:250`;
  wrap.innerHTML = html;
  $('#dropdownLayer').appendChild(wrap);
  const off = (e) => {
    if (!wrap.contains(e.target) && e.target !== anchorEl) {
      closeAllDropdowns();
      document.removeEventListener('mousedown', off);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', off), 10);
}

function openModal(opts) {
  const { title, icon, body, footer, size, onMount } = opts;
  const id = 'modal_' + uid();
  const html = `<div class="overlay" onclick="closeModal('${id}')"></div>
    <div class="modal-container" id="${id}">
      <div class="modal ${size ? 'modal-' + size : ''}" onclick="event.stopPropagation()">
        <div class="modal-head">
          ${icon ? `<div class="modal-icon"><i class="fa-solid ${icon}"></i></div>` : ''}
          <div class="modal-title">${title}</div>
          <button class="icon-btn" onclick="closeModal('${id}')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
      </div>
    </div>`;
  $('#modalLayer').insertAdjacentHTML('beforeend', html);
  if (onMount) setTimeout(() => onMount(document.getElementById(id)), 10);
  return id;
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.previousElementSibling && el.previousElementSibling.classList.contains('overlay')) el.previousElementSibling.remove();
  el.remove();
}

function openDrawer(opts) {
  const { title, icon, body, footer, wide, onMount } = opts;
  const id = 'drawer_' + uid();
  const html = `<div class="drawer-overlay" onclick="closeDrawer('${id}')"></div>
    <div class="drawer ${wide ? 'wide' : ''}" id="${id}">
      <div class="drawer-head">
        ${icon ? `<div class="modal-icon"><i class="fa-solid ${icon}"></i></div>` : ''}
        <div class="drawer-title">${title}</div>
        <button class="icon-btn" onclick="closeDrawer('${id}')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="drawer-body">${body}</div>
      ${footer ? `<div class="drawer-foot">${footer}</div>` : ''}
    </div>`;
  $('#drawerLayer').insertAdjacentHTML('beforeend', html);
  if (onMount) setTimeout(() => onMount(document.getElementById(id)), 10);
  return id;
}

function closeDrawer(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.previousElementSibling && el.previousElementSibling.classList.contains('drawer-overlay')) el.previousElementSibling.remove();
  el.remove();
}

function confirmDialog(opts) {
  return new Promise(resolve => {
    const { title, message, confirmText, cancelText, danger } = opts;
    const id = 'cfm_' + uid();
    const html = `<div class="overlay" onclick="resolveConfirm('${id}', false)"></div>
      <div class="modal-container" id="${id}" style="pointer-events:none">
        <div class="confirm-dialog" style="pointer-events:auto">
          <div class="confirm-icon" ${danger ? '' : 'style="background:var(--brand-soft);color:var(--brand)"'}>
            <i class="fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}"></i>
          </div>
          <div class="confirm-title">${esc(title || 'Confirm')}</div>
          <div class="confirm-msg">${message || 'Are you sure?'}</div>
          <div class="confirm-actions">
            <button class="btn btn-secondary" onclick="resolveConfirm('${id}', false)">${esc(cancelText || 'Cancel')}</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" onclick="resolveConfirm('${id}', true)">${esc(confirmText || 'Confirm')}</button>
          </div>
        </div>
      </div>`;
    $('#modalLayer').insertAdjacentHTML('beforeend', html);
    window['_cfm_' + id] = resolve;
  });
}
function resolveConfirm(id, val) {
  const el = document.getElementById(id);
  if (el) {
    if (el.previousElementSibling) el.previousElementSibling.remove();
    el.remove();
  }
  const fn = window['_cfm_' + id];
  if (fn) { fn(val); delete window['_cfm_' + id]; }
}

function closeAllModals() { const l = $('#modalLayer'); if (l) l.innerHTML = ''; }

/* ============================================================
   PART H — ROUTER / VIEW RENDERERS
   ============================================================ */

function go(view, subview) {
  APP.view = view;
  APP.subview = subview || 'list';
  APP.page = 1;
  APP.selected.clear();
  APP.filters = {};
  APP.sort = { field: null, dir: 'asc' };
  setActiveNav();
  updateTopbar();
  renderView();
 if (window.innerWidth < 900) {
  $('#sidebar').classList.remove('open');
  const bd = $('#sidebarBackdrop');
  if (bd) bd.classList.remove('active');
}
}

function renderView() {
if (!area) return;
area.innerHTML = '';  // reset
const v = APP.view;
  if (v === 'dashboard') { area.innerHTML = renderDashboard(); mountDashboard(); return; }
  if (v === 'reports')   { area.innerHTML = renderReports();   mountReports();   return; }
  if (v === 'settings')  { area.innerHTML = renderSettings();  return; }
  if (MODULES[v] && MODULES[v].sheet) {
    area.innerHTML = renderModuleShell(v);
    renderModuleBody(v);
    return;
  }
  area.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-circle-info"></i></div><h3>Coming soon</h3></div>`;


}

/* ============================================================
   PART I — DASHBOARD
   ============================================================ */

function renderDashboard() {
  const leads = APP.data.Leads || [];
  const deals = APP.data.Deals || [];
  const tasks = APP.data.Tasks || [];
  const activities = APP.data.Activities || [];
  const companies = APP.data.Companies || [];
  const openDeals = deals.filter(d => d.Status === 'Open');
  const wonDeals = deals.filter(d => d.Status === 'Won');
  const lostDeals = deals.filter(d => d.Status === 'Lost');
  const pipeline = openDeals.reduce((s, d) => s + Number(d.Value || 0), 0);
  const wonValue = wonDeals.reduce((s, d) => s + Number(d.Value || 0), 0);
  const openTasks = tasks.filter(t => t.Status !== 'Done' && t.Status !== 'Completed').length;
  const overdueTasks = tasks.filter(t => t.Status !== 'Done' && isOverdue(t.Due_Date)).length;
  const winRate = (wonDeals.length + lostDeals.length) > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;
  const newLeads = leads.filter(l => l.Status === 'New').length;

  const topDeals = [...openDeals].sort((a,b) => Number(b.Value||0) - Number(a.Value||0)).slice(0,5);
  const recentActivities = [...activities].sort((a,b) => (b.Activity_Date||'').localeCompare(a.Activity_Date||'')).slice(0,5);
  const upcomingTasks = tasks.filter(t => t.Status !== 'Done' && t.Status !== 'Completed')
    .sort((a,b) => (a.Due_Date||'').localeCompare(b.Due_Date||'')).slice(0, 5);

  return `
    <div class="view-scroll">
      <div style="margin-bottom:18px">
        <h1 style="font-size:22px;font-weight:800;letter-spacing:-.02em">
          Good ${getTimeOfDay()}, ${esc((APP.user?.name || 'User').split(' ')[0])} 👋
        </h1>
        <p class="text-sm text-mute" style="margin-top:3px">
          Here's your sales snapshot — ${new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
        </p>
      </div>

      <div class="kpi-grid">
        ${kpi('Total Leads', leads.length, 'fa-user-plus', 'brand', `+${newLeads} new`, 'up')}
        ${kpi('Open Deals', openDeals.length, 'fa-handshake', 'purple', fmtCur(pipeline) + ' pipeline', 'info')}
        ${kpi('Won Deals', wonDeals.length, 'fa-trophy', 'success', fmtCur(wonValue) + ' value', 'up')}
        ${kpi('Open Tasks', openTasks, 'fa-list-check', 'warning', overdueTasks > 0 ? overdueTasks + ' overdue' : 'On track', overdueTasks > 0 ? 'down' : 'up')}
      </div>

      <div class="grid-4 mb-4">
        ${miniKpi('Win Rate', winRate + '%', 'fa-chart-line', 'success')}
        ${miniKpi('Lost Deals', lostDeals.length, 'fa-thumbs-down', 'danger')}
        ${miniKpi('Companies', companies.length, 'fa-building', 'brand')}
        ${miniKpi('Activities', activities.length, 'fa-calendar-check', 'info')}
      </div>

      <div class="grid-2 mb-4">
        <div class="card">
          <div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-column"></i>Pipeline by Stage</div></div>
          <div class="card-body"><div class="chart-container"><canvas id="chartPipeline"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-line"></i>Leads Trend (6 months)</div></div>
          <div class="card-body"><div class="chart-container"><canvas id="chartLeadsTrend"></canvas></div></div>
        </div>
      </div>

      <div class="grid-2 mb-4">
        <div class="card">
          <div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Leads by Source</div></div>
          <div class="card-body"><div class="chart-container"><canvas id="chartSource"></canvas></div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-simple"></i>Deal Funnel</div></div>
          <div class="card-body"><div class="chart-container"><canvas id="chartFunnel"></canvas></div></div>
        </div>
      </div>

      <div class="grid-2 mb-4">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-fire"></i>Top Open Deals</div>
            <button class="btn btn-ghost btn-sm" onclick="go('deals')">View all <i class="fa-solid fa-arrow-right"></i></button>
          </div>
          <div class="card-body flush">
            ${topDeals.length ? topDeals.map(d => `
              <div style="padding:11px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;cursor:pointer" onclick="openDetail('deals','${d.Deal_ID}')">
                <div class="cell-avatar" style="${firstCharColor(d.Deal_Name)}">${initials(d.Deal_Name)}</div>
                <div style="flex:1;min-width:0">
                  <div class="truncate" style="font-weight:600;font-size:13px">${esc(d.Deal_Name)}</div>
                  <div class="text-xs text-mute truncate">${esc(getCompanyName(d.Company_ID))}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-weight:700">${fmtCur(d.Value)}</div>
                  <div class="text-xs" style="color:${getStageColor(d.Stage_ID)};font-weight:600">${esc(getStageName(d.Stage_ID))}</div>
                </div>
              </div>`).join('') : `<div class="empty-state" style="padding:30px"><p>No open deals</p></div>`}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i class="fa-solid fa-clock"></i>Upcoming Tasks</div>
            <button class="btn btn-ghost btn-sm" onclick="go('tasks')">View all <i class="fa-solid fa-arrow-right"></i></button>
          </div>
          <div class="card-body flush">
            ${upcomingTasks.length ? upcomingTasks.map(t => {
              const overdue = isOverdue(t.Due_Date);
              return `<div style="padding:11px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;cursor:pointer" onclick="openDetail('tasks','${t.Task_ID}')">
                <div style="width:32px;height:32px;border-radius:9px;background:${overdue ? 'var(--danger-soft)' : 'var(--warning-soft)'};color:${overdue ? 'var(--danger)' : 'var(--warning)'};display:grid;place-items:center;flex-shrink:0">
                  <i class="fa-solid fa-list-check" style="font-size:13px"></i>
                </div>
                <div style="flex:1;min-width:0">
                  <div class="truncate" style="font-weight:600;font-size:13px">${esc(t.Title)}</div>
                  <div class="text-xs text-mute">${esc(getUserName(t.Assigned_To))}</div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-weight:600;font-size:12px;color:${overdue ? 'var(--danger)' : 'var(--text)'}">${fmtDateShort(t.Due_Date)}</div>
                  <span class="badge ${t.Priority === 'High' ? 'danger' : t.Priority === 'Medium' ? 'warning' : 'info'}">${esc(t.Priority)}</span>
                </div>
              </div>`;
            }).join('') : `<div class="empty-state" style="padding:30px"><p>All caught up! 🎉</p></div>`}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-wave-square"></i>Recent Activity</div>
          <button class="btn btn-ghost btn-sm" onclick="go('activities')">View all <i class="fa-solid fa-arrow-right"></i></button>
        </div>
        <div class="card-body flush">
          ${recentActivities.length ? recentActivities.map(a => `
            <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:12px;cursor:pointer" onclick="openDetail('activities','${a.Activity_ID}')">
              <div class="cell-avatar" style="${firstCharColor(a.Subject)};width:34px;height:34px">
                <i class="fa-solid ${activityIcon(a.Activity_Type)}"></i>
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <div class="truncate" style="font-weight:600;font-size:13px">${esc(a.Subject)}</div>
                  <span class="badge brand" style="font-size:10px">${esc(a.Activity_Type)}</span>
                </div>
                <div class="text-xs text-mute truncate" style="margin-top:2px">${esc(a.Notes)}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div class="text-xs text-mute">${relTime(a.Activity_Date)}</div>
                <div class="text-xs" style="margin-top:2px">${esc(getUserName(a.Assigned_To))}</div>
              </div>
            </div>
          `).join('') : `<div class="empty-state" style="padding:30px"><p>No activities yet</p></div>`}
        </div>
      </div>
    </div>`;
}

function getTimeOfDay() { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; }
function activityIcon(type) { return { Call:'fa-phone', Email:'fa-envelope', Meeting:'fa-handshake', WhatsApp:'fa-comment', SMS:'fa-message' }[type] || 'fa-bolt'; }
function kpi(label, value, icon, color, deltaText, deltaType) {
  return `<div class="kpi">
    <div class="kpi-top">
      <div class="kpi-label">${esc(label)}</div>
      <div class="kpi-icon ${color}"><i class="fa-solid ${icon}"></i></div>
    </div>
    <div class="kpi-value">${esc(value)}</div>
    ${deltaText ? `<div class="kpi-delta ${deltaType || 'up'}">
      <i class="fa-solid ${deltaType === 'down' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
      <span>${esc(deltaText)}</span></div>` : ''}
  </div>`;
}
function miniKpi(label, value, icon, color) {
  return `<div class="kpi" style="padding:12px 14px">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="kpi-icon ${color}" style="width:30px;height:30px;font-size:12px"><i class="fa-solid ${icon}"></i></div>
      <div>
        <div class="kpi-label" style="font-size:10.5px">${esc(label)}</div>
        <div style="font-size:17px;font-weight:800;margin-top:1px">${esc(value)}</div>
      </div>
    </div>
  </div>`;
}

let DASH_CHARTS = {};
function mountDashboard() {
  if (typeof Chart === 'undefined') return;
  Object.values(DASH_CHARTS).forEach(c => { try { c.destroy(); } catch(e){} });
  DASH_CHARTS = {};

  const stages = getStages();
  const deals = APP.data.Deals || [];
  const leads = APP.data.Leads || [];

  const pipelineData = stages.map(s => ({
    name: s.Stage_Name,
    value: deals.filter(d => d.Stage_ID === s.Stage_ID && d.Status !== 'Won' && d.Status !== 'Lost').reduce((sum, d) => sum + Number(d.Value||0), 0),
    color: s.Color_Code
  }));

  const c1 = document.getElementById('chartPipeline');
  if (c1) DASH_CHARTS.pipeline = new Chart(c1, {
    type: 'bar',
    data: { labels: pipelineData.map(d => d.name),
      datasets: [{ data: pipelineData.map(d => d.value), backgroundColor: pipelineData.map(d => d.color + '80'), borderColor: pipelineData.map(d => d.color), borderWidth: 2, borderRadius: 6, barThickness: 26 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmtCur(c.raw) } } },
      scales: { y: { beginAtZero: true, grid: { color: getCSS('--border') }, ticks: { color: getCSS('--text-mute'), callback: v => fmtCur(v) } }, x: { grid: { display: false }, ticks: { color: getCSS('--text-mute') } } } }
  });

  const months = [], counts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(m.toLocaleDateString('en-IN', { month: 'short' }));
    counts.push(leads.filter(l => { const d = new Date(l.Date_Received || l.Created_Date); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); }).length);
  }

  const c2 = document.getElementById('chartLeadsTrend');
  if (c2) DASH_CHARTS.trend = new Chart(c2, {
    type: 'line',
    data: { labels: months, datasets: [{ data: counts, borderColor: getCSS('--brand'), backgroundColor: getCSS('--brand') + '20', fill: true, tension: 0.4, borderWidth: 2, pointBackgroundColor: getCSS('--brand'), pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, grid: { color: getCSS('--border') }, ticks: { color: getCSS('--text-mute') } }, x: { grid: { display: false }, ticks: { color: getCSS('--text-mute') } } } }
  });

  const sourceCounts = {};
  leads.forEach(l => { const s = getSourceName(l.Source_ID); sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
  const sourceLabels = Object.keys(sourceCounts).slice(0, 6);

  const c3 = document.getElementById('chartSource');
  if (c3) DASH_CHARTS.source = new Chart(c3, {
    type: 'doughnut',
    data: { labels: sourceLabels, datasets: [{ data: sourceLabels.map(k => sourceCounts[k]), backgroundColor: ['#4f46e5','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { color: getCSS('--text-soft'), boxWidth: 10, padding: 10 } } } }
  });

  const openDeals = deals.filter(d => d.Status === 'Open');
  const funnelData = stages.slice(0, 6).map(s => ({ label: s.Stage_Name, value: openDeals.filter(d => d.Stage_ID === s.Stage_ID).length }));

  const c4 = document.getElementById('chartFunnel');
  if (c4) DASH_CHARTS.funnel = new Chart(c4, {
    type: 'bar',
    data: { labels: funnelData.map(f => f.label), datasets: [{ data: funnelData.map(f => f.value), backgroundColor: ['#94A3B8','#60A5FA','#38BDF8','#A78BFA','#FBBF24','#FB923C'], borderRadius: 4, barThickness: 22 }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, grid: { color: getCSS('--border') }, ticks: { color: getCSS('--text-mute') } }, y: { grid: { display: false }, ticks: { color: getCSS('--text-mute') } } } }
  });
}
function getCSS(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

/* ============================================================
   PART J — MODULE SHELL
   ============================================================ */

const VIEW_TYPES = {
  list:     { label: 'List',     icon: 'fa-list' },
  kanban:   { label: 'Kanban',   icon: 'fa-table-columns' },
  cards:    { label: 'Cards',    icon: 'fa-grip' },
  calendar: { label: 'Calendar', icon: 'fa-calendar' },
  timeline: { label: 'Timeline', icon: 'fa-wave-square' }
};

function renderModuleShell(module) {
  const m = MODULES[module];
  const views = getAvailableViews(module);

  return `
    <div class="view-toolbar">
      <div class="view-tabs">
        ${views.map(v => `<div class="view-tab ${APP.subview === v ? 'active' : ''}" onclick="switchSubview('${v}')">
          <i class="fa-solid ${VIEW_TYPES[v].icon}"></i><span>${VIEW_TYPES[v].label}</span>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="chip" onclick="openFilterPanel('${module}')">
          <i class="fa-solid fa-filter"></i>Filter
          ${Object.keys(APP.filters).length ? `<span class="count">${Object.keys(APP.filters).length}</span>` : ''}
        </button>
        <button class="chip" onclick="openSortPanel('${module}')"><i class="fa-solid fa-arrow-down-wide-short"></i>Sort</button>
      </div>
      <div class="spacer"></div>
      <div style="position:relative">
        <input type="text" id="moduleSearch_${module}" placeholder="Search..." value="${esc(APP.searchQuery)}"
               oninput="onModuleSearch('${module}', this.value)"
               style="padding:7px 12px 7px 30px;border-radius:8px;border:1px solid var(--border);background:var(--bg-elev);font-size:12.5px;min-width:180px;outline:none">
        <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-mute);font-size:11px;pointer-events:none"></i>
      </div>
      <button class="btn btn-primary" onclick="openCreateForm('${module}')">
        <i class="fa-solid fa-plus"></i> New ${m.label.replace(/s$/,'')}
      </button>
      <button class="icon-btn" onclick="openModuleMenu(event,'${module}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>
    </div>
    <div class="view-scroll" id="moduleBody"></div>
    <div id="bulkBarHolder"></div>
  `;
}

function getAvailableViews(module) {
  if (module === 'activities') return ['list','calendar','timeline','cards'];
  if (module === 'tasks') return ['list','kanban','cards','calendar'];
  if (module === 'leads' || module === 'deals') return ['list','kanban','cards'];
  return ['list','cards'];
}

function switchSubview(v) {
  APP.subview = v;
  renderModuleBody(APP.view);
  $$('.view-tab').forEach(el => el.classList.toggle('active', el.textContent.includes(VIEW_TYPES[v].label)));
}

function onModuleSearch(module, q) {
  APP.searchQuery = q;
  APP.page = 1;
  renderModuleBody(module);
}

function renderModuleBody(module) {
  const body = $('#moduleBody');
  if (!body) return;
  const v = APP.subview;
  if (v === 'list')          { body.classList.remove('flush'); body.innerHTML = renderListView(module); }
  else if (v === 'kanban')   { body.classList.add('flush');    body.innerHTML = renderKanbanView(module); }
  else if (v === 'cards')    { body.classList.remove('flush'); body.innerHTML = renderCardsView(module); }
  else if (v === 'calendar') { body.classList.add('flush');    body.innerHTML = renderCalendarView(module); }
  else if (v === 'timeline') { body.classList.remove('flush'); body.innerHTML = renderTimelineView(module); }
}

function openModuleMenu(ev, module) {
  ev.stopPropagation();
  openDropdown(ev.currentTarget, `
    <div class="dropdown-menu">
      <div class="dd-item" onclick="exportCSV('${module}')"><i class="fa-solid fa-file-csv"></i>Export CSV</div>
      <div class="dd-item" onclick="loadAllData()"><i class="fa-solid fa-rotate"></i>Refresh from sheet</div>
      <div class="dd-divider"></div>
      <div class="dd-item" onclick="bulkSelectAll()"><i class="fa-solid fa-square-check"></i>Select all</div>
      <div class="dd-item danger" onclick="bulkDelete('${module}')"><i class="fa-solid fa-trash"></i>Delete selected</div>
    </div>
  `);
}

/* ============================================================
   PART K — FILTER / SORT
   ============================================================ */

function applyFilters(module) {
  let rows = getRows(module).slice();
  const q = (APP.searchQuery || '').toLowerCase().trim();
  if (q) rows = rows.filter(r => Object.values(r).some(v => String(v || '').toLowerCase().includes(q)));

  Object.entries(APP.filters).forEach(([field, val]) => {
    if (val === '' || val == null) return;
    rows = rows.filter(r => String(r[field] || '') === String(val));
  });

  if (APP.sort.field) {
    const f = APP.sort.field, dir = APP.sort.dir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[f] || '', bv = b[f] || '';
      const an = Number(av), bn = Number(bv);
      if (!isNaN(an) && !isNaN(bn) && av !== '' && bv !== '') return (an - bn) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  } else {
    const m = MODULES[module];
    const dateField = module === 'leads' ? 'Date_Received' : module === 'activities' ? 'Activity_Date' : module === 'tasks' ? 'Due_Date' : 'Created_Date';
    rows.sort((a, b) => {
      const av = a[dateField] || a[m.key] || '';
      const bv = b[dateField] || b[m.key] || '';
      return String(bv).localeCompare(String(av));
    });
  }
  return rows;
}

function openFilterPanel(module) {
  const fields = getFilterFields(module);
  openModal({
    title: 'Filter ' + MODULES[module].label,
    icon: 'fa-filter',
    size: 'sm',
    body: `<div style="display:flex;flex-direction:column;gap:12px">
      ${fields.map(f => `
        <div class="form-field">
          <label class="form-label">${esc(f.label)}</label>
          <select class="form-select" onchange="setFilter('${module}','${f.key}',this.value)">
            <option value="">All</option>
            ${f.options.map(o => `<option value="${esc(o.value)}" ${APP.filters[f.key] === o.value ? 'selected':''}>${esc(o.label)}</option>`).join('')}
          </select>
        </div>
      `).join('')}
    </div>`,
    footer: `<button class="btn btn-secondary" onclick="clearFilters('${module}')">Clear all</button>
             <button class="btn btn-primary" onclick="closeAllModals()">Apply</button>`
  });
}

function setFilter(module, key, val) {
  if (val) APP.filters[key] = val; else delete APP.filters[key];
  APP.page = 1;
  renderModuleBody(module);
}

function clearFilters(module) {
  APP.filters = {};
  APP.searchQuery = '';
  renderModuleBody(module);
  toast('Filters cleared', '', 'info');
}

function getFilterFields(module) {
  const stages = getStages().map(s => ({ value: s.Stage_ID, label: s.Stage_Name }));
  const users = (APP.data.Users || []).map(u => ({ value: u.User_ID, label: u.Full_Name }));
  const sources = (APP.data.Lead_Sources || []).map(s => ({ value: s.Source_ID, label: s.Source_Name }));
  const sites = (APP.data.Websites || []).map(w => ({ value: w.Website_ID, label: w.Website_Name }));
  const companies = (APP.data.Companies || []).map(c => ({ value: c.Company_ID, label: c.Company_Name }));

  if (module === 'leads') return [
    { key:'Status', label:'Status', options: CONFIG_OPTIONS.leadStatuses.map(s => ({value:s,label:s})) },
    { key:'Stage_ID', label:'Stage', options: stages },
    { key:'Assigned_To', label:'Assigned To', options: users },
    { key:'Source_ID', label:'Source', options: sources },
    { key:'Website_ID', label:'Website', options: sites },
    { key:'Priority', label:'Priority', options: ['High','Medium','Low'].map(s => ({value:s,label:s})) }
  ];
  if (module === 'deals') return [
    { key:'Status', label:'Status', options: ['Open','Won','Lost','On Hold'].map(s => ({value:s,label:s})) },
    { key:'Stage_ID', label:'Stage', options: stages },
    { key:'Owner', label:'Owner', options: users },
    { key:'Company_ID', label:'Company', options: companies }
  ];
  if (module === 'tasks') return [
    { key:'Status', label:'Status', options: ['Open','In Progress','Done','Cancelled'].map(s => ({value:s,label:s})) },
    { key:'Priority', label:'Priority', options: ['High','Medium','Low'].map(s => ({value:s,label:s})) },
    { key:'Assigned_To', label:'Assigned To', options: users }
  ];
  if (module === 'activities') return [
    { key:'Activity_Type', label:'Type', options: ['Call','Email','Meeting','WhatsApp','SMS'].map(s => ({value:s,label:s})) },
    { key:'Status', label:'Status', options: ['Completed','Pending','Cancelled'].map(s => ({value:s,label:s})) },
    { key:'Assigned_To', label:'Assigned To', options: users }
  ];
  if (module === 'companies') return [
    { key:'Industry', label:'Industry', options: CONFIG_OPTIONS.industries.map(s => ({value:s,label:s})) },
    { key:'Client_Type', label:'Client Type', options: CONFIG_OPTIONS.clientTypes.map(s => ({value:s,label:s})) }
  ];
  return [];
}

function openSortPanel(module) {
  const fields = getSortableFields(module);
  openModal({
    title: 'Sort by',
    icon: 'fa-arrow-down-wide-short',
    size: 'sm',
    body: `<div style="display:flex;flex-direction:column;gap:8px">
      ${fields.map(f => `
        <button class="dd-item ${APP.sort.field === f.key ? 'active' : ''}"
                style="width:100%;padding:10px 12px;background:${APP.sort.field === f.key ? 'var(--brand-soft)' : 'transparent'};border-radius:8px;border:1px solid ${APP.sort.field === f.key ? 'var(--brand)' : 'var(--border)'}"
                onclick="setSort('${module}','${f.key}')">
          <i class="fa-solid fa-sort"></i> ${esc(f.label)}
          ${APP.sort.field === f.key ? `<i class="fa-solid ${APP.sort.dir === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}" style="margin-left:auto;color:var(--brand)"></i>` : ''}
        </button>
      `).join('')}
    </div>`
  });
}

function setSort(module, field) {
  if (APP.sort.field === field) {
    APP.sort.dir = APP.sort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    APP.sort.field = field;
    APP.sort.dir = 'asc';
  }
  closeAllModals();
  renderModuleBody(module);
}

function getSortableFields(module) {
  const f = FIELD_DEFS[module];
  if (!f) return [{ key: 'Created_Date', label: 'Created Date' }];
  const out = [];
  f.sections.forEach(s => s.fields.forEach(fld => out.push({ key: fld.key, label: fld.label })));
  return out;
}

/* ============================================================
   PART L — LIST VIEW
   ============================================================ */

function renderListView(module) {
  const rows = applyFilters(module);
  const total = rows.length;
  const start = (APP.page - 1) * APP.pageSize;
  const paged = rows.slice(start, start + APP.pageSize);
  const cols = getListColumns(module);

  if (!total) {
    return `<div class="empty-state">
      <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
      <h3>No ${MODULES[module].label.toLowerCase()} found</h3>
      <p>Try changing your filters or add a new record to get started.</p>
      <button class="btn btn-primary" onclick="openCreateForm('${module}')">
        <i class="fa-solid fa-plus"></i> Add ${MODULES[module].label.replace(/s$/,'')}
      </button>
    </div>`;
  }

  return `<div class="data-table-wrap">
    <div class="table-toolbar">
      <div class="text-sm text-mute">
        <strong class="text-strong">${total}</strong> records
        ${APP.selected.size > 0 ? ` • <strong class="text-brand">${APP.selected.size}</strong> selected` : ''}
      </div>
      <div style="flex:1"></div>
      <span class="text-xs text-mute">Showing ${start + 1}–${Math.min(start + APP.pageSize, total)} of ${total}</span>
    </div>
    <div class="data-table-scroll">
      <table class="data-table">
        <thead><tr>
          <th class="col-check"><input type="checkbox" onchange="toggleSelectAll(this.checked, '${module}')"></th>
          ${cols.map(c => `<th class="${c.sortable ? 'sortable' : ''} ${APP.sort.field === c.key ? 'sorted' : ''}"
            ${c.sortable ? `onclick="setSort('${module}','${c.key}')"` : ''}>
            ${esc(c.label)}${c.sortable ? `<i class="fa-solid fa-sort sort-ind"></i>` : ''}
          </th>`).join('')}
          <th class="col-actions"></th>
        </tr></thead>
        <tbody>${paged.map(r => renderListRow(module, r, cols)).join('')}</tbody>
      </table>
    </div>
    ${renderPagination(total)}
  </div>
  ${renderBulkBar(module)}`;
}

function getListColumns(module) {
  const map = {
    leads: [
      { key: 'Company_Name', label: 'Lead', type: 'primary', sortable: true },
      { key: 'Contact_Name', label: 'Contact', type: 'text' },
      { key: 'Phone', label: 'Phone', type: 'text' },
      { key: 'Source_ID', label: 'Source', type: 'source' },
      { key: 'Website_ID', label: 'Website', type: 'website' },
      { key: 'Status', label: 'Status', type: 'status' },
      { key: 'Assigned_To', label: 'Assigned', type: 'user' },
      { key: 'Estimated_Value', label: 'Value', type: 'currency', sortable: true },
      { key: 'Priority', label: 'Priority', type: 'priority' },
      { key: 'Next_Followup_Date', label: 'Follow-up', type: 'date', sortable: true }
    ],
    deals: [
      { key: 'Deal_Name', label: 'Deal', type: 'primary', sortable: true },
      { key: 'Company_ID', label: 'Company', type: 'company' },
      { key: 'Value', label: 'Value', type: 'currency', sortable: true },
      { key: 'Stage_ID', label: 'Stage', type: 'stage' },
      { key: 'Probability_%', label: 'Prob %', type: 'percent' },
      { key: 'Owner', label: 'Owner', type: 'user' },
      { key: 'Expected_Close_Date', label: 'Close Date', type: 'date', sortable: true },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    companies: [
      { key: 'Company_Name', label: 'Company', type: 'primary', sortable: true },
      { key: 'Industry', label: 'Industry', type: 'text' },
      { key: 'City', label: 'City', type: 'text' },
      { key: 'Country', label: 'Country', type: 'text' },
      { key: 'Phone', label: 'Phone', type: 'text' },
      { key: 'Email', label: 'Email', type: 'text' },
      { key: 'Account_Owner', label: 'Owner', type: 'user' },
      { key: 'Client_Type', label: 'Type', type: 'badge' }
    ],
    contacts: [
      { key: 'Full_Name', label: 'Name', type: 'primary', sortable: true },
      { key: 'Company_ID', label: 'Company', type: 'company' },
      { key: 'Designation', label: 'Designation', type: 'text' },
      { key: 'Email', label: 'Email', type: 'text' },
      { key: 'Phone', label: 'Phone', type: 'text' },
      { key: 'Is_Primary', label: 'Primary', type: 'badge' }
    ],
    activities: [
      { key: 'Subject', label: 'Subject', type: 'primary', sortable: true },
      { key: 'Activity_Type', label: 'Type', type: 'activity-type' },
      { key: 'Related_To_ID', label: 'Related To', type: 'text' },
      { key: 'Activity_Date', label: 'Date', type: 'date', sortable: true },
      { key: 'Outcome', label: 'Outcome', type: 'badge' },
      { key: 'Assigned_To', label: 'Assigned', type: 'user' },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    tasks: [
      { key: 'Title', label: 'Task', type: 'primary', sortable: true },
      { key: 'Related_To_ID', label: 'Related', type: 'text' },
      { key: 'Due_Date', label: 'Due', type: 'due-date', sortable: true },
      { key: 'Priority', label: 'Priority', type: 'priority' },
      { key: 'Assigned_To', label: 'Assigned', type: 'user' },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    products: [
      { key: 'Product_Name', label: 'Product', type: 'primary', sortable: true },
      { key: 'Category', label: 'Category', type: 'badge' },
      { key: 'Website_ID', label: 'Website', type: 'website' },
      { key: 'Unit_Price', label: 'Price', type: 'currency', sortable: true },
      { key: 'Unit', label: 'Unit', type: 'text' },
      { key: 'Stock_Status', label: 'Stock', type: 'badge' }
    ],
    templates: [
      { key: 'Template_Name', label: 'Template', type: 'primary', sortable: true },
      { key: 'Channel', label: 'Channel', type: 'badge' },
      { key: 'Category', label: 'Category', type: 'text' },
      { key: 'Subject', label: 'Subject', type: 'text' },
      { key: 'Website_ID', label: 'Website', type: 'website' }
    ],
    notes: [
      { key: 'Note_Text', label: 'Note', type: 'primary', sortable: true },
      { key: 'Related_To_Type', label: 'Type', type: 'badge' },
      { key: 'Related_To_ID', label: 'Related', type: 'text' },
      { key: 'Created_By', label: 'By', type: 'user' },
      { key: 'Created_Date', label: 'Date', type: 'date', sortable: true }
    ],
    users: [
      { key: 'Full_Name', label: 'Name', type: 'primary', sortable: true },
      { key: 'Email', label: 'Email', type: 'text' },
      { key: 'Phone', label: 'Phone', type: 'text' },
      { key: 'Role', label: 'Role', type: 'badge' },
      { key: 'Department', label: 'Dept', type: 'text' },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    websites: [
      { key: 'Website_Name', label: 'Website', type: 'primary', sortable: true },
      { key: 'URL', label: 'URL', type: 'link' },
      { key: 'Hosting_Platform', label: 'Platform', type: 'text' },
      { key: 'Focus_Category', label: 'Focus', type: 'text' },
      { key: 'Is_Active', label: 'Active', type: 'badge' }
    ]
  };
  return map[module] || [];
}

function renderListRow(module, r, cols) {
  const key = MODULES[module].key;
  const id = r[key];
  const sel = APP.selected.has(id) ? 'selected' : '';

  const cells = cols.map(c => `<td class="${c.type === 'primary' ? 'strong' : ''}">${renderCellValue(c, r[c.key], r)}</td>`).join('');

  return `<tr class="${sel}" onclick="rowClick(event, '${module}', '${esc(id)}')">
    <td class="col-check" onclick="event.stopPropagation()">
      <input type="checkbox" ${APP.selected.has(id) ? 'checked' : ''} onchange="toggleSelect('${id}', this.checked, '${module}')">
    </td>
    ${cells}
    <td class="col-actions" onclick="event.stopPropagation()">
      <div class="row-actions">
        <button class="icon-btn btn-xs" title="View" onclick="openDetail('${module}','${esc(id)}')"><i class="fa-solid fa-eye"></i></button>
        <button class="icon-btn btn-xs" title="Edit" onclick="openEditForm('${module}','${esc(id)}')"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn btn-xs" title="Delete" onclick="deleteRow('${module}','${esc(id)}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </td>
  </tr>`;
}

function renderCellValue(c, val, row) {
  if (val == null || val === '' || val === '-') return '<span class="text-mute">—</span>';
  switch (c.type) {
    case 'primary': {
      return `<div class="cell-main">
        <div class="cell-avatar" style="${firstCharColor(val)}">${initials(val)}</div>
        <div class="cell-text"><div class="cell-primary">${esc(val)}</div></div>
      </div>`;
    }
    case 'currency': return `<span style="font-weight:600;color:var(--text)">${fmtCur(val)}</span>`;
    case 'percent':  return `<span style="font-weight:600">${esc(val)}%</span>`;
    case 'date':     return `<span class="text-sm">${fmtDate(val)}</span>`;
    case 'due-date': {
      const overdue = isOverdue(val) && row.Status !== 'Done' && row.Status !== 'Completed';
      const color = overdue ? 'var(--danger)' : isToday(val) ? 'var(--warning)' : 'var(--text-soft)';
      return `<span class="text-sm" style="color:${color};font-weight:${overdue || isToday(val) ? '600':'500'}">${fmtDate(val)}</span>`;
    }
    case 'user': {
      const u = getUserById(val);
      if (!u) return esc(val);
      return `<div style="display:flex;align-items:center;gap:6px">
        <div class="avatar xs" style="${firstCharColor(u.Full_Name)}">${initials(u.Full_Name)}</div>
        <span class="text-sm">${esc(u.Full_Name.split(' ')[0])}</span></div>`;
    }
    case 'stage': {
      const s = getStageById(val);
      if (!s) return esc(val);
      return `<span class="badge dot" style="background:${s.Color_Code}20;color:${s.Color_Code}">${esc(s.Stage_Name)}</span>`;
    }
    case 'status': {
      const map = { 'New':'brand','Contacted':'info','Qualified':'purple','Nurture':'warning','Quotation Sent':'warning','Negotiation':'warning','Converted':'success','Won':'success','Lost':'danger','Open':'brand','In Progress':'info','Done':'success','Completed':'success','Cancelled':'danger','Pending':'warning','Active':'success','Inactive':'danger','Yes':'success','No':'danger' };
      return `<span class="badge ${map[val] || ''}">${esc(val)}</span>`;
    }
    case 'priority': {
      const map = { 'High':'danger','Medium':'warning','Low':'info' };
      return `<span class="badge ${map[val] || ''}">${esc(val)}</span>`;
    }
    case 'source':  return `<span class="text-sm">${esc(getSourceName(val))}</span>`;
    case 'website': return `<span class="text-sm">${esc(getWebsiteName(val))}</span>`;
    case 'company': return `<span class="text-sm">${esc(getCompanyName(val))}</span>`;
    case 'activity-type': {
      const map = { Call:'brand', Email:'info', Meeting:'purple', WhatsApp:'success', SMS:'warning' };
      return `<span class="badge ${map[val] || ''}"><i class="fa-solid ${activityIcon(val)}"></i> ${esc(val)}</span>`;
    }
    case 'link': return `<a href="${esc(val)}" target="_blank" onclick="event.stopPropagation()">${esc(String(val).replace(/^https?:\/\//,'').slice(0,32))}</a>`;
    case 'badge': return `<span class="badge">${esc(val)}</span>`;
    default: return `<span class="text-sm">${esc(val)}</span>`;
  }
}

function rowClick(ev, module, id) {
  if (ev.target.closest('button, input, a, .row-actions')) return;
  openDetail(module, id);
}

function renderPagination(total) {
  const pages = Math.ceil(total / APP.pageSize);
  if (pages <= 1) return '';
  const p = APP.page;
  let buttons = `<button class="pg-btn" ${p === 1 ? 'disabled' : ''} onclick="gotoPage(${p - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;
  const start = Math.max(1, p - 2), end = Math.min(pages, p + 2);
  if (start > 1) { buttons += `<button class="pg-btn" onclick="gotoPage(1)">1</button>`; if (start > 2) buttons += `<span style="padding:0 6px;color:var(--text-mute)">…</span>`; }
  for (let i = start; i <= end; i++) buttons += `<button class="pg-btn ${i === p ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
  if (end < pages) { if (end < pages - 1) buttons += `<span style="padding:0 6px;color:var(--text-mute)">…</span>`; buttons += `<button class="pg-btn" onclick="gotoPage(${pages})">${pages}</button>`; }
  buttons += `<button class="pg-btn" ${p === pages ? 'disabled' : ''} onclick="gotoPage(${p + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
  return `<div class="pagination"><div>${total} total records</div><div class="pages">${buttons}</div></div>`;
}

function gotoPage(p) {
  APP.page = p;
  renderModuleBody(APP.view);
  setTimeout(() => { const el = $('.view-scroll'); if (el) el.scrollTop = 0; }, 10);
}

function toggleSelect(id, checked, module) {
  if (checked) APP.selected.add(id); else APP.selected.delete(id);
  renderModuleBody(module);
}

function toggleSelectAll(checked, module) {
  const rows = applyFilters(module);
  const key = MODULES[module].key;
  if (checked) rows.forEach(r => APP.selected.add(r[key]));
  else APP.selected.clear();
  renderModuleBody(module);
}

function bulkSelectAll() { toggleSelectAll(true, APP.view); }

function renderBulkBar(module) {
  if (APP.selected.size === 0) return '';
  return `<div class="bulk-bar">
    <strong>${APP.selected.size}</strong> selected
    <button class="btn btn-sm" onclick="exportCSV('${module}')"><i class="fa-solid fa-download"></i> Export</button>
    <button class="btn btn-sm" onclick="bulkAssign('${module}')"><i class="fa-solid fa-user-plus"></i> Assign</button>
    <button class="btn btn-sm danger" onclick="bulkDelete('${module}')"><i class="fa-solid fa-trash"></i> Delete</button>
    <button class="btn btn-sm" onclick="APP.selected.clear();renderModuleBody('${module}')"><i class="fa-solid fa-xmark"></i></button>
  </div>`;
}

function bulkAssign(module) {
  openModal({
    title: 'Assign to User',
    icon: 'fa-user-plus',
    size: 'sm',
    body: `<div class="form-field"><label class="form-label">User</label>
      <select class="form-select" id="bulkAssignUser">
        ${(APP.data.Users||[]).map(u => `<option value="${u.User_ID}">${esc(u.Full_Name)}</option>`).join('')}
      </select></div>`,
    footer: `<button class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
             <button class="btn btn-primary" onclick="confirmBulkAssign('${module}')">Assign</button>`
  });
}

async function confirmBulkAssign(module) {
  const userId = $('#bulkAssignUser').value;
  const field = module === 'deals' ? 'Owner' : 'Assigned_To';
  const sheet = MODULES[module].sheet;
  const key = MODULES[module].key;
  const rows = getRows(module);
  let count = 0;
  for (const r of rows) {
    if (!APP.selected.has(r[key])) continue;
    const updated = { ...r, [field]: userId };
    try {
      await API.update(sheet, key, r[key], updated);
      Object.assign(r, updated);
      count++;
    } catch (e) { console.warn('Assign failed', r[key], e); }
  }
  toast('Assigned', count + ' records assigned', 'success');
  APP.selected.clear();
  closeAllModals();
  renderModuleBody(module);
}

async function bulkDelete(module) {
  const ok = await confirmDialog({
    title: 'Delete records?',
    message: `Delete ${APP.selected.size} record(s)? This cannot be undone.`,
    confirmText: 'Delete', danger: true
  });
  if (!ok) return;
  const sheet = MODULES[module].sheet;
  const key = MODULES[module].key;
  let count = 0;
  for (const id of Array.from(APP.selected)) {
    try { await API.remove(sheet, key, id); count++; } catch (e) { console.warn(e); }
  }
  APP.data[sheet] = (APP.data[sheet] || []).filter(r => !APP.selected.has(r[key]));
  toast('Deleted', count + ' records removed', 'success');
  APP.selected.clear();
  renderModuleBody(module);
  buildNav();
}

/* ============================================================
   PART M — KANBAN VIEW
   ============================================================ */

function renderKanbanView(module) {
  let rows = applyFilters(module);
  let columns = [];

  if (module === 'leads') columns = CONFIG_OPTIONS.leadStatuses.map(s => ({ id: s, label: s, color: 'var(--brand)' }));
  else if (module === 'deals') columns = getStages().map(s => ({ id: s.Stage_ID, label: s.Stage_Name, color: s.Color_Code }));
  else if (module === 'tasks') columns = ['Open','In Progress','Done','Cancelled'].map(s => ({ id: s, label: s, color: 'var(--brand)' }));
  else columns = [{ id: 'default', label: 'All', color: 'var(--brand)' }];

  const fieldKey = module === 'deals' ? 'Stage_ID' : 'Status';

  return `<div class="kanban" style="padding:14px">
    ${columns.map(col => {
      const items = rows.filter(r => String(r[fieldKey]) === String(col.id));
      const total = items.reduce((s, r) => s + Number(r.Value || r.Estimated_Value || 0), 0);
      return `<div class="kanban-col" ondragover="kanbanDragOver(event)" ondragleave="kanbanDragLeave(event)" ondrop="kanbanDrop(event,'${module}','${col.id}','${fieldKey}')">
        <div class="kanban-col-head">
          <span class="col-dot" style="background:${col.color}"></span>
          <span class="col-name">${esc(col.label)}</span>
          <span class="col-count">${items.length}</span>
        </div>
        ${total > 0 ? `<div class="col-value">${fmtCur(total)}</div>` : ''}
        <div class="kanban-col-body">
          ${items.length ? items.map(r => renderKanbanCard(module, r)).join('') : `<div style="padding:20px 8px;text-align:center;color:var(--text-mute);font-size:12px">No items</div>`}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderKanbanCard(module, r) {
  const key = MODULES[module].key;
  const id = r[key];
  const title = module === 'deals' ? r.Deal_Name : module === 'leads' ? (r.Company_Name || r.Contact_Name || 'Lead ' + id) : module === 'tasks' ? r.Title : r[key];
  const sub = module === 'deals' ? getCompanyName(r.Company_ID) : module === 'leads' ? r.Requirement : '';
  const value = r.Value || r.Estimated_Value;

  return `<div class="kanban-card" draggable="true" ondragstart="kanbanDragStart(event,'${id}')" onclick="openDetail('${module}','${esc(id)}')">
    <div class="kc-head"><div class="kc-title">${esc(title)}</div></div>
    ${sub ? `<div class="kc-sub">${esc(sub)}</div>` : ''}
    ${r.Tags ? `<div class="kc-tags">${String(r.Tags).split(',').slice(0,3).map(t => `<span class="tag">${esc(t.trim())}</span>`).join('')}</div>` : ''}
    <div class="kc-meta">
      <div style="display:flex;align-items:center;gap:6px">
        ${r.Assigned_To || r.Owner ? `<div class="avatar xs" style="${firstCharColor(getUserName(r.Assigned_To || r.Owner))}">${initials(getUserName(r.Assigned_To || r.Owner))}</div>` : ''}
        ${r.Priority ? `<span class="badge ${r.Priority === 'High' ? 'danger' : r.Priority === 'Medium' ? 'warning' : 'info'}" style="font-size:10px">${esc(r.Priority)}</span>` : ''}
      </div>
      ${value ? `<div class="kc-value">${fmtCur(value)}</div>` : ''}
    </div>
  </div>`;
}

let KANBAN_DRAG_ID = null;
function kanbanDragStart(ev, id) { KANBAN_DRAG_ID = id; ev.currentTarget.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; }
function kanbanDragOver(ev) { ev.preventDefault(); ev.currentTarget.classList.add('dragover'); }
function kanbanDragLeave(ev) { ev.currentTarget.classList.remove('dragover'); }

async function kanbanDrop(ev, module, targetCol, fieldKey) {
  ev.preventDefault();
  $$('.kanban-col').forEach(c => c.classList.remove('dragover'));
  $$('.kanban-card').forEach(c => c.classList.remove('dragging'));
  if (!KANBAN_DRAG_ID) return;
  const rows = getRows(module);
  const row = rows.find(r => r[MODULES[module].key] === KANBAN_DRAG_ID);
  if (!row) { KANBAN_DRAG_ID = null; return; }

  const old = { [fieldKey]: row[fieldKey] };
  row[fieldKey] = targetCol;
  if (module === 'deals') {
    const stage = getStageById(targetCol);
    if (stage && stage.Stage_Name === 'Won') row.Status = 'Won';
    else if (stage && stage.Stage_Name === 'Lost') row.Status = 'Lost';
    else row.Status = 'Open';
  }
  renderModuleBody(module);
  try {
    await API.update(MODULES[module].sheet, MODULES[module].key, row[MODULES[module].key],
      { [fieldKey]: targetCol, ...(module === 'deals' ? { Status: row.Status } : {}) });
    toast('Updated', 'Moved to ' + targetCol, 'success');
  } catch (e) {
    Object.assign(row, old);
    renderModuleBody(module);
    toast('Update failed', describeApiError(e), 'error');
  }
  KANBAN_DRAG_ID = null;
}

/* ============================================================
   PART N — CARDS VIEW
   ============================================================ */

function renderCardsView(module) {
  const rows = applyFilters(module);
  if (!rows.length) return `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-grip"></i></div><h3>No records</h3></div>`;
  return `<div class="cards-grid">${rows.map(r => renderRecCard(module, r)).join('')}</div>`;
}

function renderRecCard(module, r) {
  const key = MODULES[module].key;
  const id = r[key];
  const title = module === 'deals' ? r.Deal_Name : module === 'leads' ? (r.Company_Name || 'Lead ' + id) : module === 'tasks' ? r.Title : (r.Full_Name || r.Company_Name || r.Product_Name || r.Website_Name || r.Template_Name || r.Note_Text || id);

  let body = '';
  if (module === 'leads') body = `
    ${rowCard('Source', getSourceName(r.Source_ID))}
    ${rowCard('Status', `<span class="badge brand">${esc(r.Status)}</span>`)}
    ${rowCard('Value', fmtCur(r.Estimated_Value))}
    ${rowCard('Assigned', getUserName(r.Assigned_To))}`;
  else if (module === 'deals') body = `
    ${rowCard('Company', getCompanyName(r.Company_ID))}
    ${rowCard('Stage', `<span class="badge dot" style="background:${getStageColor(r.Stage_ID)}20;color:${getStageColor(r.Stage_ID)}">${esc(getStageName(r.Stage_ID))}</span>`)}
    ${rowCard('Value', fmtCur(r.Value))}
    ${rowCard('Owner', getUserName(r.Owner))}`;
  else if (module === 'tasks') body = `
    ${rowCard('Due', fmtDate(r.Due_Date))}
    ${rowCard('Priority', `<span class="badge ${r.Priority === 'High' ? 'danger' : r.Priority === 'Medium' ? 'warning' : 'info'}">${esc(r.Priority)}</span>`)}
    ${rowCard('Assigned', getUserName(r.Assigned_To))}
    ${rowCard('Status', `<span class="badge ${r.Status === 'Done' ? 'success' : r.Status === 'In Progress' ? 'info' : 'warning'}">${esc(r.Status)}</span>`)}`;
  else if (module === 'companies') body = `
    ${rowCard('Industry', r.Industry)}
    ${rowCard('City', (r.City || '') + ', ' + (r.Country || ''))}
    ${rowCard('Phone', r.Phone)}
    ${rowCard('Type', `<span class="badge">${esc(r.Client_Type)}</span>`)}`;
  else body = Object.entries(r).filter(([k]) => !['Password_Hash'].includes(k)).slice(2, 6).map(([k, v]) => rowCard(k.replace(/_/g,' '), v)).join('');

  return `<div class="rec-card" onclick="openDetail('${module}','${esc(id)}')">
    <div class="rec-card-actions">
      <button class="icon-btn btn-xs" onclick="event.stopPropagation();openEditForm('${module}','${esc(id)}')"><i class="fa-solid fa-pen"></i></button>
      <button class="icon-btn btn-xs" onclick="event.stopPropagation();deleteRow('${module}','${esc(id)}')"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="rec-card-head">
      <div class="cell-avatar" style="${firstCharColor(title)}">${initials(title)}</div>
      <div style="flex:1;min-width:0">
        <div class="rec-card-title truncate">${esc(title)}</div>
        <div class="rec-card-sub truncate">${esc(r.Email || r.Phone || id)}</div>
      </div>
    </div>
    <div class="rec-card-body">${body}</div>
  </div>`;
}
function rowCard(l, v) {
  return `<div class="rec-card-row"><span class="lbl">${esc(l)}</span><span class="val">${typeof v === 'string' && v.startsWith('<') ? v : esc(v || '—')}</span></div>`;
}

/* ============================================================
   PART O — CALENDAR VIEW
   ============================================================ */

function renderCalendarView(module) {
  const d = APP.calendarMonth;
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const rows = applyFilters(module);

  const eventsByDay = {};
  rows.forEach(r => {
    const dateStr = module === 'activities' ? r.Activity_Date : r.Due_Date;
    if (!dateStr) return;
    const dt = new Date(dateStr);
    if (dt.getMonth() === month && dt.getFullYear() === year) {
      const day = dt.getDate();
      (eventsByDay[day] = eventsByDay[day] || []).push(r);
    }
  });

  const monthName = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  let cells = '';
  for (let i = startDay - 1; i >= 0; i--) cells += `<div class="cal-day other-month"><div class="cal-day-num">${prevMonthDays - i}</div></div>`;

  for (let d2 = 1; d2 <= daysInMonth; d2++) {
    const isToday_ = d2 === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    const events = eventsByDay[d2] || [];
    cells += `<div class="cal-day ${isToday_ ? 'today' : ''}">
      <div class="cal-day-num"><span>${d2}</span>${events.length > 3 ? `<span class="text-xs text-mute">${events.length}</span>` : ''}</div>
      ${events.slice(0, 3).map(e => {
        const title = module === 'activities' ? e.Subject : e.Title;
        const type = module === 'activities' ? activityColor(e.Activity_Type) : (e.Priority === 'High' ? 'danger' : 'brand');
        return `<div class="cal-event ${type}" onclick="event.stopPropagation();openDetail('${module}','${esc(e[MODULES[module].key])}')">${esc(title)}</div>`;
      }).join('')}
      ${events.length > 3 ? `<div class="text-xs text-mute" style="margin-top:2px">+${events.length - 3} more</div>` : ''}
    </div>`;
  }
  const remaining = (7 - ((startDay + daysInMonth) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) cells += `<div class="cal-day other-month"><div class="cal-day-num">${i}</div></div>`;

  return `<div class="view-scroll">
    <div class="calendar">
      <div class="cal-header">
        <div class="flex items-center gap-3">
          <div class="cal-month">${esc(monthName)}</div>
          <span class="badge">${rows.length} items</span>
        </div>
        <div class="cal-nav">
          <button class="btn btn-secondary btn-sm" onclick="calPrev()"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="calToday()">Today</button>
          <button class="btn btn-secondary btn-sm" onclick="calNext()"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
      <div class="cal-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => `<div class="cal-weekday">${w}</div>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>
  </div>`;
}

function activityColor(type) { return { Call:'brand', Email:'info', Meeting:'purple', WhatsApp:'success', SMS:'warning' }[type] || 'brand'; }
function calPrev() { APP.calendarMonth = new Date(APP.calendarMonth.getFullYear(), APP.calendarMonth.getMonth() - 1, 1); renderModuleBody(APP.view); }
function calNext() { APP.calendarMonth = new Date(APP.calendarMonth.getFullYear(), APP.calendarMonth.getMonth() + 1, 1); renderModuleBody(APP.view); }
function calToday() { APP.calendarMonth = new Date(); renderModuleBody(APP.view); }

/* ============================================================
   PART P — TIMELINE VIEW
   ============================================================ */

function renderTimelineView(module) {
  const rows = applyFilters(module);
  const dateField = module === 'activities' ? 'Activity_Date' : 'Created_Date';
  rows.sort((a, b) => String(b[dateField] || '').localeCompare(String(a[dateField] || '')));

  if (!rows.length) return `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-wave-square"></i></div><h3>No records</h3></div>`;

  return `<div class="view-scroll"><div class="timeline">
    ${rows.map(r => {
      const id = r[MODULES[module].key];
      const title = module === 'activities' ? r.Subject : (r.Title || r.Deal_Name || r.Company_Name || r.Full_Name || id);
      const desc = module === 'activities' ? r.Notes : (r.Description || r.Requirement || '');
      const type = module === 'activities' ? activityColor(r.Activity_Type) : 'brand';
      const date = r[dateField] || r.Due_Date;
      return `<div class="tl-item ${type}" onclick="openDetail('${module}','${esc(id)}')" style="cursor:pointer">
        <div class="tl-time">${fmtDate(date)} ${r.Activity_Time ? '• ' + r.Activity_Time : ''}</div>
        <div class="tl-title">${esc(title)}</div>
        ${desc ? `<div class="tl-desc">${esc(desc)}</div>` : ''}
      </div>`;
    }).join('')}
  </div></div>`;
}

/* ============================================================
   PART Q — DETAIL VIEW (360°)
   ============================================================ */

function openDetail(module, id) {
  const rows = getRows(module);
  const r = rows.find(x => x[MODULES[module].key] === id);
  if (!r) { toast('Not found', 'Record not found', 'error'); return; }
  const title = module === 'deals' ? r.Deal_Name : module === 'leads' ? (r.Company_Name || 'Lead ' + id) : module === 'tasks' ? r.Title : (r.Full_Name || r.Company_Name || r.Product_Name || r.Website_Name || r.Template_Name || id);

  let relatedDeals = [], relatedActivities = [], relatedNotes = [];
  if (module === 'leads') {
    relatedDeals = (APP.data.Deals || []).filter(d => d.Lead_ID === id);
    relatedActivities = (APP.data.Activities || []).filter(a => a.Related_To_Type === 'Lead' && a.Related_To_ID === id);
    relatedNotes = (APP.data.Notes || []).filter(n => n.Related_To_Type === 'Lead' && n.Related_To_ID === id);
  } else if (module === 'deals') {
    relatedActivities = (APP.data.Activities || []).filter(a => a.Related_To_Type === 'Deal' && a.Related_To_ID === id);
    relatedNotes = (APP.data.Notes || []).filter(n => n.Related_To_Type === 'Deal' && n.Related_To_ID === id);
  } else if (module === 'companies') {
    relatedDeals = (APP.data.Deals || []).filter(d => d.Company_ID === id);
  }

  const sections = FIELD_DEFS[module]?.sections || [];
  const metaItems = [];
  sections.forEach(s => s.fields.forEach(f => {
    if (['Message','Notes','Requirement','Description','Note_Text','Body'].includes(f.key)) return;
    metaItems.push({ label: f.label, value: r[f.key], key: f.key });
  }));

  const body = `<div class="detail-layout">
    <div>
      <div class="detail-hero">
        <div class="detail-hero-top">
          <div class="avatar xl" style="${firstCharColor(title)}">${initials(title)}</div>
          <div style="flex:1;min-width:0">
            <div class="detail-hero-title">${esc(title)}</div>
            <div class="detail-hero-sub">
              ${r.Email ? `<i class="fa-solid fa-envelope"></i> ${esc(r.Email)} • ` : ''}
              ${r.Phone ? `<i class="fa-solid fa-phone"></i> ${esc(r.Phone)} • ` : ''}
              <span class="badge">${esc(id)}</span>
            </div>
          </div>
          <div class="detail-hero-actions">
            <button class="btn btn-secondary btn-sm" onclick="closeDrawer(document.querySelector('.drawer')?.id);setTimeout(()=>openEditForm('${module}','${esc(id)}'),100)"><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteRow('${module}','${esc(id)}');closeDrawer(document.querySelector('.drawer')?.id)"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div class="detail-meta">
          ${metaItems.slice(0, 12).map(mi => `<div class="detail-meta-item">
            <div class="detail-meta-label">${esc(mi.label)}</div>
            <div class="detail-meta-value">${renderMetaValue(mi.key, mi.value, module)}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
            ${sections.map(s => `<div>
              <div class="form-section-head" style="margin:-16px -16px 12px;border-radius:0">
                <i class="fa-solid ${s.icon}"></i>${esc(s.title)}
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                ${s.fields.map(f => `<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding-bottom:8px;border-bottom:1px solid var(--border)">
                  <div class="text-xs text-mute uppercase" style="font-weight:700;letter-spacing:.04em;flex-shrink:0;min-width:120px">${esc(f.label)}</div>
                  <div class="text-sm" style="font-weight:600;text-align:right;word-break:break-word">${renderMetaValue(f.key, r[f.key], module)}</div>
                </div>`).join('')}
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="card mb-4">
        <div class="card-header"><div class="card-title"><i class="fa-solid fa-wave-square"></i> Activity (${relatedActivities.length})</div></div>
        <div class="card-body flush" style="max-height:340px;overflow-y:auto">
          ${relatedActivities.length ? relatedActivities.map(a => `
            <div style="padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer" onclick="closeDrawer(document.querySelector('.drawer')?.id);setTimeout(()=>openDetail('activities','${a.Activity_ID}'),100)">
              <div style="display:flex;gap:8px;align-items:flex-start">
                <div class="cell-avatar" style="width:26px;height:26px;font-size:10px;${firstCharColor(a.Subject)}"><i class="fa-solid ${activityIcon(a.Activity_Type)}"></i></div>
                <div style="flex:1;min-width:0">
                  <div class="text-sm truncate" style="font-weight:600">${esc(a.Subject)}</div>
                  <div class="text-xs text-mute">${fmtDate(a.Activity_Date)}</div>
                </div>
              </div>
            </div>`).join('') : `<div class="empty-state" style="padding:24px"><p class="text-sm">No activities yet</p></div>`}
        </div>
      </div>
      <div class="card mb-4">
        <div class="card-header"><div class="card-title"><i class="fa-solid fa-note-sticky"></i> Notes (${relatedNotes.length})</div></div>
        <div class="card-body flush">
          ${relatedNotes.length ? relatedNotes.map(n => `
            <div style="padding:10px 14px;border-bottom:1px solid var(--border)">
              <div class="text-sm">${esc(n.Note_Text)}</div>
              <div class="text-xs text-mute" style="margin-top:4px">${esc(getUserName(n.Created_By))} • ${fmtDate(n.Created_Date)}</div>
            </div>`).join('') : `<div class="empty-state" style="padding:24px"><p class="text-sm">No notes yet</p></div>`}
        </div>
      </div>
    </div>
  </div>`;

  openDrawer({ title: 'Record Details', icon: MODULES[module].icon, body, wide: true });
}

function renderMetaValue(key, val, module) {
  if (val == null || val === '' || val === '-') return '<span class="text-mute">—</span>';
  if (key === 'Email') return `<a href="mailto:${esc(val)}">${esc(val)}</a>`;
  if (['Phone','Alt_Phone'].includes(key)) return `<a href="tel:${esc(val)}">${esc(val)}</a>`;
  if (['URL','Company_Website','Image_URL','Reference_Image_Link'].includes(key) && val) return `<a href="${esc(val)}" target="_blank">${esc(String(val).slice(0, 40))}</a>`;
  if (['Assigned_To','Owner','Created_By','Account_Owner'].includes(key)) {
    const u = getUserById(val);
    if (u) return `<div class="flex items-center gap-2" style="justify-content:flex-end"><div class="avatar xs" style="${firstCharColor(u.Full_Name)}">${initials(u.Full_Name)}</div>${esc(u.Full_Name)}</div>`;
    return esc(val);
  }
  if (key === 'Company_ID') return esc(getCompanyName(val));
  if (key === 'Stage_ID') {
    const s = getStageById(val);
    return s ? `<span class="badge dot" style="background:${s.Color_Code}20;color:${s.Color_Code}">${esc(s.Stage_Name)}</span>` : esc(val);
  }
  if (key === 'Website_ID') return esc(getWebsiteName(val));
  if (key === 'Source_ID') return esc(getSourceName(val));
  if (['Value','Estimated_Value','Unit_Price'].includes(key)) return fmtCur(val);
  if (['Expected_Close_Date','Actual_Close_Date','Due_Date','Activity_Date','Next_Followup_Date','Date_Received','Created_Date','Updated_Date','Date_Joined','Last_Login'].includes(key)) return fmtDate(val);
  if (['Status','Priority','Client_Type','Is_Active','Is_Primary','Outcome','Activity_Type','Channel','Category','Stock_Status','Catalogue_Sent'].includes(key)) {
    const map = { 'Won':'success','Lost':'danger','Open':'brand','Active':'success','Inactive':'danger','High':'danger','Medium':'warning','Low':'info','Yes':'success','No':'danger','Done':'success','Completed':'success','Pending':'warning','Cancelled':'danger' };
    return `<span class="badge ${map[val] || ''}">${esc(val)}</span>`;
  }
  if (key === 'Tags') return String(val).split(',').map(t => `<span class="tag">${esc(t.trim())}</span>`).join('');
  return esc(val);
}

/* ============================================================
   PART R — FORMS (with API)
   ============================================================ */

function openCreateForm(module) {
  const def = FIELD_DEFS[module];
  if (!def) { toast('Not available', 'No form for ' + module, 'warning'); return; }
  APP.editing = null;
  renderFormModal(module, null);
}

function openEditForm(module, id) {
  const rows = getRows(module);
  const r = rows.find(x => x[MODULES[module].key] === id);
  if (!r) { toast('Not found', 'Record not found', 'error'); return; }
  APP.editing = r;
  renderFormModal(module, r);
}

function renderFormModal(module, row) {
  const def = FIELD_DEFS[module];
  const m = MODULES[module];
  const isEdit = !!row;

  const body = def.sections.map(sec => `<div class="form-section">
    <div class="form-section-head"><i class="fa-solid ${sec.icon || 'fa-circle-info'}"></i>${esc(sec.title)}</div>
    <div class="form-section-body">
      ${sec.fields.map(f => renderFormField(f, row ? row[f.key] : '')).join('')}
    </div>
  </div>`).join('');

  openModal({
    title: (isEdit ? 'Edit ' : 'New ') + m.label.replace(/s$/,''),
    icon: m.icon,
    size: 'lg',
    body,
    footer: `<button class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
             ${isEdit ? '' : `<button class="btn btn-secondary" onclick="submitForm('${module}', true)"><i class="fa-solid fa-check"></i> Save & New</button>`}
             <button class="btn btn-primary" onclick="submitForm('${module}', false)">
               <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Update' : 'Create'}
             </button>`
  });
}

function renderFormField(f, val) {
  val = val == null ? '' : val;
  const opts = resolveOptions(f.options);
  const spanCls = f.span === 2 ? 'span-2' : f.span === 'full' ? 'span-full' : '';
  const fId = 'ff_' + f.key;
  let input = '';
  if (f.type === 'textarea') input = `<textarea class="form-textarea" id="${fId}" rows="${f.rows || 4}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>${esc(val)}</textarea>`;
  else if (f.type === 'select') input = `<select class="form-select" id="${fId}">
      <option value="">— Select —</option>
      ${opts.map(o => `<option value="${esc(o.value)}" ${String(val) === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
    </select>`;
  else input = `<input class="form-input" id="${fId}" type="${f.type || 'text'}" value="${esc(val)}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>`;

  return `<div class="form-field ${spanCls}">
    <label class="form-label" for="${fId}">${esc(f.label)}${f.required ? '<span class="req">*</span>' : ''}</label>
    ${input}
  </div>`;
}

function resolveOptions(opts) {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  if (opts === 'users') return (APP.data.Users || []).map(u => ({ value: u.User_ID, label: u.Full_Name }));
  if (opts === 'sources') return (APP.data.Lead_Sources || []).map(s => ({ value: s.Source_ID, label: s.Source_Name }));
  if (opts === 'websites') return (APP.data.Websites || []).map(w => ({ value: w.Website_ID, label: w.Website_Name }));
  if (opts === 'stages') return getStages().map(s => ({ value: s.Stage_ID, label: s.Stage_Name }));
  if (opts === 'companies') return (APP.data.Companies || []).map(c => ({ value: c.Company_ID, label: c.Company_Name }));
  if (opts === 'contacts') return (APP.data.Contacts || []).map(c => ({ value: c.Contact_ID, label: c.Full_Name }));
  if (opts === 'leads') return (APP.data.Leads || []).map(l => ({ value: l.Lead_ID, label: (l.Company_Name || l.Lead_ID) + ' (' + l.Lead_ID + ')' }));
  if (opts === 'leadStatuses') return CONFIG_OPTIONS.leadStatuses.map(o => ({ value: o, label: o }));
  if (opts === 'industries') return CONFIG_OPTIONS.industries.map(o => ({ value: o, label: o }));
  if (opts === 'clientTypes') return CONFIG_OPTIONS.clientTypes.map(o => ({ value: o, label: o }));
  if (opts === 'productCategories') return ['Boiler Suit','Coverall','Fire Retardant Suit','Anti Static Coverall','High Visibility Coverall','Twill Fabric','Canvas Fabric','Mesh Fabric','Kitchen Apron','Staff Uniform','Camouflage Fabric'].map(o => ({ value: o, label: o }));
  return [];
}

async function submitForm(module, saveAndNew) {
  const def = FIELD_DEFS[module];
  const m = MODULES[module];
  const data = {};
  let firstInvalid = null;

  def.sections.forEach(sec => sec.fields.forEach(f => {
    const el = document.getElementById('ff_' + f.key);
    if (!el) return;
    let v = el.value;
    if (f.required && !v) {
      if (!firstInvalid) firstInvalid = { el, f };
    }
    data[f.key] = v;
  }));

  if (firstInvalid) {
    firstInvalid.el.focus();
    firstInvalid.el.style.borderColor = 'var(--danger)';
    toast('Missing field', 'Please fill: ' + firstInvalid.f.label, 'error');
    return;
  }

  const isEdit = !!APP.editing;
  const key = m.key;
  try {
    if (isEdit) {
      const r = await API.update(m.sheet, key, APP.editing[key], data);
      if (!r || !r.success) throw new Error((r && r.error) || 'Update failed');
      const idx = (APP.data[m.sheet] || []).findIndex(x => x[key] === APP.editing[key]);
      if (idx >= 0) APP.data[m.sheet][idx] = { ...APP.data[m.sheet][idx], ...data };
      toast('Updated', m.label + ' saved', 'success');
    } else {
      const r = await API.create(m.sheet, key, data);
      if (!r || !r.success) throw new Error((r && r.error) || 'Create failed');
      /* Reload that sheet to get fresh row from server */
      const sheetR = await API.getSheet(m.sheet);
      if (sheetR && sheetR.success) {
        APP.data[m.sheet] = (sheetR.data || []).map(r => DataXform.row(r));
      }
      toast('Created', 'New ' + m.label.toLowerCase().replace(/s$/,'') + ' added', 'success');
    }

    APP.editing = null;
    if (saveAndNew) {
      closeAllModals();
      setTimeout(() => openCreateForm(module), 150);
    } else {
      closeAllModals();
    }
    renderModuleBody(module);
    buildNav();
  } catch (err) {
    toast('Save failed', describeApiError(err), 'error');
  }
}

/* ============================================================
   PART S — DELETE
   ============================================================ */

async function deleteRow(module, id) {
  const rows = getRows(module);
  const r = rows.find(x => x[MODULES[module].key] === id);
  if (!r) return;
  const title = r.Deal_Name || r.Company_Name || r.Full_Name || r.Title || r.Subject || id;

  const ok = await confirmDialog({
    title: 'Delete record?',
    message: `Delete "${title}"? This cannot be undone.`,
    confirmText: 'Delete', danger: true
  });
  if (!ok) return;

  const m = MODULES[module];
  try {
    const res = await API.remove(m.sheet, m.key, id);
    if (!res || !res.success) throw new Error((res && res.error) || 'Delete failed');
    APP.data[m.sheet] = rows.filter(x => x[m.key] !== id);
    toast('Deleted', title + ' removed', 'success');
    renderModuleBody(module);
    buildNav();
  } catch (err) {
    toast('Delete failed', describeApiError(err), 'error');
  }
}

/* ============================================================
   PART T — REPORTS
   ============================================================ */

function renderReports() {
  const deals = APP.data.Deals || [];
  const wonValue = deals.filter(d => d.Status === 'Won').reduce((s, d) => s + Number(d.Value || 0), 0);
  const pipeline = deals.filter(d => d.Status === 'Open').reduce((s, d) => s + Number(d.Value || 0), 0);
  const avg = Math.round(deals.reduce((s, d) => s + Number(d.Value || 0), 0) / Math.max(1, deals.length));
  const wonCount = deals.filter(d => d.Status === 'Won').length;
  const lostCount = deals.filter(d => d.Status === 'Lost').length;
  const conversion = Math.round((wonCount / Math.max(1, wonCount + lostCount)) * 100);

  return `<div class="view-scroll">
    <div class="kpi-grid mb-4">
      ${kpi('Won Revenue', fmtCur(wonValue), 'fa-indian-rupee-sign', 'success', 'All time', 'up')}
      ${kpi('Active Pipeline', fmtCur(pipeline), 'fa-filter', 'brand', 'Open deals', 'info')}
      ${kpi('Avg Deal Size', fmtCur(avg), 'fa-chart-line', 'purple', 'Across all deals', 'up')}
      ${kpi('Win Rate', conversion + '%', 'fa-percent', 'warning', 'Won / Closed', 'up')}
    </div>

    <div class="grid-2 mb-4">
      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-bar"></i>Monthly Lead Volume</div></div>
        <div class="card-body"><div class="chart-container tall"><canvas id="repLeads"></canvas></div></div></div>
      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-line"></i>Revenue Trend</div></div>
        <div class="card-body"><div class="chart-container tall"><canvas id="repRevenue"></canvas></div></div></div>
    </div>

    <div class="grid-2 mb-4">
      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-chart-pie"></i>Lead Status</div></div>
        <div class="card-body"><div class="chart-container"><canvas id="repStatus"></canvas></div></div></div>
      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-users"></i>Sales Rep Performance</div></div>
        <div class="card-body flush"><table class="data-table" style="min-width:auto">
          <thead><tr><th>Rep</th><th>Total</th><th>Won</th><th>Value</th></tr></thead>
          <tbody>${(APP.data.Users||[]).filter(u=>u.Role && u.Role.includes('Sales')).slice(0,8).map(u => {
            const wonDeals = deals.filter(d => d.Owner === u.User_ID && d.Status === 'Won');
            const totalDeals = deals.filter(d => d.Owner === u.User_ID);
            const value = wonDeals.reduce((s,d)=>s+Number(d.Value||0),0);
            return `<tr><td class="strong"><div style="display:flex;align-items:center;gap:8px">
              <div class="avatar xs" style="${firstCharColor(u.Full_Name)}">${initials(u.Full_Name)}</div>${esc(u.Full_Name)}</div></td>
              <td>${totalDeals.length}</td><td><span class="badge success">${wonDeals.length}</span></td>
              <td class="strong">${fmtCur(value)}</td></tr>`;
          }).join('')}</tbody>
        </table></div></div>
    </div>
  </div>`;
}

function mountReports() {
  if (typeof Chart === 'undefined') return;
  const deals = APP.data.Deals || [];
  const leads = APP.data.Leads || [];

  const months = [], counts = [], revenue = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(m.toLocaleDateString('en-IN', { month: 'short' }));
    counts.push(leads.filter(l => { const d = new Date(l.Date_Received || l.Created_Date); return d.getMonth()===m.getMonth() && d.getFullYear()===m.getFullYear(); }).length);
    revenue.push(deals.filter(d => d.Status==='Won').filter(d => { const dt = new Date(d.Actual_Close_Date || d.Created_Date); return dt.getMonth()===m.getMonth() && dt.getFullYear()===m.getFullYear(); }).reduce((s,d)=>s+Number(d.Value||0),0));
  }

  const c1 = document.getElementById('repLeads');
  if (c1) new Chart(c1, { type: 'bar',
    data: { labels: months, datasets: [{ data: counts, backgroundColor: getCSS('--brand')+'90', borderRadius: 6, barThickness: 20 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales: { y:{beginAtZero:true, grid:{color:getCSS('--border')}, ticks:{color:getCSS('--text-mute')}}, x:{grid:{display:false}, ticks:{color:getCSS('--text-mute')}} } } });

  const c2 = document.getElementById('repRevenue');
  if (c2) new Chart(c2, { type: 'line',
    data: { labels: months, datasets: [{ data: revenue, borderColor: getCSS('--success'), backgroundColor: getCSS('--success')+'30', fill:true, tension:0.4, borderWidth:2, pointRadius:4 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:c=>fmtCur(c.raw)}}},
      scales:{ y:{beginAtZero:true, grid:{color:getCSS('--border')}, ticks:{color:getCSS('--text-mute'), callback:v=>fmtCur(v)}}, x:{grid:{display:false}, ticks:{color:getCSS('--text-mute')}} } } });

  const statuses = ['New','Contacted','Qualified','Nurture','Quotation Sent','Negotiation','Won','Lost'];
  const statusCounts = statuses.map(s => leads.filter(l => l.Status === s).length);
  const c3 = document.getElementById('repStatus');
  if (c3) new Chart(c3, { type: 'doughnut',
    data: { labels: statuses, datasets: [{ data: statusCounts, backgroundColor: ['#94A3B8','#60A5FA','#38BDF8','#A78BFA','#FBBF24','#FB923C','#22C55E','#EF4444'], borderWidth: 0 }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'55%', plugins:{legend:{position:'right', labels:{color:getCSS('--text-soft'), boxWidth:10, padding:8}}} } });
}

/* ============================================================
   PART U — SETTINGS
   ============================================================ */

function renderSettings() {
  return `<div class="view-scroll">
    <div class="grid-2">
      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-building"></i> Organization</div></div>
        <div class="card-body">
          <div class="form-field mb-3"><label class="form-label">Company</label><input class="form-input" value="Chaitanya Impex"></div>
          <div class="form-field mb-3"><label class="form-label">Currency</label><select class="form-select"><option>INR (₹)</option></select></div>
        </div></div>

      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-shield-halved"></i> Security</div></div>
        <div class="card-body">
          <button class="btn btn-secondary w-100 mb-3" onclick="changePasswordForm()"><i class="fa-solid fa-lock"></i> Change Password</button>
          <button class="btn btn-secondary w-100 mb-3" onclick="syncNow()"><i class="fa-solid fa-rotate"></i> Sync with Sheet</button>
          <button class="btn btn-danger w-100" onclick="handleLogout()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign out</button>
        </div></div>

      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-circle-info"></i> Backend Status</div></div>
        <div class="card-body"><div id="backendStatus"><i class="fa-solid fa-spinner spin"></i> Checking...</div></div></div>

      <div class="card"><div class="card-header"><div class="card-title"><i class="fa-solid fa-palette"></i> Appearance</div></div>
        <div class="card-body">
          <button class="btn btn-secondary w-100 mb-3" onclick="toggleTheme()"><i class="fa-solid fa-circle-half-stroke"></i> Toggle theme</button>
        </div></div>
    </div>
  </div>`;
}

async function syncNow() {
  toast('Syncing...', 'Fetching latest from sheet', 'info');
  await loadAllData(true);
  toast('Synced', 'Data refreshed', 'success');
}

function changePasswordForm() {
  openModal({
    title: 'Change Password',
    icon: 'fa-lock',
    size: 'sm',
    body: `<div class="form-field mb-3"><label class="form-label">Current Password</label><input class="form-input" type="password" id="cp_old"></div>
           <div class="form-field mb-3"><label class="form-label">New Password</label><input class="form-input" type="password" id="cp_new"></div>
           <div class="form-field"><label class="form-label">Confirm New Password</label><input class="form-input" type="password" id="cp_confirm"></div>`,
    footer: `<button class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
             <button class="btn btn-primary" onclick="submitChangePassword()">Update</button>`
  });
}

async function submitChangePassword() {
  const o = $('#cp_old').value, n = $('#cp_new').value, c = $('#cp_confirm').value;
  if (!o || !n || !c) { toast('Missing', 'All fields required', 'error'); return; }
  if (n.length < 6) { toast('Weak password', 'Minimum 6 characters', 'error'); return; }
  if (n !== c) { toast('Mismatch', 'New passwords do not match', 'error'); return; }
  try {
    const r = await API.changePassword(o, n);
    if (!r || !r.success) throw new Error((r && r.error) || 'Failed');
    toast('Success', 'Password updated', 'success');
    closeAllModals();
  } catch (err) { toast('Failed', describeApiError(err), 'error'); }
}

/* ============================================================
   PART V — GLOBAL SEARCH / MENUS
   ============================================================ */

function performGlobalSearch(q) {
  q = (q || '').toLowerCase().trim();
  if (!q || q.length < 2) { closeAllDropdowns(); return; }
  const results = [];
  Object.entries(MODULES).forEach(([key, m]) => {
    if (!m.sheet) return;
    (APP.data[m.sheet] || []).forEach(r => {
      const text = Object.values(r).join(' ').toLowerCase();
      if (text.includes(q)) {
        const title = r.Deal_Name || r.Company_Name || r.Full_Name || r.Title || r.Subject || r.Product_Name || r.Template_Name || r[m.key];
        results.push({ module: key, id: r[m.key], title, subtitle: m.label });
      }
    });
  });
  const limited = results.slice(0, 8);
  const html = limited.length ? `<div class="dropdown-menu wide" style="position:fixed;top:52px;left:50%;transform:translateX(-50%);width:min(480px,90vw)">
      <div class="dd-label">Results (${results.length})</div>
      ${limited.map(r => `<div class="dd-item" onclick="closeAllDropdowns();openDetail('${r.module}','${esc(r.id)}')">
        <i class="fa-solid ${MODULES[r.module].icon}" style="color:var(--brand)"></i>
        <div style="flex:1;min-width:0">
          <div class="truncate" style="font-weight:600">${esc(r.title)}</div>
          <div class="text-xs text-mute">${esc(r.subtitle)} • ${esc(r.id)}</div>
        </div></div>`).join('')}</div>`
    : `<div class="dropdown-menu" style="position:fixed;top:52px;left:50%;transform:translateX(-50%);width:min(400px,90vw)">
        <div class="empty-state" style="padding:20px"><div class="text-sm text-mute">No results</div></div></div>`;
  $('#dropdownLayer').innerHTML = html;
}

function showSearchResults() { const v = $('#globalSearch').value; if (v.length >= 2) performGlobalSearch(v); }

function toggleUserMenu(ev) {
  openDropdown(ev.currentTarget, `<div class="dropdown-menu left" style="bottom:100%;top:auto;margin-bottom:6px">
    <div class="dd-item" onclick="changePasswordForm()"><i class="fa-solid fa-lock"></i>Change Password</div>
    <div class="dd-item" onclick="go('settings')"><i class="fa-solid fa-gear"></i>Settings</div>
    <div class="dd-item" onclick="syncNow()"><i class="fa-solid fa-rotate"></i>Sync</div>
    <div class="dd-divider"></div>
    <div class="dd-item danger" onclick="handleLogout()"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign out</div>
  </div>`, { align: 'left' });
}

function userMenu(ev) { toggleUserMenu(ev); }

function quickAddMenu(ev) {
  ev.stopPropagation();
  openDropdown(ev.currentTarget, `<div class="dropdown-menu">
    <div class="dd-label">Quick Add</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('leads')"><i class="fa-solid fa-user-plus" style="color:var(--info)"></i>New Lead</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('deals')"><i class="fa-solid fa-handshake" style="color:var(--brand)"></i>New Deal</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('companies')"><i class="fa-solid fa-building" style="color:var(--purple)"></i>New Company</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('contacts')"><i class="fa-solid fa-user-group" style="color:var(--pink)"></i>New Contact</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('tasks')"><i class="fa-solid fa-square-check" style="color:var(--warning)"></i>New Task</div>
    <div class="dd-item" onclick="closeAllDropdowns();openCreateForm('activities')"><i class="fa-solid fa-calendar-check" style="color:var(--success)"></i>New Activity</div>
  </div>`);
}

function toggleNotifications(ev) {
  ev.stopPropagation();
  openDropdown(ev.currentTarget, `<div class="dropdown-menu wide">
    <div class="dd-label">Notifications</div>
    <div class="dd-item"><i class="fa-solid fa-circle-info" style="color:var(--info)"></i>
      <div style="flex:1"><div style="font-weight:600">Welcome to your CRM</div><div class="text-xs text-mute">Just now</div></div></div>
    <div class="dd-item" onclick="toast('Marked read','','success')"><i class="fa-solid fa-check"></i>Mark all read</div>
  </div>`);
}

function exportCSV(module) {
  const rows = applyFilters(module);
  if (!rows.length) { toast('Nothing to export', '', 'warning'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = module + '-' + today() + '.csv';
  a.click();
  toast('Exported', rows.length + ' rows', 'success');
}

/* ============================================================
   PART W — KEYBOARD
   ============================================================ */

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); const el = $('#globalSearch'); if (el) el.focus(); return; }
  if (e.key === 'Escape') { closeAllDropdowns(); $('#modalLayer').innerHTML = ''; $$('.drawer').forEach(d => closeDrawer(d.id)); return; }
  const tag = (e.target.tagName || '').toLowerCase();
  if (['input','textarea','select'].includes(tag)) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'l' || e.key === 'L') { go('leads'); e.preventDefault(); }
  if (e.key === 'd' || e.key === 'D') { go('deals'); e.preventDefault(); }
  if (e.key === 't' || e.key === 'T') { go('tasks'); e.preventDefault(); }
  if (e.key === 'c' || e.key === 'C') { go('companies'); e.preventDefault(); }
  if (e.key === 'h' || e.key === 'H') { go('dashboard'); e.preventDefault(); }
});

/* ============================================================
   PART X — BOOT
   ============================================================ */

async function boot() {
  initTheme();
  if (typeof USER !== 'undefined') APP.user = USER;

  /* Login form listener */
  const form = $('#loginForm');
  if (form) form.addEventListener('submit', handleLoginSubmit);

  /* Boot flow */
  if (isLoggedIn() && APP.user) {
    try {
      const probe = await probeBackend();
      if (probe.online) {
        showApp();
        await loadAllData(true);
        return;
      }
    } catch (e) {}
    /* Session invalid — show login */
    clearSession();
    APP.user = null;
  }

  /* No session — check backend & show login */
  try {
    const probe = await probeBackend();
    if (!probe.online) {
      console.warn('Backend offline:', probe.error);
      /* Still show login so user can try */
    }
  } catch (e) {}

  showLogin();
}

window.addEventListener('DOMContentLoaded', boot);
