'use client';

import React, { useState, useRef } from 'react';
import { Settings } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Save, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsClientProps {
  initialSettings: Settings | null;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Extract scale from initialSettings
  const getInitialScale = () => {
    const url = initialSettings?.logo_url || '';
    const match = url.match(/#scale=(\d+)/);
    return match ? Number(match[1]) : 100;
  };

  const getCleanLogoUrl = () => {
    const url = initialSettings?.logo_url || '';
    return url.split('#')[0] || '';
  };

  const [logoScale, setLogoScale] = useState(getInitialScale());

  const [form, setForm] = useState<Partial<Settings>>({
    business_name: initialSettings?.business_name ?? 'Thaarakam',
    logo_url: getCleanLogoUrl(),
    whatsapp_number: initialSettings?.whatsapp_number ?? '',
    store_email: initialSettings?.store_email ?? '',
    shipping_kerala: initialSettings?.shipping_kerala ?? 50,
    shipping_south_india: initialSettings?.shipping_south_india ?? 60,
    shipping_north_india: initialSettings?.shipping_north_india ?? 80,
    default_description: initialSettings?.default_description ?? '',
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.startsWith('shipping_') ? Number(value) : value,
    }));
  };

  // Resizes and compresses very large images client-side to fit Vercel's 4.5MB limit while keeping crystal-clear quality
  const compressImageIfLarge = (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      // If file is already under 2.0 MB, upload the original file directly to keep 100% original quality
      if (file.size < 2.0 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 2000; // 2K resolution (extremely high quality)
          const MAX_HEIGHT = 2000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file); // fallback
              }
            },
            'image/jpeg',
            0.88 // 88% quality (completely artifact-free)
          );
        };
      };
    });
  };

  // Convert File/Blob object to base64 string
  const convertToBase64 = (file: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Compress image aggressively for local DB storage to prevent Next.js serialization size limit crashes (~30KB)
  const compressImageForLocalDb = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // Small resolution for database storage
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.60); // 60% quality
          resolve(dataUrl);
        };
      };
    });
  };

  // Direct client-side logo upload to ImgBB (0% server CPU usage)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingLogo(true);
    setStatus(null);

    try {
      const apiKey = 'd3905eac5d51cfab6cde5c943670d3e0';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data && resJson.data.url) {
          setForm((prev) => ({ ...prev, logo_url: resJson.data.url }));
          setStatus({ type: 'success', message: 'Logo uploaded successfully. Remember to save changes.' });
          return;
        }
      }

      // Fallback: local compressed base64 if ImgBB fails
      const smallDataUri = await compressImageForLocalDb(file);
      setForm((prev) => ({ ...prev, logo_url: smallDataUri }));
      setStatus({ type: 'success', message: 'Logo uploaded using local database backup. Remember to save changes.' });
    } catch (err: any) {
      console.error('Logo upload error:', err);
      // Fallback to local base64 on network exception
      const smallDataUri = await compressImageForLocalDb(file);
      setForm((prev) => ({ ...prev, logo_url: smallDataUri }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logo_url: '' }));
  };

  // Direct client-side store settings update (0% server CPU usage)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Basic WhatsApp verification
    if (!form.whatsapp_number?.trim()) {
      setStatus({ type: 'error', message: 'WhatsApp number is required.' });
      setSaving(false);
      return;
    }

    try {
      const logoUrlBase = form.logo_url ? form.logo_url.split('#')[0] : '';
      const updatedForm = {
        ...form,
        logo_url: logoUrlBase ? `${logoUrlBase}#scale=${logoScale}` : `#scale=${logoScale}`
      };
      
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('settings')
        .update(updatedForm)
        .eq('id', 1);

      if (!error) {
        setStatus({ type: 'success', message: 'Store settings updated successfully!' });
      } else {
        setStatus({ type: 'error', message: error.message || 'Failed to update settings.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
          Store Settings
        </h1>
        <p className="text-xs text-secondary">
          Configure regional shipping, whatsapp checkout routes, and product defaults.
        </p>
      </div>

      {/* Notifications */}
      {status && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
          status.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-medium leading-relaxed">{status.message}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Box 1: Store info */}
        <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Store Profile
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="business_name" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Business Name
              </label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                value={form.business_name}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="Thaarakam"
              />
            </div>

            {/* Store Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="store_email" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Store Email (Optional)
              </label>
              <input
                type="email"
                id="store_email"
                name="store_email"
                value={form.store_email || ''}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="contact@thaarakam.com"
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="whatsapp_number" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              WhatsApp Contact Number
            </label>
            <input
              type="text"
              id="whatsapp_number"
              name="whatsapp_number"
              value={form.whatsapp_number}
              onChange={handleInputChange}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
              placeholder="e.g. 919876543210 (include country code)"
            />
            <p className="text-[9px] text-secondary">
              Must include country code (e.g. 91 for India) with no spaces or symbols. This handles checkout redirection.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Store Logo
            </span>
            <div className="flex items-center gap-6">
              <div className="relative border border-border p-4 rounded-xl bg-border/5 flex items-center justify-center min-h-24 min-w-36 overflow-hidden">
                <img
                  src={form.logo_url || '/images/thaarakaml.png'}
                  alt="Logo Preview"
                  style={{ height: `${32 * (logoScale / 100)}px` }}
                  className="max-w-[200px] object-contain transition-all duration-200"
                />
                {form.logo_url && form.logo_url !== '/images/thaarakaml.png' && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 border border-red-200"
                    aria-label="Remove logo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Zoom controls */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Logo Size (Zoom)
                  </span>
                  <span className="text-[11px] font-semibold text-foreground mt-0.5">
                    {logoScale}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLogoScale((prev) => Math.max(50, prev - 10))}
                    className="h-8 w-8 rounded-lg border border-border bg-background text-foreground flex items-center justify-center font-bold hover:bg-border/20 active:scale-95 transition-all text-xs"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoScale((prev) => Math.min(400, prev + 10))}
                    className="h-8 w-8 rounded-lg border border-border bg-background text-foreground flex items-center justify-center font-bold hover:bg-border/20 active:scale-95 transition-all text-xs"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="rounded-xl border border-border hover:border-foreground/20 px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

        </div>

        {/* Box 2: Shipping Charges */}
        <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Shipping Charges (₹)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Kerala */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shipping_kerala" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Kerala
              </label>
              <input
                type="number"
                id="shipping_kerala"
                name="shipping_kerala"
                value={form.shipping_kerala}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="50"
              />
            </div>

            {/* South India */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shipping_south_india" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                South India
              </label>
              <input
                type="number"
                id="shipping_south_india"
                name="shipping_south_india"
                value={form.shipping_south_india}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="60"
              />
            </div>

            {/* North India */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shipping_north_india" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                North India
              </label>
              <input
                type="number"
                id="shipping_north_india"
                name="shipping_north_india"
                value={form.shipping_north_india}
                onChange={handleInputChange}
                className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                placeholder="80"
              />
            </div>

          </div>
        </div>

        {/* Box 3: Default Product Description */}
        <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Default Product Description
          </h2>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="default_description" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
              Product Description Template
            </label>
            <textarea
              id="default_description"
              name="default_description"
              value={form.default_description}
              onChange={handleInputChange}
              rows={8}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors resize-y leading-relaxed"
              placeholder="Material, Finish, Wear details..."
            />
            <p className="text-[9px] text-secondary">
              This template will automatically append/prepend to every product page. Useful for global care tips and metal declarations.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-foreground text-background py-3.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving changes...' : 'Save Settings'}
        </button>

      </form>
    </div>
  );
}
