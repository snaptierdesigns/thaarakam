'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, CATEGORIES } from '@/types';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { Search, Plus, Minus, Trash2, Edit, Upload, X, ArrowLeft, Save, Star, RefreshCw, Layers } from 'lucide-react';

interface ProductsClientProps {
  initialProducts: Product[];
}

type ViewType = 'list' | 'add' | 'edit';

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Read action from query params (e.g. from dashboard quick actions)
  const actionParam = searchParams.get('action');

  const [view, setView] = useState<ViewType>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [filterPreorder, setFilterPreorder] = useState<boolean | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<string>(CATEGORIES[0]);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formRequiresSize, setFormRequiresSize] = useState(false);
  const [formMaxSize, setFormMaxSize] = useState('18');
  const [formAvailableSizes, setFormAvailableSizes] = useState<string[]>([]);
  const [formOutOfStockSizes, setFormOutOfStockSizes] = useState<string[]>([]);
  const [formPreorder, setFormPreorder] = useState(false);
  const [formAvailability, setFormAvailability] = useState<'in_stock' | 'out_of_stock'>('in_stock');
  const [formStockCount, setFormStockCount] = useState<string>('10');
  
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);

  const fetchFreshProducts = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('thaarakam_shop_cache');
      }
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('name', 'General Store Review Placeholder')
        .order('created_at', { ascending: false });
      if (data) {
        const cleaned = data.map(item => ({
          ...item,
          name: item.name ? item.name.trim() : item.name,
        }));
        setProductsList(cleaned as Product[]);
      }
    } catch (e) {
      console.error('Error fetching fresh products:', e);
    }
  };

  useEffect(() => {
    fetchFreshProducts();
  }, []);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check query parameters to automatically open the Add view
  useEffect(() => {
    if (actionParam === 'add') {
      handleAddClick();
    }
  }, [actionParam]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategory(CATEGORIES[0]);
    setFormImages([]);
    setFormDescription('');
    setFormFeatured(false);
    setFormRequiresSize(false);
    setFormMaxSize('18');
    setFormAvailableSizes([]);
    setFormOutOfStockSizes([]);
    setFormPreorder(false);
    setFormAvailability('in_stock');
    setFormStockCount('10');
    setStatus(null);
    setSaving(false);
    setView('add');
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormCategory(product.category);
    setFormImages(product.images || []);
    setFormDescription(product.description || '');
    setFormFeatured(product.is_featured);
    setFormRequiresSize(product.requires_size);
    setFormMaxSize(product.max_size?.toString() || '18');
    setFormAvailableSizes((product.available_sizes || []).map(String));
    setFormOutOfStockSizes((product.out_of_stock_sizes || []).map(String));
    setFormPreorder(product.is_preorder);
    setFormAvailability((product.stock_count !== null && product.stock_count > 0) ? 'in_stock' : product.availability);
    setFormStockCount(product.stock_count !== null && product.stock_count !== undefined ? product.stock_count.toString() : '');
    setStatus(null);
    setSaving(false);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingProduct(null);
    setStatus(null);
    setSaving(false);
    // Clear URL param if present
    if (actionParam) {
      router.replace('/admin/products');
    }
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

  // Direct client-side image upload (ImgBB 100% Free CDN + Supabase Storage fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingIndex(slotIndex);
    setStatus(null);

    try {
      // 1. Primary: Upload directly to ImgBB (0 BYTES Supabase Egress, 100% Free CDN)
      const IMGBB_KEY = 'd3905eac5d51cfab6cde5c943670d3e0';
      const compressedFile = await compressImageIfLarge(file);

      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1] || res);
        };
        reader.readAsDataURL(compressedFile);
      });

      const formData = new URLSearchParams();
      formData.append('key', IMGBB_KEY);
      formData.append('image', base64String);

      const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const imgbbData = await imgbbRes.json();
      if (imgbbData && imgbbData.data && imgbbData.data.url) {
        setFormImages((prev) => {
          const next = [...prev];
          next[slotIndex] = imgbbData.data.url;
          return next;
        });
        setStatus({ type: 'success', message: 'Image uploaded successfully.' });
        return;
      }

      // 2. Secondary Fallback: Supabase Storage if ImgBB API fails
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(fileName, compressedFile, {
          cacheControl: '3600000',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          setFormImages((prev) => {
            const next = [...prev];
            next[slotIndex] = publicUrlData.publicUrl;
            return next;
          });
          return;
        }
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setStatus({ type: 'error', message: 'Failed to upload image. Please try again.' });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImageSlot = (slotIndex: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  // Direct client-side product deletion (0% server CPU usage)
  const handleDeleteProductClick = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        const admin = getSupabaseAdmin();
        const { error } = await admin
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) {
          alert(error.message || 'Failed to delete product.');
        } else {
          await fetchFreshProducts();
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while deleting the product.');
      }
    }
  };

  // Direct client-side product save/update (0% server CPU usage)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formName.trim()) {
      setStatus({ type: 'error', message: 'Product Name is required.' });
      return;
    }
    if (!formPrice.trim() || isNaN(Number(formPrice)) || Number(formPrice) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid price.' });
      return;
    }
    
    // Validate image selection
    const cleanImages = formImages.filter(Boolean);
    if (cleanImages.length === 0) {
      setStatus({ type: 'error', message: 'At least one cover image is required.' });
      return;
    }

    setSaving(true);

    try {
      const parsedStock = formStockCount.trim() === '' ? null : Number(formStockCount);
      const computedAvailability = (parsedStock !== null && parsedStock <= 0) ? 'out_of_stock' : (parsedStock !== null && parsedStock > 0) ? 'in_stock' : formAvailability;

      const computedAvailableSizes = formAvailableSizes.filter(s => s.trim() !== '');
      const numericSizes = computedAvailableSizes.map(Number).filter(n => !isNaN(n));
      const computedMaxSize = numericSizes.length > 0
        ? Math.max(...numericSizes)
        : (formRequiresSize ? Number(formMaxSize || 18) : null);

      const payload = {
        name: formName.trim(),
        price: Number(formPrice),
        category: formCategory,
        images: cleanImages,
        description: formDescription,
        is_featured: formFeatured,
        requires_size: formRequiresSize,
        max_size: computedMaxSize,
        available_sizes: computedAvailableSizes,
        out_of_stock_sizes: formOutOfStockSizes,
        is_preorder: formPreorder,
        availability: computedAvailability,
        stock_count: parsedStock,
      };

      const admin = getSupabaseAdmin();
      let res;
      if (editingProduct?.id) {
        res = await admin
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)
          .select();
      } else {
        res = await admin
          .from('products')
          .insert([payload])
          .select();
      }

      if (!res.error) {
        if (res.data && res.data.length > 0) {
          const savedProduct = res.data[0] as Product;
          setProductsList((prev) => [savedProduct, ...prev.filter((p) => p.id !== savedProduct.id)]);
        }

        setStatus({
          type: 'success',
          message: editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
        });
        
        fetchFreshProducts();
        setTimeout(() => {
          handleBackToList();
        }, 1000);
      } else {
        setStatus({ type: 'error', message: res.error.message || 'Failed to save product.' });
        setSaving(false);
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Error saving product' });
      setSaving(false);
    }
  };

  // Helper to get stock priority: 1 = In Stock, 2 = Low Stock (<= 3), 3 = Out of Stock
  // Helper to get stock priority: 1 = Available/In Stock (Top), 2 = Out of Stock (Bottom)
  const getStockPriority = (product: Product): number => {
    const isOutOfStock = product.availability === 'out_of_stock' || (product.stock_count !== null && product.stock_count !== undefined && product.stock_count <= 0 && !product.is_preorder);
    return isOutOfStock ? 2 : 1;
  };

  // Client filtering and stockwise sorting (Newest at top, Out of stock at bottom)
  const filteredProducts = productsList
    .filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = filterCategory ? product.category === filterCategory : true;
      const matchesAvailability = filterAvailability ? product.availability === filterAvailability : true;
      
      const matchesFeatured = filterFeatured !== null
        ? product.is_featured === filterFeatured
        : true;
        
      const matchesPreorder = filterPreorder !== null
        ? product.is_preorder === filterPreorder
        : true;

      return matchesSearch && matchesCategory && matchesAvailability && matchesFeatured && matchesPreorder;
    })
    .sort((a, b) => {
      const priorityA = getStockPriority(a);
      const priorityB = getStockPriority(b);

      // 1. Out of stock products go to the bottom
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 2. Newest products come to the top (created_at descending)
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

  return (
    <div className="flex flex-col gap-6">
      
      {/* List View */}
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-light tracking-wider uppercase text-foreground">
                Products Inventory
              </h1>
              <p className="text-xs text-secondary">
                Manage your store products, pricing, stock levels, sizes, and galleries.
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="self-start sm:self-center rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4 stroke-[2]" />
              Add Product
            </button>
          </div>

          {/* Search and Filters Deck */}
          <div className="rounded-2xl border border-border p-5 bg-background flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Text Search */}
              <div className="relative col-span-1 sm:col-span-2">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-secondary/60">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-secondary/50 focus:border-foreground/45 focus:outline-none transition-colors"
                />
              </div>

              {/* Category selector */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-secondary focus:border-foreground/45 focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Availability selector */}
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-secondary focus:border-foreground/45 focus:outline-none cursor-pointer"
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {/* Badges Toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterFeatured(prev => prev === true ? null : true)}
                  className={`flex-1 rounded-xl border text-xs font-semibold px-2 py-2 transition-all ${
                    filterFeatured === true
                      ? 'bg-foreground border-foreground text-background'
                      : 'bg-background border-border text-secondary hover:border-foreground/30'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setFilterPreorder(prev => prev === true ? null : true)}
                  className={`flex-1 rounded-xl border text-xs font-semibold px-2 py-2 transition-all ${
                    filterPreorder === true
                      ? 'bg-foreground border-foreground text-background'
                      : 'bg-background border-border text-secondary hover:border-foreground/30'
                  }`}
                >
                  Pre Order
                </button>
              </div>

            </div>
          </div>

          {/* Catalog Listing Table */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl">
              <p className="text-xs text-secondary italic">No products found matching your filters.</p>
              {(searchQuery || filterCategory || filterAvailability || filterFeatured || filterPreorder) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('');
                    setFilterAvailability('');
                    setFilterFeatured(null);
                    setFilterPreorder(null);
                  }}
                  className="mt-3 text-[10px] font-bold uppercase tracking-widest text-foreground hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-border/10 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Options</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredProducts.map((product) => {
                    const coverImg = product.images?.[0] || '/images/placeholder.jpg';
                    const isOutOfStock = product.availability === 'out_of_stock';
                    
                    return (
                      <tr key={product.id} className="hover:bg-border/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={coverImg} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-border/20 border border-border/30" />
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground line-clamp-1">{product.name}</span>
                              <span className="text-[9px] text-secondary mt-0.5">ID: {product.id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-secondary">{product.category}</td>
                        <td className="px-6 py-4 font-semibold">₹{Number(product.price).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {isOutOfStock ? (
                              <span className="rounded bg-red-50 border border-red-100 text-red-700 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">Out of Stock</span>
                            ) : (
                              <span className="rounded bg-green-50 border border-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">In Stock</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {product.is_featured && (
                              <span className="rounded bg-purple-50 border border-purple-100 text-purple-700 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide flex items-center gap-0.5">
                                <Star className="h-2 w-2 fill-purple-700 stroke-[3]" /> Featured
                              </span>
                            )}
                            {product.is_preorder && (
                              <span className="rounded bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide flex items-center gap-0.5">
                                PreOrder
                              </span>
                            )}
                            {product.requires_size && (
                              <span className="rounded bg-blue-50 border border-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                                {product.available_sizes && product.available_sizes.length > 0
                                  ? `Sizes: ${product.available_sizes.join(', ')}`
                                  : `Size Max: ${product.max_size}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="rounded-lg p-1.5 text-secondary hover:text-foreground hover:bg-border/30 transition-all focus:outline-none"
                              aria-label="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(product.id, product.name)}
                              className="rounded-lg p-1.5 text-secondary hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none"
                              aria-label="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Form View */}
      {(view === 'add' || view === 'edit') && (
        <div className="max-w-[800px] flex flex-col gap-6">
          
          {/* Form Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="rounded-xl border border-border bg-background p-2 text-secondary hover:text-foreground transition-all"
              aria-label="Back to products list"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-wider text-secondary">
                {view === 'add' ? 'Create New Item' : 'Modify Item'}
              </span>
              <h1 className="text-xl font-semibold tracking-wider uppercase text-foreground">
                {view === 'add' ? 'Add Product' : `Edit Product: ${editingProduct?.name}`}
              </h1>
            </div>
          </div>

          {/* Form Status Message */}
          {status && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              status.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <span className="text-xs font-medium leading-relaxed">{status.message}</span>
            </div>
          )}

          {/* Form body */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Box 1: Product Basics */}
            <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Product Details
              </h2>

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="formName" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Product Name
                </label>
                <input
                  type="text"
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                  placeholder="e.g. Classic Pearl Stud Earrings"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="formPrice" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Price (₹)
                  </label>
                  <input
                    type="text"
                    id="formPrice"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors"
                    placeholder="e.g. 599"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="formCategory" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Category
                  </label>
                  <select
                    id="formCategory"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-secondary focus:border-foreground/40 focus:outline-none cursor-pointer h-10"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="formDescription" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                  Additional Product Description (Optional)
                </label>
                <textarea
                  id="formDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors resize-y leading-relaxed"
                  placeholder="Specific details about this product. Appends below the default description."
                />
              </div>

            </div>

            {/* Box 2: Options and Stock */}
            <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Stock & Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Stock Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="formAvailability" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Availability
                  </label>
                  <select
                    id="formAvailability"
                    value={formAvailability}
                    onChange={(e) => setFormAvailability(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-secondary focus:border-foreground/40 focus:outline-none cursor-pointer h-10"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Stock Count */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="formStockCount" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    id="formStockCount"
                    value={formStockCount}
                    onChange={(e) => setFormStockCount(e.target.value)}
                    min="0"
                    placeholder="e.g. 10 (Leave blank for unlimited)"
                    className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-foreground/40 focus:outline-none transition-colors h-10"
                  />
                </div>

                {/* Requires Size Selector */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="formRequiresSize" className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                      Requires Size
                    </label>
                    <input
                      type="checkbox"
                      id="formRequiresSize"
                      checked={formRequiresSize}
                      onChange={(e) => setFormRequiresSize(e.target.checked)}
                      className="accent-foreground h-4 w-4"
                    />
                  </div>
                  {formRequiresSize && (
                    <div className="flex flex-col gap-3 mt-3 p-4 rounded-xl border border-border bg-border/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">Custom Available Sizes</span>
                        <button
                          type="button"
                          onClick={() => setFormAvailableSizes(prev => [...prev, ''])}
                          className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all"
                        >
                          <Plus className="h-3 w-3" /> Add Size Box
                        </button>
                      </div>

                      {/* Dynamic List of Size Input Boxes */}
                      <div className="flex flex-wrap gap-2">
                        {formAvailableSizes.map((sizeVal, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={sizeVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAvailableSizes(prev => prev.map((s, i) => (i === idx ? val : s)));
                              }}
                              placeholder={`Size e.g. ${idx + 6}`}
                              className="w-20 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-center focus:border-foreground/40 focus:outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setFormAvailableSizes(prev => prev.filter((_, i) => i !== idx))}
                              className="rounded-lg p-1 text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove size box"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Per-Size Out of Stock Checklist */}
                      {formAvailableSizes.filter(s => s.trim() !== '').length > 0 && (
                        <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                            Disable Specific Sizes (Out of Stock)
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {formAvailableSizes.filter(s => s.trim() !== '').map((sVal) => {
                              const isOos = formOutOfStockSizes.includes(sVal);
                              return (
                                <button
                                  key={sVal}
                                  type="button"
                                  onClick={() => {
                                    if (isOos) {
                                      setFormOutOfStockSizes(prev => prev.filter(x => x !== sVal));
                                    } else {
                                      setFormOutOfStockSizes(prev => [...prev, sVal]);
                                    }
                                  }}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                                    isOos
                                      ? 'bg-red-100 border-red-300 text-red-700 font-bold line-through'
                                      : 'bg-background border-border text-foreground hover:border-foreground/40'
                                  }`}
                                >
                                  Size {sVal} {isOos ? '(Sold Out)' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <hr className="border-border" />

              {/* Toggles Row */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Featured Checkbox */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50 hover:border-foreground/20 cursor-pointer transition-all">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground">Featured Product</span>
                    <span className="text-[9px] text-secondary mt-0.5">Show in home featured grid</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="accent-foreground h-4 w-4"
                  />
                </label>

                {/* Pre Order Checkbox */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background/50 hover:border-foreground/20 cursor-pointer transition-all">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground">Pre Order</span>
                    <span className="text-[9px] text-secondary mt-0.5">Allows ordering if out of stock</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formPreorder}
                    onChange={(e) => setFormPreorder(e.target.checked)}
                    className="accent-foreground h-4 w-4"
                  />
                </label>

              </div>

            </div>

            {/* Box 3: Image Galleries (Up to 3 Images) */}
            <div className="rounded-2xl border border-border p-6 bg-background flex flex-col gap-5">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Product Gallery
                </h2>
                <p className="text-[9px] text-secondary">
                  Upload up to 3 images. The first image will be set as the catalog cover photo.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((idx) => {
                  const imageUrl = formImages[idx];
                  const isUploading = uploadingIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="relative aspect-square w-full rounded-xl border border-dashed border-border bg-border/5 flex flex-col items-center justify-center p-2 text-center"
                    >
                      {imageUrl ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={imageUrl}
                            alt={`Preview Slot ${idx + 1}`}
                            className="h-full w-full object-cover rounded-lg"
                          />
                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity rounded-lg">
                            <button
                              type="button"
                              onClick={() => fileInputRefs[idx].current?.click()}
                              className="rounded-lg bg-background p-1.5 text-foreground hover:opacity-85 shadow-sm text-[10px]"
                              title="Replace"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageSlot(idx)}
                              className="rounded-lg bg-red-100 p-1.5 text-red-600 hover:bg-red-200 border border-red-200"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs[idx].current?.click()}
                          disabled={isUploading}
                          className="w-full h-full flex flex-col items-center justify-center text-secondary gap-1.5 focus:outline-none"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-[9px] uppercase tracking-wider font-semibold">
                            {isUploading ? 'Uploading...' : `Slot ${idx + 1}`}
                          </span>
                        </button>
                      )}

                      {/* File Inputs hidden */}
                      <input
                        type="file"
                        ref={fileInputRefs[idx]}
                        onChange={(e) => handleImageUpload(e, idx)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBackToList}
                disabled={saving}
                className="flex-1 rounded-xl border border-border hover:border-foreground/20 py-3.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-foreground text-background py-3.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : view === 'add' ? 'Create Product' : 'Save Product'}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
