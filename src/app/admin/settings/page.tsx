import React, { Suspense } from 'react';
import SettingsClient from './SettingsClient';
import { queryD1 } from '@/lib/d1';
import { Settings } from '@/types';

// Enable static export caching for admin settings page
export const revalidate = 86400;

async function getSettings() {
  try {
    const res = await queryD1('SELECT * FROM settings WHERE id = 1 LIMIT 1');
    if (res.success && res.results.length > 0) {
      return res.results[0] as Settings;
    }
    return null;
  } catch (error) {
    console.error('Unexpected error fetching settings for admin Settings page:', error);
    return null;
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <p className="text-xs text-secondary animate-pulse">Loading settings...</p>
      </div>
    }>
      <SettingsClient initialSettings={settings} />
    </Suspense>
  );
}
