// Remaining PLACEHOLDER fields below still need real values before this page
// goes live in front of a real customer. Nothing here is wired to a CMS;
// it's a single source of truth so swapping copy later means editing this
// one file.

export const logisticsConfig = {
  companyName: 'Uniflex Global Logistics', // trade name (DBA)
  legalName: 'Uniflex Global Corporation', // legal entity — shown in footer copyright line
  shortName: 'Uniflex Logistics',
  tagline: 'Truck dispatch that keeps your wheels turning',
  phone: '+19298651914',
  phoneDisplay: '(929) 865-1914',
  email: 'sales@uniflexstore.com',
  address: {
    line1: '3081 21st Street, Suite 1',
    city: 'Long Island City',
    state: 'NY',
    postalCode: '11102',
  },
  hours: '24/7 live dispatch', // PLACEHOLDER — confirm actual dispatch hours
  foundedYear: 2019, // PLACEHOLDER — confirm actual founding year
  stats: [
    { value: '3,180+', label: 'Loads dispatched' },
    { value: '48', label: 'States covered' },
    { value: '96.4%', label: 'On-time delivery' },
    { value: '24/7', label: 'Live dispatch desk' },
  ], // PLACEHOLDER — swap for real performance numbers
  serviceArea: 'Nationwide (Lower 48)', // PLACEHOLDER — confirm actual coverage
} as const

export type LogisticsConfig = typeof logisticsConfig
