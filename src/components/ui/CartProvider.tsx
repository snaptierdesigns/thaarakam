'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedSize: number | null) => void;
  removeFromCart: (productId: string, selectedSize: number | null) => void;
  updateQuantity: (productId: string, selectedSize: number | null, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('thaarakam_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('thaarakam_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number, selectedSize: number | null) => {
    // Prevent adding if out of stock and not pre-order
    if (product.availability === 'out_of_stock' && !product.is_preorder) {
      return;
    }

    setCart((prevCart) => {
      // Find if item with same ID and same Size already exists
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      const hasStockLimit = product.stock_count !== null && product.stock_count !== undefined && !product.is_preorder;
      const currentQty = existingItemIndex > -1 ? prevCart[existingItemIndex].quantity : 0;
      const maxAllowed = hasStockLimit ? (product.stock_count ?? 999) : 999;
      const targetQty = Math.min(maxAllowed, currentQty + quantity);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity = targetQty;
        return newCart;
      }

      return [...prevCart, { product, quantity: targetQty, selectedSize }];
    });
  };

  const removeFromCart = (productId: string, selectedSize: number | null) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (productId: string, selectedSize: number | null, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
          const hasStockLimit = item.product.stock_count !== null && item.product.stock_count !== undefined && !item.product.is_preorder;
          const maxAllowed = hasStockLimit ? (item.product.stock_count ?? 999) : 999;
          const targetQty = Math.min(maxAllowed, quantity);
          return { ...item, quantity: targetQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
