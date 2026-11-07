export const POPULAR_TIMEZONES = [
  // Australia (Prominent)
  { city: 'Sydney', region: 'Australia (AEST/AEDT • Eastern)', tz: 'Australia/Sydney', category: 'Australia' },
  { city: 'Melbourne', region: 'Australia (AEST/AEDT • Victoria)', tz: 'Australia/Melbourne', category: 'Australia' },
  { city: 'Brisbane', region: 'Australia (AEST • Queensland)', tz: 'Australia/Brisbane', category: 'Australia' },
  { city: 'Perth', region: 'Australia (AWST • Western Australia)', tz: 'Australia/Perth', category: 'Australia' },
  { city: 'Adelaide', region: 'Australia (ACST/ACDT • South Australia)', tz: 'Australia/Adelaide', category: 'Australia' },
  { city: 'Darwin', region: 'Australia (ACST • Northern Territory)', tz: 'Australia/Darwin', category: 'Australia' },
  { city: 'Hobart', region: 'Australia (AEST/AEDT • Tasmania)', tz: 'Australia/Hobart', category: 'Australia' },

  // Global Hubs
  { city: 'UTC / GMT', region: 'Universal Coordinated Time', tz: 'UTC', category: 'Global' },
  { city: 'London', region: 'United Kingdom (GMT/BST)', tz: 'Europe/London', category: 'Europe' },
  { city: 'New York', region: 'United States (EST/EDT • Eastern)', tz: 'America/New_York', category: 'Americas' },
  { city: 'San Francisco', region: 'United States (PST/PDT • Pacific)', tz: 'America/Los_Angeles', category: 'Americas' },
  { city: 'Tokyo', region: 'Japan (JST)', tz: 'Asia/Tokyo', category: 'Asia' },
  { city: 'Singapore', region: 'Singapore (SGT)', tz: 'Asia/Singapore', category: 'Asia' },
  { city: 'Dubai', region: 'United Arab Emirates (GST)', tz: 'Asia/Dubai', category: 'Middle East' },
  { city: 'Mumbai / Delhi', region: 'India (IST)', tz: 'Asia/Kolkata', category: 'Asia' },
  { city: 'Paris', region: 'France (CET/CEST)', tz: 'Europe/Paris', category: 'Europe' },
  { city: 'Berlin', region: 'Germany (CET/CEST)', tz: 'Europe/Berlin', category: 'Europe' },
  { city: 'Hong Kong', region: 'Hong Kong (HKT)', tz: 'Asia/Hong_Kong', category: 'Asia' },
  { city: 'Seoul', region: 'South Korea (KST)', tz: 'Asia/Seoul', category: 'Asia' },
  { city: 'Auckland', region: 'New Zealand (NZST/NZDT)', tz: 'Pacific/Auckland', category: 'Pacific' },
  { city: 'Toronto', region: 'Canada (EST/EDT)', tz: 'America/Toronto', category: 'Americas' },
  { city: 'Chicago', region: 'United States (CST/CDT)', tz: 'America/Chicago', category: 'Americas' },
  { city: 'Amsterdam', region: 'Netherlands (CET/CEST)', tz: 'Europe/Amsterdam', category: 'Europe' },
  { city: 'Zurich', region: 'Switzerland (CET/CEST)', tz: 'Europe/Zurich', category: 'Europe' },
  { city: 'Bangkok', region: 'Thailand (ICT)', tz: 'Asia/Bangkok', category: 'Asia' }
];

// Single default world time zone
export const DEFAULT_SAVED_ZONES = [
  { id: '1', city: 'Sydney', tz: 'Australia/Sydney' }
];
