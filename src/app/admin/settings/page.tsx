import React, { Suspense } from 'react';
import SettingsClient from './SettingsClient';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/types';

// Enable static export caching for admin settings page
export const revalidate = 86400;

async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings for admin Settings page:', error);
      return null;
    }
    return data as Settings;
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
