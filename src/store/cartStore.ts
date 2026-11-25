import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ColorVariant, SetOption } from '../hooks/useProducts';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: ColorVariant;
  selectedSetOption?: SetOption;
  itemKey: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  isDrawerOpen: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, selectedColor?: ColorVariant, selectedSetOption?: SetOption) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discountAmount: number) => void;
  setDrawerOpen: (isOpen: boolean) => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
  total: () => number;
}

const generateItemKey = (productId: string, color?: ColorVariant, setOpt?: SetOption): string => {
  const colorKey = color?.name ? `_c:${color.name}` : '';
  const setKey = setOpt?.name ? `_s:${setOpt.name}` : '';
  return `${productId}${colorKey}${setKey}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      isDrawerOpen: false,

      addItem: (product, quantity = 1, selectedColor, selectedSetOption) => {
        const prodId = product._id || product.id;
        const itemKey = generateItemKey(prodId, selectedColor, selectedSetOption);

        set((state) => {
          const existingItemIndex = state.items.findIndex(item => item.itemKey === itemKey);
          
          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          } else {
            return { 
              items: [
                ...state.items, 
                { 
                  product, 
                  quantity, 
                  selectedColor, 
                  selectedSetOption,
                  itemKey 
                }
              ] 
            };
          }
        });
      },

      removeItem: (itemKey) => {
        set((state) => ({
          items: state.items.filter(item => item.itemKey !== itemKey && item.product.id !== itemKey && item.product._id !== itemKey)
        }));
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item => 
            (item.itemKey === itemKey || item.product.id === itemKey || item.product._id === itemKey) 
              ? { ...item, quantity } 
              : item
          )
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discount: 0 });
      },

      applyCoupon: (code, discountAmount) => {
        set({ couponCode: code, discount: discountAmount });
      },

      setDrawerOpen: (isOpen) => {
        set({ isDrawerOpen: isOpen });
      },

      itemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const unitPrice = item.selectedSetOption?.price !== undefined ? item.selectedSetOption.price : item.product.price;
          return sum + (unitPrice * item.quantity);
        }, 0);
      },

      total: () => {
        const currentSubtotal = get().subtotal();
        const discountAmount = get().discount;
        return Math.max(0, currentSubtotal - discountAmount);
      }
    }),
    {
      name: 'style-end-purse-cart-storage',
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
    }
  )
);
