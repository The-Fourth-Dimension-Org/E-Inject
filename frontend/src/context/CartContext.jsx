
import { createContext, useMemo, useState } from "react";

export const CartContext = createContext(null);

export default function CartContextProvider({ children }) {
  const [cart, setCart] = useState([]); 

  const addToCart = (product, qty = 1) => {
    if (!product?.id) return;
    setCart((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (id, newQty) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(1, newQty) } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, p) => sum + p.price * p.qty, 0),
    [cart]
  );

  const value = {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
