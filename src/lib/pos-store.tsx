import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type MenuItem } from "./menu-data";
import { apiFetch, getAuthToken } from "./api";

export type OrderType = "Dine-In" | "Take Away";
export type PaymentMode = "Cash" | "UPI";
export type AcMode = "AC" | "Non-AC";

export type OrderLine = {
  code: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id?: string;
  billNo: string;
  date: string; // ISO
  items: OrderLine[];
  subtotal: number;
  gstPct: number;
  gstAmount: number;
  acCharge: number;
  total: number;
  paymentMode: PaymentMode;
  orderType: OrderType;
  acMode?: AcMode;
};

export type Settings = {
  restaurantName: string;
  address: string;
  phone: string;
  gstNumber: string;
  footer: string;
  gstEnabled: boolean;
  gstPct: number;
  acEnabled: boolean;
  acCharge: number;
};

const DEFAULT_SETTINGS: Settings = {
  restaurantName: "My Restaurant",
  address: "",
  phone: "",
  gstNumber: "",
  footer: "Thank you! Visit again.",
  gstEnabled: false,
  gstPct: 0,
  acEnabled: false,
  acCharge: 0,
};

type Cart = Record<string, number>; // code -> qty

type Ctx = {
  menu: MenuItem[];
  addMenu: (m: MenuItem) => Promise<string | null>;
  updateMenu: (originalCode: string, m: MenuItem) => Promise<string | null>;
  deleteMenu: (code: string) => Promise<void>;
  cart: Cart;
  setQty: (code: string, qty: number) => void;
  clearCart: () => void;
  orders: Order[];
  trends: any;
  ordersPage: number;
  hasMoreOrders: boolean;
  ordersSearchQuery: string;
  isFetchingOrders: boolean;
  submitOrder: (paymentMode: string, diningType: string, isAC: boolean, items: {code: string, quantity: number}[]) => Promise<Order>;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => Promise<string | null>;
  loading: boolean;
  updatePins: (pins: { menu?: string; settings?: string; trends?: string }) => Promise<string | null>;
  loadData: () => Promise<void>;
  fetchNextOrdersPage: () => Promise<void>;
  searchOrders: (query: string) => Promise<void>;
};

const PosCtx = createContext<Ctx | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [menuData, settingsData, ordersData, trendsData] = await Promise.allSettled([
        apiFetch("/menu"),
        apiFetch("/settings"),
        apiFetch("/orders?page=1&limit=20"),
        apiFetch("/trends")
      ]);

      if (menuData.status === "fulfilled") setMenu(menuData.value);
      if (settingsData.status === "fulfilled" && settingsData.value) setSettings(settingsData.value);
      if (ordersData.status === "fulfilled") {
        setOrders(ordersData.value.data);
        setHasMoreOrders(ordersData.value.hasMore);
      }
      if (trendsData.status === "fulfilled") setTrends(trendsData.value);
    } catch (err) {
      console.error("Failed to fetch POS data", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      menu,
      loading,
      orders,
      trends,
      ordersPage,
      hasMoreOrders,
      ordersSearchQuery,
      isFetchingOrders,
      cart,
      settings,
      addMenu: async (m) => {
        try {
          const newItem = await apiFetch("/menu", {
            method: "POST",
            body: JSON.stringify(m)
          });
          setMenu((prev) => [...prev, newItem].sort((a, b) => a.code.localeCompare(b.code)));
          return null;
        } catch (err: any) {
          return err.message || "Failed to add item";
        }
      },
      updateMenu: async (originalCode, m) => {
        try {
          const updatedItem = await apiFetch(`/menu/${originalCode}`, {
            method: "PUT",
            body: JSON.stringify(m)
          });
          setMenu((prev) =>
            prev
              .map((i) => (i.code === originalCode ? updatedItem : i))
              .sort((a, b) => a.code.localeCompare(b.code)),
          );
          return null;
        } catch (err: any) {
          return err.message || "Failed to update item";
        }
      },
      deleteMenu: async (code) => {
        try {
          await apiFetch(`/menu/${code}`, {
            method: "DELETE"
          });
          setMenu((prev) => prev.filter((i) => i.code !== code));
        } catch (err: any) {
          console.error("Failed to delete item", err);
          throw err;
        }
      },
      cart,
      setQty: (code, qty) =>
        setCart((prev) => {
          const next = { ...prev };
          if (qty <= 0) delete next[code];
          else next[code] = qty;
          return next;
        }),
      clearCart: () => setCart({}),
      orders,
      submitOrder: async (paymentMode, diningType, isAC, items) => {
        const newOrder = await apiFetch("/orders", {
          method: "POST",
          body: JSON.stringify({ paymentMode, diningType, isAC, items })
        });
        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
      },
      settings,
      updateSettings: async (s) => {
        try {
          const updated = await apiFetch("/settings", {
            method: "PUT",
            body: JSON.stringify(s)
          });
          setSettings((prev) => ({ ...prev, ...updated }));
          return null;
        } catch (err: any) {
          return err.message || "Failed to update settings";
        }
      },
      updatePins: async (pins) => {
        try {
          await apiFetch("/auth/update-pins", {
            method: "POST",
            body: JSON.stringify(pins)
          });
          return null;
        } catch (err: any) {
          return err.message || "Failed to update pins";
        } finally {
          setLoading(false);
        }
      },
      fetchNextOrdersPage: async () => {
        if (isFetchingOrders || !hasMoreOrders) return;
        setIsFetchingOrders(true);
        try {
          const nextPage = ordersPage + 1;
          const q = encodeURIComponent(ordersSearchQuery);
          const res = await apiFetch(`/orders?page=${nextPage}&limit=20&query=${q}`);
          setOrders((prev) => [...prev, ...res.data]);
          setOrdersPage(nextPage);
          setHasMoreOrders(res.hasMore);
        } catch (err) {
          console.error("Failed to fetch next orders page", err);
        } finally {
          setIsFetchingOrders(false);
        }
      },
      searchOrders: async (query: string) => {
        setOrdersSearchQuery(query);
        setIsFetchingOrders(true);
        try {
          const q = encodeURIComponent(query);
          const res = await apiFetch(`/orders?page=1&limit=20&query=${q}`);
          setOrders(res.data);
          setOrdersPage(1);
          setHasMoreOrders(res.hasMore);
        } catch (err) {
          console.error("Failed to search orders", err);
        } finally {
          setIsFetchingOrders(false);
        }
      },
      loadData,
    }),
    [menu, cart, orders, settings, loading, trends, ordersPage, hasMoreOrders, ordersSearchQuery, isFetchingOrders],
  );

  return <PosCtx.Provider value={value}>{children}</PosCtx.Provider>;
}

export function usePos() {
  const v = useContext(PosCtx);
  if (!v) throw new Error("usePos must be used within PosProvider");
  return v;
}

export function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
