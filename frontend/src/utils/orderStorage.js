// Simple localStorage-based order storage

const KEY = "orders_v1";

export function loadOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const all = loadOrders();
  const next = [order, ...all];
  localStorage.setItem(KEY, JSON.stringify(next));
  return order;
}

export function findOrderById(id) {
  return loadOrders().find(o => o.id === id);
}
