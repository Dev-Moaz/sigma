// // app/(main)/admin/page.tsx
// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence, useInView } from "framer-motion";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faShieldHalved,
//   faArrowLeft,
//   faChartLine,
//   faClipboardList,
//   faWarehouse,
//   faSpinner,
//   faCheck,
//   faTimes,
//   faEdit,
//   faSave,
//   faDollarSign,
//   faBoxes,
//   faUsers,
//   faEye,
//   faChevronDown,
//   faPlus,
//   faChevronLeft,
//   faChevronRight
// } from "@fortawesome/free-solid-svg-icons";
// import { useTheme } from "@/store/useAppStore";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   checkAdminRoleAction,
//   fetchAdminOrdersAction,
//   updateOrderStatusAction,
//   fetchAdminInventoryAction,
//   updateProductStockAction,
//   addNewProductAction,
//   updateProductAction,
//   deleteProductAction
// } from "@/app/actions/admin";
// import { CinematicReveal } from "@/components/ui/CinematicReveal";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   Cell,
//   PieChart,
//   Pie
// } from "recharts";

// const METADATA_FIELDS_INFO = [
//   { key: "cpu", label: "CPU Model", type: "text", placeholder: "e.g. Intel Core i7-13700H" },
//   { key: "gpu", label: "GPU Model", type: "text", placeholder: "e.g. NVIDIA RTX 4060" },
//   { key: "ram_gb", label: "RAM (GB)", type: "number", placeholder: "16" },
//   { key: "storage_gb", label: "Storage (GB)", type: "number", placeholder: "512" },
//   { key: "screen_size", label: "Screen Size (inches)", type: "number", placeholder: "16" },
//   { key: "display_hz", label: "Refresh Rate (Hz)", type: "number", placeholder: "144" },
//   { key: "battery_hours", label: "Battery Life (hours)", type: "number", placeholder: "8" },
//   { key: "nvme_speed_gbs", label: "NVMe Speed (GB/s)", type: "number", placeholder: "7" },
//   { key: "vram_gb", label: "VRAM (GB)", type: "number", placeholder: "8" },
//   { key: "gpu_tdp_watts", label: "GPU TDP (Watts)", type: "number", placeholder: "140" },
//   { key: "gpu_memory_type", label: "GPU Memory Type", type: "text", placeholder: "e.g. GDDR6X" },
//   { key: "cpu_cores", label: "CPU Cores", type: "number", placeholder: "14" },
//   { key: "cpu_threads", label: "CPU Threads", type: "number", placeholder: "20" },
//   { key: "cpu_speed", label: "CPU Boost Speed (GHz)", type: "number", placeholder: "5.0" },
//   { key: "display_type", label: "Display Type", type: "text", placeholder: "e.g. IPS, OLED, Mini-LED" },
//   { key: "display_response_ms", label: "Response Time (ms)", type: "number", placeholder: "3" },
//   { key: "connectivity", label: "Connectivity (Comma-separated)", type: "array", placeholder: "Wi-Fi 6E, Bluetooth 5.2" }
// ];

// const HARDWARE_SCHEMAS: Record<string, Array<{ key: string; label: string; type: "text" | "number" | "boolean" | "select"; options?: string[]; placeholder?: string }>> = {
//   CPU: [
//     { key: "socket", label: "Socket", type: "text", placeholder: "AM5, LGA1700" },
//     { key: "cores", label: "Cores", type: "number", placeholder: "8" },
//     { key: "threads", label: "Threads", type: "number", placeholder: "16" },
//     { key: "baseClock", label: "Base Clock", type: "text", placeholder: "3.8 GHz" },
//     { key: "boostClock", label: "Boost Clock", type: "text", placeholder: "5.4 GHz" },
//     { key: "tdp", label: "TDP (Watts)", type: "number", placeholder: "65" },
//     { key: "integratedGraphics", label: "Integrated Graphics", type: "boolean" }
//   ],
//   GPU: [
//     { key: "chipset", label: "Chipset", type: "text", placeholder: "RTX 4090, RX 7900 XTX" },
//     { key: "vram", label: "VRAM", type: "text", placeholder: "24GB GDDR6X" },
//     { key: "coreClock", label: "Core Clock", type: "text", placeholder: "2.23 GHz" },
//     { key: "length", label: "Card Length (mm)", type: "number", placeholder: "304" },
//     { key: "tdp", label: "TDP (Watts)", type: "number", placeholder: "450" },
//     { key: "recommendedPSU", label: "Recommended PSU (Watts)", type: "number", placeholder: "850" }
//   ],
//   Motherboard: [
//     { key: "socket", label: "Socket", type: "text", placeholder: "AM5, LGA1700" },
//     { key: "formFactor", label: "Form Factor", type: "select", options: ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"] },
//     { key: "chipset", label: "Chipset", type: "text", placeholder: "B650, Z790" },
//     { key: "memorySlots", label: "Memory Slots", type: "number", placeholder: "4" },
//     { key: "maxMemory", label: "Max Memory Capacity", type: "text", placeholder: "128GB, 192GB" },
//     { key: "wifiIncluded", label: "Wi-Fi Included", type: "boolean" }
//   ],
//   RAM: [
//     { key: "type", label: "Memory Type", type: "select", options: ["DDR5", "DDR4"] },
//     { key: "capacity", label: "Capacity", type: "text", placeholder: "32GB (2x16GB)" },
//     { key: "speed", label: "Speed (MHz)", type: "number", placeholder: "6000" },
//     { key: "casLatency", label: "CAS Latency", type: "number", placeholder: "30" },
//     { key: "rgb", label: "RGB Lighting", type: "boolean" }
//   ],
//   Storage: [
//     { key: "storageType", label: "Storage Type", type: "select", options: ["NVMe", "SSD", "HDD"] },
//     { key: "capacity", label: "Capacity", type: "text", placeholder: "2TB, 1TB" },
//     { key: "interface", label: "Interface", type: "text", placeholder: "PCIe 4.0 x4, SATA III" },
//     { key: "formFactor", label: "Form Factor", type: "text", placeholder: "M.2 2280, 2.5 inch" },
//     { key: "readSpeed", label: "Read Speed", type: "text", placeholder: "7300 MB/s" },
//     { key: "writeSpeed", label: "Write Speed", type: "text", placeholder: "6000 MB/s" }
//   ],
//   Case: [
//     { key: "type", label: "Case Type", type: "select", options: ["Mid Tower", "Full Tower", "Mini Tower"] },
//     { key: "color", label: "Color", type: "text", placeholder: "Black, White, Gray" },
//     { key: "motherboardSupport", label: "Motherboard Support (Comma-separated)", type: "text", placeholder: "ATX, Micro-ATX, Mini-ITX" },
//     { key: "includedFans", label: "Included Fans", type: "number", placeholder: "3" },
//     { key: "sidePanel", label: "Side Panel Type", type: "select", options: ["Tempered Glass", "Mesh", "Solid"] }
//   ],
//   Monitor: [
//     { key: "size", label: "Display Size (inches)", type: "number", placeholder: "27" },
//     { key: "resolution", label: "Resolution", type: "text", placeholder: "2560 x 1440" },
//     { key: "refreshRate", label: "Refresh Rate (Hz)", type: "number", placeholder: "144" },
//     { key: "panelType", label: "Panel Type", type: "select", options: ["IPS", "VA", "OLED", "TN"] },
//     { key: "responseTime", label: "Response Time", type: "text", placeholder: "1ms" },
//     { key: "curved", label: "Curved Display", type: "boolean" }
//   ]
// };

// const DEFAULT_LAPTOP_FORM = {
//   name: "",
//   brand: "",
//   tagline: "Experience peak gaming performance.",
//   price: 1500,
//   original_price: 1800,
//   discount_price: 0,
//   category: "Gaming",
//   sub_category: "rtx-40-series",
//   stock: 10,
//   images: "",
//   description: "",
//   badge: "none",
//   is_deal: false,
//   is_new: false,
//   specs: JSON.stringify([
//     { "label": "CPU", "value": "Intel Core i7-13700H", "color": "cyan" },
//     { "label": "GPU", "value": "NVIDIA RTX 4060", "color": "green" },
//     { "label": "RAM", "value": "16GB DDR5", "color": "blue" }
//   ], null, 2),
//   technical_metadata: JSON.stringify({
//     "cpu_brand": "intel",
//     "gpu_brand": "nvidia",
//     "ram_gb": 16,
//     "storage_gb": 512
//   }, null, 2),
//   color_variants: JSON.stringify([
//     { "name": "Midnight Black", "hex": "#0a0a0a" }
//   ], null, 2)
// };

// const DEFAULT_HARDWARE_FORM = {
//   name: "",
//   brand: "",
//   tagline: "",
//   price: 350,
//   original_price: 0,
//   discount_price: 300,
//   category: "CPU",
//   sub_category: "",
//   stock: 15,
//   images: "",
//   description: "",
//   badge: "none",
//   is_deal: false,
//   is_new: true,
//   specs: JSON.stringify({
//     "socket": "AM5",
//     "cores": "8 Cores",
//     "threads": "16 Threads",
//     "baseClock": "3.8 GHz"
//   }, null, 2),
//   technical_metadata: "",
//   color_variants: "[]"
// };

// export default function AdminDashboard() {
//   const { t, isDark, toggleTheme } = useTheme();
//   const router = useRouter();

//   // Authentication & Access state
//   const [authChecking, setAuthChecking] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Active Tab: "analytics" | "orders" | "inventory"
//   const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory">("analytics");

//   // Core Data States
//   const [orders, setOrders] = useState<any[]>([]);
//   const [laptops, setLaptops] = useState<any[]>([]);
//   const [hardware, setHardware] = useState<any[]>([]);
//   const [loadingData, setLoadingData] = useState(false);

//   // UI Interactive States
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [inventoryType, setInventoryType] = useState<"laptop" | "hardware">("laptop");
//   const [editingStockId, setEditingStockId] = useState<string | null>(null);
//   const [tempStockValue, setTempStockValue] = useState<number>(0);
//   const [savingStock, setSavingStock] = useState(false);
//   const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState<string | null>(null);
  
//   // Custom Toast System State
//   const [toasts, setToasts] = useState<{ id: string; type: "success" | "error" | "info"; message: string }[]>([]);
  
//   // Custom Confirmation Modal State
//   const [confirmModal, setConfirmModal] = useState<{
//     isOpen: boolean;
//     title: string;
//     message: string;
//     onConfirm: () => void;
//   } | null>(null);

//   // Dropdown States
//   const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

//   // Pagination states (20 items per page)
//   const [ordersPage, setOrdersPage] = useState(1);
//   const [inventoryPage, setInventoryPage] = useState(1);
//   const ITEMS_PER_PAGE = 20;

//   // Search / Filter
//   const [orderSearchQuery, setOrderSearchQuery] = useState("");
//   const [inventorySearchQuery, setInventorySearchQuery] = useState("");

//   // Add Product Form States
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [addType, setAddType] = useState<"laptop" | "hardware">("laptop");
//   const [submittingProduct, setSubmittingProduct] = useState(false);
//   const [formData, setFormData] = useState<any>(DEFAULT_LAPTOP_FORM);

//   // Show Toast Helper
//   const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
//     const id = Math.random().toString(36).substring(2);
//     setToasts(prev => [...prev, { id, type, message }]);
//     setTimeout(() => {
//       setToasts(prev => prev.filter(t => t.id !== id));
//     }, 4000);
//   };

//   // JSON Validation States
//   const [isSpecsValid, setIsSpecsValid] = useState(true);
//   const [isMetadataValid, setIsMetadataValid] = useState(true);
//   const [isColorsValid, setIsColorsValid] = useState(true);

//   // Builder mode states
//   const [specsEditorMode, setSpecsEditorMode] = useState<"visual" | "json">("visual");
//   const [metadataEditorMode, setMetadataEditorMode] = useState<"visual" | "json">("visual");

//   // Track product editing state
//   const [editingProductId, setEditingProductId] = useState<string | null>(null);

//   // Validate JSON blocks in real-time
//   useEffect(() => {
//     try {
//       if (!formData.specs.trim()) {
//         setIsSpecsValid(true);
//       } else {
//         JSON.parse(formData.specs);
//         setIsSpecsValid(true);
//       }
//     } catch {
//       setIsSpecsValid(false);
//     }
//   }, [formData.specs]);

//   useEffect(() => {
//     try {
//       if (!formData.technical_metadata.trim()) {
//         setIsMetadataValid(true);
//       } else {
//         JSON.parse(formData.technical_metadata);
//         setIsMetadataValid(true);
//       }
//     } catch {
//       setIsMetadataValid(false);
//     }
//   }, [formData.technical_metadata]);

//   useEffect(() => {
//     try {
//       if (!formData.color_variants.trim()) {
//         setIsColorsValid(true);
//       } else {
//         JSON.parse(formData.color_variants);
//         setIsColorsValid(true);
//       }
//     } catch {
//       setIsColorsValid(false);
//     }
//   }, [formData.color_variants]);

//   const isFormJsonValid = isSpecsValid && isMetadataValid && isColorsValid;

//   // Close active dropdowns on click outside
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (openDropdownId && !(e.target as Element).closest(".status-dropdown-container")) {
//         setOpenDropdownId(null);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openDropdownId]);

//   // Reset pages on search query or inventory type toggles
//   useEffect(() => {
//     setOrdersPage(1);
//   }, [orderSearchQuery]);

//   useEffect(() => {
//     setInventoryPage(1);
//   }, [inventorySearchQuery, inventoryType]);

//   // Visual Builder State Helpers
//   const getParsedSpecs = () => {
//     try {
//       const parsed = JSON.parse(formData.specs);
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   };

//   const updateParsedSpecs = (newSpecs: any[]) => {
//     setFormData((prev: any) => ({
//       ...prev,
//       specs: JSON.stringify(newSpecs, null, 2)
//     }));
//   };

//   const getParsedMetadata = () => {
//     try {
//       const parsed = JSON.parse(formData.technical_metadata);
//       return typeof parsed === "object" && parsed !== null ? parsed : {};
//     } catch {
//       return {};
//     }
//   };

//   const updateParsedMetadata = (newMetadata: any) => {
//     setFormData((prev: any) => ({
//       ...prev,
//       technical_metadata: JSON.stringify(newMetadata, null, 2)
//     }));
//   };

//   const getParsedHardwareSpecs = () => {
//     try {
//       const parsed = JSON.parse(formData.specs);
//       return typeof parsed === "object" && parsed !== null ? parsed : {};
//     } catch {
//       return {};
//     }
//   };

//   const updateParsedHardwareSpecs = (newSpecs: any) => {
//     setFormData((prev: any) => ({
//       ...prev,
//       specs: JSON.stringify(newSpecs, null, 2)
//     }));
//   };

//   // 1. Check permissions on mount
//   useEffect(() => {
//     async function checkAccess() {
//       try {
//         const res = await checkAdminRoleAction();
//         setIsAdmin(res.isAdmin);
//       } catch (err) {
//         setIsAdmin(false);
//       } finally {
//         setAuthChecking(false);
//       }
//     }
//     checkAccess();
//   }, []);

//   // 2. Fetch Data if authorized
//   useEffect(() => {
//     if (!isAdmin) return;

//     async function loadAdminData() {
//       setLoadingData(true);
//       try {
//         const [ordersRes, inventoryRes] = await Promise.all([
//           fetchAdminOrdersAction(),
//           fetchAdminInventoryAction()
//         ]);

//         if (ordersRes.success && ordersRes.orders) {
//           setOrders(ordersRes.orders);
//         }
//         if (inventoryRes.success) {
//           setLaptops(inventoryRes.laptops || []);
//           setHardware(inventoryRes.hardware || []);
//         }
//       } catch (err) {
//         console.error("Error loading admin dashboard data:", err);
//       } finally {
//         setLoadingData(false);
//       }
//     }

//     loadAdminData();
//   }, [isAdmin]);

//   // 3. Auto-populate Form Defaults on Switch Type
//   useEffect(() => {
//     if (editingProductId !== null) return;
//     if (addType === "laptop") {
//       setFormData(DEFAULT_LAPTOP_FORM);
//     } else {
//       setFormData(DEFAULT_HARDWARE_FORM);
//     }
//   }, [addType, editingProductId]);

//   // Actions
//   const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
//     setUpdatingOrderStatusId(orderId);
//     try {
//       const res = await updateOrderStatusAction(orderId, nextStatus);
//       if (res.success) {
//         setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
//         if (selectedOrder?.id === orderId) {
//           setSelectedOrder((prev: any) => prev ? { ...prev, status: nextStatus } : null);
//         }
//         showToast("Fulfillment status synced successfully.", "success");
//       } else {
//         showToast(res.error || "Failed to update order status.", "error");
//       }
//     } catch (err) {
//       showToast("Network protocol failure during status sync.", "error");
//     } finally {
//       setUpdatingOrderStatusId(null);
//     }
//   };

//   const handleUpdateStock = async (id: string, type: "laptop" | "hardware", newStock: number) => {
//     setSavingStock(true);
//     try {
//       const res = await updateProductStockAction(id, type, newStock);
//       if (res.success) {
//         if (type === "laptop") {
//           setLaptops(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
//         } else {
//           setHardware(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
//         }
//         setEditingStockId(null);
//         showToast("Fulfillment stock units successfully updated.", "success");
//       } else {
//         showToast(res.error || "Failed to update stock matrix.", "error");
//       }
//     } catch (err) {
//       showToast("Stock modification network error.", "error");
//     } finally {
//       setSavingStock(false);
//     }
//   };

//   const handleDeleteProduct = (id: string, type: "laptop" | "hardware") => {
//     setConfirmModal({
//       isOpen: true,
//       title: "Decommission Product Matrix",
//       message: "Are you sure you want to permanently decommission this product from live database nodes? This operation is irreversible.",
//       onConfirm: async () => {
//         setConfirmModal(null);
//         try {
//           const res = await deleteProductAction(id, type);
//           if (res.success) {
//             showToast("Product successfully purged from mainframe.", "success");
//             if (type === "laptop") {
//               setLaptops(prev => prev.filter(p => p.id !== id));
//             } else {
//               setHardware(prev => prev.filter(p => p.id !== id));
//             }
//           } else {
//             showToast(res.error || "Decommission protocol failed.", "error");
//           }
//         } catch (err) {
//           showToast("Network disconnection halted purge protocol.", "error");
//         }
//       }
//     });
//   };

//   const handleStartEditProduct = (item: any, type: "laptop" | "hardware") => {
//     setAddType(type);
//     setEditingProductId(item.id);
    
//     // Normalize fields
//     const imagesStr = Array.isArray(item.images) ? item.images.join(", ") : (item.images || "");
//     const specsStr = typeof item.specs === "object" ? JSON.stringify(item.specs, null, 2) : (item.specs || "");
//     const metadataStr = typeof item.technical_metadata === "object" ? JSON.stringify(item.technical_metadata, null, 2) : (item.technical_metadata || "");
//     const colorsStr = typeof item.color_variants === "object" ? JSON.stringify(item.color_variants, null, 2) : (item.color_variants || "[]");
    
//     setFormData({
//       name: item.name || "",
//       brand: item.brand || "",
//       tagline: item.tagline || "",
//       price: item.price || 0,
//       original_price: item.original_price || 0,
//       discount_price: item.discount_price || 0,
//       category: item.category || "",
//       sub_category: item.sub_category || "",
//       stock: item.stock || 0,
//       images: imagesStr,
//       description: item.description || "",
//       badge: item.badge || "none",
//       is_deal: !!item.is_deal,
//       is_new: !!item.is_new,
//       specs: specsStr,
//       technical_metadata: metadataStr,
//       color_variants: colorsStr
//     });
    
//     setIsAddModalOpen(true);
//   };

//   const handleAddProductSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isFormJsonValid) {
//       showToast("Please resolve JSON schema validation errors first.", "error");
//       return;
//     }
//     setSubmittingProduct(true);
//     try {
//       const payload: any = {
//         name: formData.name,
//         brand: formData.brand,
//         price: Number(formData.price),
//         stock: Number(formData.stock),
//         images: formData.images,
//         description: formData.description,
//         is_deal: formData.is_deal,
//         category: formData.category,
//         specs: formData.specs
//       };

//       if (addType === "laptop") {
//         payload.tagline = formData.tagline;
//         payload.original_price = Number(formData.original_price || formData.price);
//         payload.sub_category = formData.sub_category;
//         payload.badge = formData.badge;
//         payload.technical_metadata = formData.technical_metadata;
//         payload.color_variants = formData.color_variants;
//         payload.features = []; 
//       } else {
//         payload.discount_price = Number(formData.discount_price || 0);
//         payload.is_new = formData.is_new;
//       }

//       if (editingProductId) {
//         // Update Flow
//         const res = await updateProductAction(editingProductId, addType, payload);
//         if (res.success && res.data) {
//           showToast("Product structural metadata updated successfully.", "success");
//           if (addType === "laptop") {
//             setLaptops(prev => prev.map(p => p.id === editingProductId ? res.data : p));
//           } else {
//             setHardware(prev => prev.map(p => p.id === editingProductId ? res.data : p));
//           }
//           setIsAddModalOpen(false);
//           setEditingProductId(null);
//         } else {
//           showToast(res.error || "Failed to update product node.", "error");
//         }
//       } else {
//         // Add Flow
//         const res = await addNewProductAction(addType, payload);
//         if (res.success && res.data) {
//           showToast("New product successfully cataloged to cloud matrix.", "success");
//           if (addType === "laptop") {
//             setLaptops(prev => [res.data, ...prev]);
//           } else {
//             setHardware(prev => [res.data, ...prev]);
//           }
//           setIsAddModalOpen(false);
//         } else {
//           showToast(res.error || "Failed to catalog new product.", "error");
//         }
//       }
//     } catch (err) {
//       showToast("Fatal error during submission sequence.", "error");
//     } finally {
//       setSubmittingProduct(false);
//     }
//   };

//   // Calculations for Analytics
//   const totalRevenue = orders
//     .filter(o => o.status === "delivered" || o.status === "Delivered")
//     .reduce((sum, o) => sum + o.total_amount, 0);

//   const activeUsersCount = Array.from(new Set(orders.map(o => o.customer_email))).length;

//   const lowStockItemsCount = [...laptops, ...hardware].filter(item => item.stock < 5).length;

//   // Real-time chronological sales aggregation for AreaChart
//   const getSalesTimelineData = () => {
//     const dailyMap: { [date: string]: { date: string; revenue: number; ordersCount: number } } = {};
//     const sortedOrders = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
//     sortedOrders.forEach(o => {
//       const dateStr = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
//       const amount = (o.status.toLowerCase() === "delivered" || o.status.toLowerCase() === "processing" || o.status.toLowerCase() === "shipped") ? o.total_amount : 0;
      
//       if (dailyMap[dateStr]) {
//         dailyMap[dateStr].revenue += amount;
//         dailyMap[dateStr].ordersCount += 1;
//       } else {
//         dailyMap[dateStr] = {
//           date: dateStr,
//           revenue: amount,
//           ordersCount: 1
//         };
//       }
//     });
    
//     return Object.values(dailyMap).slice(-7);
//   };

//   // Real-time composition data — breaks down inventory by actual product categories
//   const getStockCompositionData = () => {
//     const categoryMap: { [key: string]: number } = {};
    
//     laptops.forEach(l => {
//       const cat = l.category || "Uncategorized";
//       categoryMap[cat] = (categoryMap[cat] || 0) + 1;
//     });
    
//     hardware.forEach(h => {
//       const cat = h.category || "Uncategorized";
//       categoryMap[cat] = (categoryMap[cat] || 0) + 1;
//     });
    
//     return Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
//   };

//   // Color palette for BarChart cells
//   const CHART_COLORS = ["#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#ec4899", "#14b8a6"];

//   // Input Field Styles Generator
//   const getFieldStyle = () => ({
//     backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
//     borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
//     color: t.text
//   });

//   // ----------------------------------------------------
//   // 1. RENDER LOADING STATE
//   // ----------------------------------------------------
//   if (authChecking) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: t.bg }}>
//         <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: t.accentText, borderTopColor: "transparent" }} />
//         <p className="hf text-lg font-bold tracking-wider animate-pulse" style={{ color: t.text }}>SECURE SHIELD LINKING...</p>
//       </div>
//     );
//   }

//   // ----------------------------------------------------
//   // 2. RENDER ACCESS DENIED
//   // ----------------------------------------------------
//   if (!isAdmin) {
//     return (
//       <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: t.bg }}>
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#ef4444" }} />
        
//         <CinematicReveal>
//           <div className="max-w-md w-full text-center border p-8 rounded-3xl backdrop-blur-xl relative z-10" style={{ background: t.cardBg, borderColor: "rgba(239, 68, 68, 0.2)" }}>
//             <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-red-500/10" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
//               <FontAwesomeIcon icon={faShieldHalved} />
//             </div>
            
//             <h1 className="hf text-2xl font-extrabold tracking-wider mb-3 uppercase" style={{ color: "#ef4444" }}>RESTRICTED SECTOR</h1>
//             <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: t.textSecondary }}>
//               This domain is secured with role-based firewall settings. Unauthorized attempts are logged. 
//               Please contact the systems administrator if this is an error.
//             </p>

//             <button 
//               onClick={() => router.push("/")}
//               className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02]"
//               style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text }}
//             >
//               <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Return to Sanctuary
//             </button>
//           </div>
//         </CinematicReveal>
//       </div>
//     );
//   }

//   // ----------------------------------------------------
//   // 3. RENDER MAIN ADMIN DASHBOARD
//   // ----------------------------------------------------
//   return (
//     <div 
//       className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8 relative transition-all duration-300 ${
//         isAddModalOpen ? "z-[100]" : "z-10"
//       }`} 
//       style={{ background: t.bg }}
//     >
      
//       {/* Header */}
//       <CinematicReveal delay={0.1}>
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: t.borderLight }}>
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ background: `${t.accentText}15`, color: t.accentText }}>
//                 SYSTEM ROOT ACCESS
//               </span>
//             </div>
//             <h1 className="hf text-3xl font-extrabold tracking-tight" style={{ color: t.text }}>Sigma Command Center</h1>
//             <p className="text-xs font-semibold mt-1" style={{ color: t.textSecondary }}>Manage live inventory, fulfill checkout requests, and monitor matrix metrics.</p>
//           </div>
          
//           {/* Navigation Tabs */}
//           <div className="flex p-1.5 rounded-xl border backdrop-blur-md self-start md:self-center" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//             <button
//               onClick={() => setActiveTab("analytics")}
//               className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
//               style={{
//                 background: activeTab === "analytics" ? t.accentText : "transparent",
//                 color: activeTab === "analytics" ? "#fff" : t.textSecondary
//               }}
//             >
//               <FontAwesomeIcon icon={faChartLine} /> Analytics
//             </button>
//             <button
//               onClick={() => setActiveTab("orders")}
//               className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
//               style={{
//                 background: activeTab === "orders" ? t.accentText : "transparent",
//                 color: activeTab === "orders" ? "#fff" : t.textSecondary
//               }}
//             >
//               <FontAwesomeIcon icon={faClipboardList} /> Orders HUD
//             </button>
//             <button
//               onClick={() => setActiveTab("inventory")}
//               className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
//               style={{
//                 background: activeTab === "inventory" ? t.accentText : "transparent",
//                 color: activeTab === "inventory" ? "#fff" : t.textSecondary
//               }}
//             >
//               <FontAwesomeIcon icon={faWarehouse} /> Inventory
//             </button>
//           </div>
//         </div>
//       </CinematicReveal>

//       {/* Global Data Fetch Loading Indicator */}
//       {loadingData && (
//         <div className="flex items-center justify-center p-8 rounded-3xl border border-dashed animate-pulse" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//           <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg mr-3" style={{ color: t.accentText }} />
//           <span className="text-xs font-bold tracking-widest uppercase" style={{ color: t.textSecondary }}>SYNCING LIVE MATRIX DATA...</span>
//         </div>
//       )}

//       {!loadingData && (
//         <AnimatePresence mode="wait">
//           {/* TAB 1: ANALYTICS */}
//           {activeTab === "analytics" && (
//             <motion.div
//               key="analytics"
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -15 }}
//               transition={{ duration: 0.4 }}
//               className="grid grid-cols-1 md:grid-cols-4 gap-6"
//             >
//               {/* Stat Cards */}
//               <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
//                 {[
//                   { label: "Total Matrix Revenue", value: `$${totalRevenue.toLocaleString()}`, desc: "From completed orders", icon: faDollarSign, color: "#10b981" },
//                   { label: "Active Orders", value: orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length.toString(), desc: "Needs fulfillment", icon: faClipboardList, color: "#3b82f6" },
//                   { label: "Matrix Users", value: activeUsersCount.toString(), desc: "Unique buyer accounts", icon: faUsers, color: "#a855f7" },
//                   { label: "Critical Stock Warning", value: lowStockItemsCount.toString(), desc: "Products under 5 units", icon: faBoxes, color: "#f59e0b" }
//                 ].map((stat, i) => (
//                   <div key={i} className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>{stat.label}</p>
//                         <h3 className="hf text-2xl font-extrabold" style={{ color: t.text }}>{stat.value}</h3>
//                       </div>
//                       <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
//                         <FontAwesomeIcon icon={stat.icon} />
//                       </div>
//                     </div>
//                     <p className="text-[11px] font-semibold" style={{ color: t.textSecondary }}>{stat.desc}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Dynamic Revenue Trend Area Chart */}
//               <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col min-h-[320px]" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <div className="mb-4">
//                   <h3 className="hf text-sm font-black uppercase tracking-wider" style={{ color: t.text }}>Fulfillment Revenue Trend</h3>
//                   <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Chronological sales history for the last 7 active transaction days</p>
//                 </div>
//                 <div className="flex-grow w-full h-[220px]">
//                   {getSalesTimelineData().length === 0 ? (
//                     <div className="flex items-center justify-center h-full">
//                       <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>No transaction data available yet. Charts will populate from live orders.</p>
//                     </div>
//                   ) : (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={getSalesTimelineData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <defs>
//                           <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
//                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
//                         <XAxis dataKey="date" stroke={t.textSecondary} fontSize={10} tickLine={false} />
//                         <YAxis stroke={t.textSecondary} fontSize={10} tickLine={false} />
//                         <Tooltip 
//                           contentStyle={{
//                             backgroundColor: isDark ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
//                             borderColor: t.borderLight,
//                             borderRadius: "12px",
//                             fontSize: "10px",
//                             fontFamily: "inherit"
//                           }}
//                         />
//                         <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   )}
//                 </div>
//               </div>

//               {/* Catalog Composition Bar Chart */}
//               <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col min-h-[320px]" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <div className="mb-4">
//                   <h3 className="hf text-sm font-black uppercase tracking-wider" style={{ color: t.text }}>Catalog Composition</h3>
//                   <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Ratio of laptops to hardware component inventory records</p>
//                 </div>
//                 <div className="flex-grow w-full h-[220px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={getStockCompositionData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
//                       <XAxis dataKey="name" stroke={t.textSecondary} fontSize={10} tickLine={false} />
//                       <YAxis stroke={t.textSecondary} fontSize={10} tickLine={false} />
//                       <Tooltip 
//                         contentStyle={{
//                           backgroundColor: isDark ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
//                           borderColor: t.borderLight,
//                           borderRadius: "12px",
//                           fontSize: "10px",
//                           fontFamily: "inherit"
//                         }}
//                       />
//                       <Bar dataKey="count" name="Item Count" radius={[6, 6, 0, 0]}>
//                         {getStockCompositionData().map((entry, idx) => (
//                           <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Status breakdown & recent logs */}
//               <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <h3 className="hf text-lg font-bold mb-4" style={{ color: t.text }}>Order Dispatch Matrix</h3>
//                 <div className="flex flex-col gap-3 flex-grow justify-center">
//                   {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => {
//                     const count = orders.filter(o => o.status.toLowerCase() === status).length;
//                     const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    
//                     let barColor = t.accentText;
//                     if (status === "delivered") barColor = "#10b981";
//                     if (status === "cancelled") barColor = "#ef4444";
//                     if (status === "processing") barColor = "#f59e0b";
//                     if (status === "shipped") barColor = "#06b6d4";

//                     return (
//                       <div key={status} className="flex flex-col gap-1.5">
//                         <div className="flex justify-between text-xs font-bold uppercase">
//                           <span style={{ color: t.textSecondary }}>{status}</span>
//                           <span style={{ color: t.text }}>{count} ({Math.round(pct)}%)</span>
//                         </div>
//                         <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
//                           <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: barColor }} />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Analytics Inventory Warning */}
//               <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <h3 className="hf text-lg font-bold mb-4" style={{ color: t.text }}>Inventory Depot Status</h3>
//                 <div className="max-h-[220px] overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
//                   {[...laptops, ...hardware].filter(item => item.stock < 5).map(item => (
//                     <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: t.borderLight, background: t.bgSecondary }}>
//                       <div>
//                         <p className="text-xs font-bold" style={{ color: t.text }}>{item.name}</p>
//                         <p className="text-[10px] font-semibold" style={{ color: t.textSubtle }}>Brand: {item.brand}</p>
//                       </div>
//                       <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase" style={{ background: item.stock === 0 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: item.stock === 0 ? "#ef4444" : "#f59e0b" }}>
//                         {item.stock === 0 ? "Out of Stock" : `${item.stock} Units`}
//                       </span>
//                     </div>
//                   ))}
//                   {[...laptops, ...hardware].filter(item => item.stock < 5).length === 0 && (
//                     <div className="text-center py-10">
//                       <FontAwesomeIcon icon={faCheck} className="text-2xl mb-2" style={{ color: "#10b981" }} />
//                       <p className="text-xs font-bold" style={{ color: t.textSecondary }}>Depot storage levels operating at optimum capacity.</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* TAB 2: ORDERS HUD */}
//           {activeTab === "orders" && (
//             <motion.div
//               key="orders"
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -15 }}
//               className="flex flex-col gap-6"
//             >
//               {/* Order Filtering Bar */}
//               <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//                 <input
//                   type="text"
//                   placeholder="Search orders by customer name, email or tracking..."
//                   value={orderSearchQuery}
//                   onChange={e => setOrderSearchQuery(e.target.value)}
//                   className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
//                   style={{
//                     background: t.cardBg,
//                     borderColor: t.borderLight,
//                     color: t.text,
//                   }}
//                 />
//               </div>

//               {/* Orders Table Layout */}
//               <div className="border rounded-2xl overflow-hidden backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse text-left">
//                     <thead>
//                       <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
//                         <th className="py-4 px-6">Tracking ID</th>
//                         <th className="py-4 px-6">Customer</th>
//                         <th className="py-4 px-6">Date</th>
//                         <th className="py-4 px-6">Total Amount</th>
//                         <th className="py-4 px-6">Status</th>
//                         <th className="py-4 px-6 text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
//                       {(() => {
//                         const filtered = orders.filter(o => 
//                           o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
//                           o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
//                           o.tracking_number.toLowerCase().includes(orderSearchQuery.toLowerCase())
//                         );
//                         const sliced = filtered.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);

//                         if (sliced.length === 0) {
//                           return (
//                             <tr>
//                               <td colSpan={6} className="py-8 text-center text-xs font-semibold" style={{ color: t.textSecondary }}>
//                                 No order logs match the search query.
//                               </td>
//                             </tr>
//                           );
//                         }

//                         return sliced.map(order => {
//                           let badgeBg = "rgba(168,85,247,0.1)";
//                           let badgeText = "#a855f7";
//                           if (order.status.toLowerCase() === "pending") { badgeBg = "rgba(148,163,184,0.1)"; badgeText = "#94a3b8"; }
//                           else if (order.status.toLowerCase() === "processing") { badgeBg = "rgba(245,158,11,0.1)"; badgeText = "#f59e0b"; }
//                           else if (order.status.toLowerCase() === "shipped") { badgeBg = "rgba(6,182,212,0.1)"; badgeText = "#06b6d4"; }
//                           else if (order.status.toLowerCase() === "delivered") { badgeBg = "rgba(16,185,129,0.1)"; badgeText = "#10b981"; }
//                           else if (order.status.toLowerCase() === "cancelled") { badgeBg = "rgba(239,68,68,0.1)"; badgeText = "#ef4444"; }

//                           return (
//                             <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
//                               <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{order.tracking_number}</td>
//                               <td className="py-4 px-6">
//                                 <p className="font-bold" style={{ color: t.text }}>{order.customer_name}</p>
//                                 <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>{order.customer_email}</p>
//                               </td>
//                               <td className="py-4 px-6" style={{ color: t.textSecondary }}>
//                                 {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                               </td>
//                               <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${order.total_amount.toLocaleString()}</td>
//                               <td className="py-4 px-6">
//                                 <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: badgeBg, color: badgeText }}>
//                                   {order.status}
//                                 </span>
//                               </td>
//                               <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
//                                 <button 
//                                   onClick={() => setSelectedOrder(order)}
//                                   className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
//                                   style={{ borderColor: t.borderLight, color: t.text }}
//                                 >
//                                   <FontAwesomeIcon icon={faEye} />
//                                 </button>
                                
//                                 <div className="relative status-dropdown-container">
//                                   <button 
//                                     onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
//                                     className="px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-[10px] uppercase"
//                                     style={{ borderColor: t.borderLight, color: t.textSecondary }}
//                                   >
//                                     Status <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
//                                   </button>
                                  
//                                   {/* Dropdown Menu */}
//                                   <div className={`absolute right-0 mt-1 w-32 rounded-xl border shadow-xl z-25 ${openDropdownId === order.id ? "block" : "hidden"}`} style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                                     {["pending", "processing", "shipped", "delivered", "cancelled"].map(st => (
//                                       <button
//                                         key={st}
//                                         onClick={() => {
//                                           handleUpdateOrderStatus(order.id, st);
//                                           setOpenDropdownId(null);
//                                         }}
//                                         className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5"
//                                         style={{ color: order.status === st ? t.accentText : t.textSecondary }}
//                                       >
//                                         {st}
//                                       </button>
//                                     ))}
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         });
//                       })()}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Order Pagination Buttons */}
//               {(() => {
//                 const filtered = orders.filter(o => 
//                   o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
//                   o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
//                   o.tracking_number.toLowerCase().includes(orderSearchQuery.toLowerCase())
//                 );
//                 const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//                 if (totalPages <= 1) return null;

//                 return (
//                   <div className="flex justify-center items-center gap-3 mt-4">
//                     <button
//                       onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
//                       disabled={ordersPage === 1}
//                       className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
//                       style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
//                     >
//                       <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
//                     </button>

//                     <div className="flex gap-1.5">
//                       {Array.from({ length: totalPages }).map((_, i) => {
//                         const pageNum = i + 1;
//                         const isActive = pageNum === ordersPage;
//                         return (
//                           <button
//                             key={pageNum}
//                             onClick={() => setOrdersPage(pageNum)}
//                             className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
//                             style={{
//                               background: isActive ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : t.cardBg,
//                               border: `1px solid ${isActive ? "transparent" : t.borderLight}`,
//                               color: isActive ? "#fff" : t.textSecondary,
//                               boxShadow: isActive ? "0 4px 10px rgba(6,182,212,0.2)" : "none"
//                             }}
//                           >
//                             {pageNum}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <button
//                       onClick={() => setOrdersPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={ordersPage === totalPages}
//                       className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
//                       style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
//                     >
//                       <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
//                     </button>
//                   </div>
//                 );
//               })()}
//             </motion.div>
//           )}

//           {/* TAB 3: INVENTORY */}
//           {activeTab === "inventory" && (
//             <motion.div
//               key="inventory"
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -15 }}
//               className="flex flex-col gap-6"
//             >
//               {/* Filter & Subtabs */}
//               <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//                 <div className="flex p-1 rounded-xl border" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                   <button 
//                     onClick={() => setInventoryType("laptop")}
//                     className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
//                     style={{
//                       background: inventoryType === "laptop" ? t.accentText : "transparent",
//                       color: inventoryType === "laptop" ? "#fff" : t.textSecondary
//                     }}
//                   >
//                     Laptops
//                   </button>
//                   <button 
//                     onClick={() => setInventoryType("hardware")}
//                     className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
//                     style={{
//                       background: inventoryType === "hardware" ? t.accentText : "transparent",
//                       color: inventoryType === "hardware" ? "#fff" : t.textSecondary
//                     }}
//                   >
//                     Hardware Components
//                   </button>
//                 </div>

//                 <button
//                   onClick={() => {
//                     setEditingProductId(null);
//                     setFormData(inventoryType === "laptop" ? DEFAULT_LAPTOP_FORM : DEFAULT_HARDWARE_FORM);
//                     setIsAddModalOpen(true);
//                   }}
//                   className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 self-start sm:self-auto shadow-lg"
//                   style={{ background: t.accentText, color: "#fff", boxShadow: `0 4px 20px ${t.accentText}40` }}
//                 >
//                   <FontAwesomeIcon icon={faPlus} /> Add New Product
//                 </button>

//                 <input
//                   type="text"
//                   placeholder="Search products by name or brand..."
//                   value={inventorySearchQuery}
//                   onChange={e => setInventorySearchQuery(e.target.value)}
//                   className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
//                   style={{
//                     background: t.cardBg,
//                     borderColor: t.borderLight,
//                     color: t.text,
//                   }}
//                 />
//               </div>

//               {/* Inventory Table */}
//               <div className="border rounded-2xl overflow-hidden backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse text-left">
//                     <thead>
//                       <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
//                         <th className="py-4 px-6">Product ID</th>
//                         <th className="py-4 px-6">Product details</th>
//                         <th className="py-4 px-6">Brand</th>
//                         <th className="py-4 px-6">Price</th>
//                         <th className="py-4 px-6">Stock Status</th>
//                         <th className="py-4 px-6 text-center">Fulfillment Stock</th>
//                         <th className="py-4 px-6 text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
//                       {(() => {
//                         const items = inventoryType === "laptop" ? laptops : hardware;
//                         const filtered = items.filter(item => 
//                           item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
//                           item.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase())
//                         );
//                         const sliced = filtered.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE);

//                         if (sliced.length === 0) {
//                           return (
//                             <tr>
//                               <td colSpan={7} className="py-8 text-center text-xs font-semibold" style={{ color: t.textSecondary }}>
//                                 No products cataloged in this matrix coordinate.
//                               </td>
//                             </tr>
//                           );
//                         }

//                         return sliced.map(item => {
//                           const isLow = item.stock < 5 && item.stock > 0;
//                           const isOut = item.stock === 0;

//                           return (
//                             <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
//                               <td className="py-4 px-6 font-mono font-bold" style={{ color: t.textSecondary }}>{item.id}</td>
//                               <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{item.name}</td>
//                               <td className="py-4 px-6" style={{ color: t.textSecondary }}>{item.brand}</td>
//                               <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${item.price.toLocaleString()}</td>
//                               <td className="py-4 px-6">
//                                 <span 
//                                   className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
//                                   style={{ 
//                                     background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
//                                     color: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981"
//                                   }}
//                                 >
//                                   {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
//                                 </span>
//                               </td>
//                               <td className="py-4 px-6 text-center">
//                                 {editingStockId === item.id ? (
//                                   <div className="flex items-center justify-center gap-2">
//                                     <input 
//                                       type="number"
//                                       value={tempStockValue}
//                                       onChange={e => setTempStockValue(parseInt(e.target.value) || 0)}
//                                       className="w-16 px-2 py-1 rounded border text-center font-bold bg-black/40 text-white"
//                                       style={{ borderColor: t.borderLight }}
//                                     />
//                                     <button 
//                                       onClick={() => handleUpdateStock(item.id, inventoryType, tempStockValue)}
//                                       className="w-7 h-7 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center transition-all"
//                                       disabled={savingStock}
//                                     >
//                                       {savingStock ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
//                                     </button>
//                                     <button 
//                                       onClick={() => setEditingStockId(null)}
//                                       className="w-7 h-7 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-all"
//                                     >
//                                       <FontAwesomeIcon icon={faTimes} />
//                                     </button>
//                                   </div>
//                                 ) : (
//                                   <button 
//                                     onClick={() => {
//                                       setEditingStockId(item.id);
//                                       setTempStockValue(item.stock);
//                                     }}
//                                     className="px-3 py-1.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all text-[10px] mx-auto hover:bg-white/5"
//                                     style={{ borderColor: t.borderLight, color: t.textSecondary }}
//                                   >
//                                     <FontAwesomeIcon icon={faEdit} className="text-[10px]" /> {item.stock} Units
//                                   </button>
//                                 )}
//                               </td>
//                               <td className="py-4 px-6 text-right">
//                                 <div className="flex justify-end gap-2">
//                                   <button
//                                     onClick={() => handleStartEditProduct(item, inventoryType)}
//                                     className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95"
//                                   >
//                                     <FontAwesomeIcon icon={faEdit} /> Edit Details
//                                   </button>
//                                   <button
//                                     onClick={() => handleDeleteProduct(item.id, inventoryType)}
//                                     className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95"
//                                   >
//                                     <FontAwesomeIcon icon={faTimes} /> Delete
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         });
//                       })()}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Inventory Pagination Controls */}
//               {(() => {
//                 const items = inventoryType === "laptop" ? laptops : hardware;
//                 const filtered = items.filter(item => 
//                   item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
//                   item.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase())
//                 );
//                 const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//                 if (totalPages <= 1) return null;

//                 return (
//                   <div className="flex justify-center items-center gap-3 mt-4">
//                     <button
//                       onClick={() => setInventoryPage(prev => Math.max(prev - 1, 1))}
//                       disabled={inventoryPage === 1}
//                       className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
//                       style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
//                     >
//                       <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
//                     </button>

//                     <div className="flex gap-1.5">
//                       {Array.from({ length: totalPages }).map((_, i) => {
//                         const pageNum = i + 1;
//                         const isActive = pageNum === inventoryPage;
//                         return (
//                           <button
//                             key={pageNum}
//                             onClick={() => setInventoryPage(pageNum)}
//                             className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
//                             style={{
//                               background: isActive ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : t.cardBg,
//                               border: `1px solid ${isActive ? "transparent" : t.borderLight}`,
//                               color: isActive ? "#fff" : t.textSecondary,
//                               boxShadow: isActive ? "0 4px 10px rgba(6,182,212,0.2)" : "none"
//                             }}
//                           >
//                             {pageNum}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <button
//                       onClick={() => setInventoryPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={inventoryPage === totalPages}
//                       className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
//                       style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
//                     >
//                       <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
//                     </button>
//                   </div>
//                 );
//               })()}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       )}

//       {/* DETAIL MODAL FOR ORDER DETAIL VIEW */}
//       <AnimatePresence>
//         {selectedOrder && (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//           >
//             <motion.div 
//               initial={{ scale: 0.95, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.95, y: 20 }}
//               className="max-w-2xl w-full rounded-3xl border p-6 sm:p-8 backdrop-blur-xl max-h-[90vh] overflow-y-auto flex flex-col gap-6"
//               style={{ background: t.cardBg, borderColor: t.borderLight }}
//             >
//               {/* Header */}
//               <div className="flex justify-between items-start">
//                 <div>
//                   <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>Order Detail View</span>
//                   <h3 className="hf text-xl font-extrabold" style={{ color: t.text }}>{selectedOrder.tracking_number}</h3>
//                 </div>
//                 <button 
//                   onClick={() => setSelectedOrder(null)}
//                   className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:bg-white/5"
//                   style={{ borderColor: t.borderLight, color: t.text }}
//                 >
//                   <FontAwesomeIcon icon={faTimes} />
//                 </button>
//               </div>

//               {/* Split Detail Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
//                 {/* Shipping info */}
//                 <div className="p-4 rounded-xl border flex flex-col gap-2" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
//                   <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Shipping & Customer</p>
//                   <p className="text-xs font-bold" style={{ color: t.text }}>{selectedOrder.customer_name}</p>
//                   <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Email: {selectedOrder.customer_email}</p>
//                   <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Phone: {selectedOrder.customer_phone}</p>
//                   <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>City: {selectedOrder.shipping_city}</p>
//                   <p className="text-xs font-semibold leading-relaxed" style={{ color: t.textSecondary }}>Address: {selectedOrder.shipping_address}</p>
//                 </div>

//                 {/* Status & Method */}
//                 <div className="p-4 rounded-xl border flex flex-col gap-3 justify-between" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: t.textSubtle }}>Fulfillment Status</p>
//                     <div className="relative inline-block w-full">
//                       <select 
//                         value={selectedOrder.status}
//                         onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
//                         className="w-full px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider outline-none bg-black/40 text-white"
//                         style={{ borderColor: t.borderLight }}
//                       >
//                         {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => (
//                           <option key={status} value={status} className="bg-neutral-900 text-white">{status}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>Transaction Amount</p>
//                     <p className="hf text-2xl font-black" style={{ color: t.text }}>${selectedOrder.total_amount.toLocaleString()}</p>
//                     <p className="text-[10px] font-bold" style={{ color: t.textSecondary }}>Method: {selectedOrder.payment_method}</p>
//                   </div>
//                 </div>

//               </div>

//               {/* Items List */}
//               <div className="flex flex-col gap-3">
//                 <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: t.textSubtle }}>Ordered Items Matrix</p>
//                 <div className="flex flex-col gap-2">
//                   {(selectedOrder.order_items || []).map((item: any) => (
//                     <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
//                       <div>
//                         <p className="text-xs font-bold" style={{ color: t.text }}>{item.product_name}</p>
//                         <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Type: {item.product_type} • Price: ${item.price.toLocaleString()}</p>
//                       </div>
//                       <span className="text-xs font-black" style={{ color: t.accentText }}>x{item.quantity}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ADD NEW PRODUCT MODAL */}
//       <AnimatePresence>
//         {isAddModalOpen && (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-hidden"
//           >
//             <motion.div 
//               initial={{ scale: 0.95, y: 30 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.95, y: 30 }}
//               className="max-w-3xl w-full rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-6 shadow-2xl relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-[1000]"
//               style={{ 
//                 background: isDark ? "rgba(20, 20, 20, 0.98)" : "rgba(255, 255, 255, 0.98)", 
//                 borderColor: t.borderLight,
//                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
//                 color: t.text
//               }}
//             >
//               {/* Top ambient color bar for subtle cinematic accent */}
//               <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${t.accentText}, #06b6d4)` }} />

//               {/* Header */}
//               <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: t.borderLight }}>
//                 <div>
//                   <h3 className="hf text-xl font-black uppercase tracking-wider" style={{ color: t.text }}>
//                     {editingProductId ? "Update Product Specifications" : "Catalog New Product"}
//                   </h3>
//                   <p className="text-[11px] font-semibold mt-1" style={{ color: t.textSecondary }}>
//                     {editingProductId ? "Update structural metadata inside live cloud matrices." : "Insert structural metadata directly into live cloud matrices."}
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-white/5 active:scale-95"
//                   style={{ borderColor: t.borderLight, color: t.text }}
//                 >
//                   <FontAwesomeIcon icon={faTimes} />
//                 </button>
//               </div>

//               {/* Form Container */}
//               <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-6 text-xs font-bold">
                
//                 {/* Product Type Segmented Switch */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                     Product Type {editingProductId && <span className="text-[9px] lowercase font-normal opacity-60">(Locked during edit)</span>}
//                   </label>
//                   <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl border" style={{ backgroundColor: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.05)", borderColor: t.borderLight }}>
//                     <button 
//                       type="button"
//                       disabled={!!editingProductId}
//                       onClick={() => setAddType("laptop")}
//                       className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${editingProductId ? "opacity-60 cursor-not-allowed" : ""}`}
//                       style={{
//                         background: addType === "laptop" ? t.accentText : "transparent",
//                         color: addType === "laptop" ? "#fff" : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"),
//                         boxShadow: addType === "laptop" && isDark ? `0 0 15px ${t.accentText}30` : "none"
//                       }}
//                     >
//                       Laptop
//                     </button>
//                     <button 
//                       type="button"
//                       disabled={!!editingProductId}
//                       onClick={() => setAddType("hardware")}
//                       className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${editingProductId ? "opacity-60 cursor-not-allowed" : ""}`}
//                       style={{
//                         background: addType === "hardware" ? t.accentText : "transparent",
//                         color: addType === "hardware" ? "#fff" : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"),
//                         boxShadow: addType === "hardware" && isDark ? `0 0 15px ${t.accentText}30` : "none"
//                       }}
//                     >
//                       Hardware Component
//                     </button>
//                   </div>
//                 </div>

//                 {/* Standard Fields Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Product Name
//                     </label>
//                     <input 
//                       type="text" required
//                       value={formData.name}
//                       onChange={e => setFormData({...formData, name: e.target.value})}
//                       className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 ${
//                         isDark 
//                           ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                           : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                       }`} 
//                       style={getFieldStyle()}
//                       placeholder="e.g. ROG Strix SCAR 16"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Brand
//                     </label>
//                     <input 
//                       type="text" required
//                       value={formData.brand}
//                       onChange={e => setFormData({...formData, brand: e.target.value})}
//                       className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 ${
//                         isDark 
//                           ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                           : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                       }`} 
//                       style={getFieldStyle()}
//                       placeholder="e.g. Asus, Intel, AMD"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Retail Price ($)
//                     </label>
//                     <input 
//                       type="number" required min="1"
//                       value={formData.price || ""}
//                       onChange={e => setFormData({...formData, price: Number(e.target.value)})}
//                       className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 font-semibold ${
//                         isDark 
//                           ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                           : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                       }`} 
//                       style={getFieldStyle()}
//                       placeholder="2499"
//                     />
//                   </div>
                  
//                   {addType === "laptop" ? (
//                     <div className="flex flex-col gap-2">
//                       <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                         Original Price ($) {/* <span className="text-[9px] lowercase opacity-65">(For discount calculations)</span>*/} 
//                       </label>
//                       <input 
//                         type="number"
//                         value={formData.original_price || ""}
//                         onChange={e => setFormData({...formData, original_price: Number(e.target.value)})}
//                         className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 font-semibold ${
//                           isDark 
//                             ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                             : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                         }`} 
//                         style={getFieldStyle()}
//                         placeholder="2799"
//                       />
//                     </div>
//                   ) : (
//                     <div className="flex flex-col gap-2">
//                       <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                         Discount Price ($) <span className="text-[9px] lowercase opacity-65">(Deal price if active)</span>
//                       </label>
//                       <input 
//                         type="number"
//                         value={formData.discount_price || ""}
//                         onChange={e => setFormData({...formData, discount_price: Number(e.target.value)})}
//                         className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 font-semibold ${
//                           isDark 
//                             ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                             : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                         }`} 
//                         style={getFieldStyle()}
//                         placeholder="2199"
//                       />
//                     </div>
//                   )}

//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Initial Stock Level
//                     </label>
//                     <input 
//                       type="number" required min="0"
//                       value={formData.stock}
//                       onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
//                       className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 font-semibold ${
//                         isDark 
//                           ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                           : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                       }`} 
//                       style={getFieldStyle()}
//                     />
//                   </div>
//                 </div>

//                 {addType === "laptop" && (
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Tagline / Catchphrase
//                     </label>
//                     <input 
//                       type="text"
//                       value={formData.tagline}
//                       onChange={e => setFormData({...formData, tagline: e.target.value})}
//                       className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 ${
//                         isDark 
//                           ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                           : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                       }`} 
//                       style={getFieldStyle()}
//                       placeholder="Uncompromising speed for competitive gamers."
//                     />
//                   </div>
//                 )}

//                 {/* Categories Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex flex-col gap-2">
//                     <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                       Category Name
//                     </label>
//                     {addType === "hardware" ? (
//                       <select
//                         required
//                         value={formData.category}
//                         onChange={e => {
//                           const cat = e.target.value;
//                           setFormData((prev: any) => {
//                             // Populate default specs for that category if available
//                             let defaultSpecs = "{}";
//                             if (cat === "CPU") {
//                               defaultSpecs = JSON.stringify({ socket: "AM5", cores: 8, threads: 16, baseClock: "3.8 GHz", boostClock: "5.4 GHz", tdp: 65, integratedGraphics: true }, null, 2);
//                             } else if (cat === "GPU") {
//                               defaultSpecs = JSON.stringify({ chipset: "RTX 4070", vram: "12GB GDDR6X", coreClock: "2.31 GHz", length: 285, tdp: 200, recommendedPSU: 650 }, null, 2);
//                             } else if (cat === "Motherboard") {
//                               defaultSpecs = JSON.stringify({ socket: "AM5", formFactor: "ATX", chipset: "B650", memorySlots: 4, maxMemory: "128GB", wifiIncluded: true }, null, 2);
//                             } else if (cat === "RAM") {
//                               defaultSpecs = JSON.stringify({ type: "DDR5", capacity: "32GB (2x16GB)", speed: 6000, casLatency: 30, rgb: true }, null, 2);
//                             } else if (cat === "Storage") {
//                               defaultSpecs = JSON.stringify({ storageType: "NVMe", capacity: "2TB", interface: "PCIe 4.0 x4", formFactor: "M.2 2280", readSpeed: "7300 MB/s", writeSpeed: "6000 MB/s" }, null, 2);
//                             } else if (cat === "Case") {
//                               defaultSpecs = JSON.stringify({ type: "Mid Tower", color: "Black", motherboardSupport: "ATX, Micro-ATX", includedFans: 3, sidePanel: "Tempered Glass" }, null, 2);
//                             } else if (cat === "Monitor") {
//                               defaultSpecs = JSON.stringify({ size: 27, resolution: "2560 x 1440", refreshRate: 180, panelType: "IPS", responseTime: "1ms", curved: false }, null, 2);
//                             }
//                             return { ...prev, category: cat, specs: defaultSpecs };
//                           });
//                         }}
//                         className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 bg-black/40 text-white`}
//                         style={getFieldStyle()}
//                       >
//                         <option value="" className="bg-neutral-900 text-white">Select Category</option>
//                         <option value="CPU" className="bg-neutral-900 text-white">CPU (Processor)</option>
//                         <option value="GPU" className="bg-neutral-900 text-white">GPU (Graphics Card)</option>
//                         <option value="Motherboard" className="bg-neutral-900 text-white">Motherboard</option>
//                         <option value="RAM" className="bg-neutral-900 text-white">RAM Memory</option>
//                         <option value="Storage" className="bg-neutral-900 text-white">Storage (SSD/NVMe/HDD)</option>
//                         <option value="Case" className="bg-neutral-900 text-white">Case (Chassis)</option>
//                         <option value="Monitor" className="bg-neutral-900 text-white">Monitor</option>
//                       </select>
//                     ) : (
//                       <input 
//                         type="text" required
//                         value={formData.category}
//                         onChange={e => setFormData({...formData, category: e.target.value})}
//                         className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 ${
//                           isDark 
//                             ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                             : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                         }`} 
//                         style={getFieldStyle()}
//                         placeholder="gaming, business, ultrabooks"
//                       />
//                     )}
//                   </div>
//                   {addType === "laptop" && (
//                     <div className="flex flex-col gap-2">
//                       <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                         Subcategory ID
//                       </label>
//                       <input 
//                         type="text"
//                         value={formData.sub_category}
//                         onChange={e => setFormData({...formData, sub_category: e.target.value})}
//                         className={`px-4 py-3 rounded-xl border outline-none transition-all duration-300 focus:ring-1 ${
//                           isDark 
//                             ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                             : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                         }`} 
//                         style={getFieldStyle()}
//                         placeholder="rtx-40-series, amd-ryzen"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Media Links */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                     Product Images (URLs separated by comma)
//                   </label>
//                   <textarea 
//                     rows={2} required
//                     value={formData.images}
//                     onChange={e => setFormData({...formData, images: e.target.value})}
//                     className={`px-4 py-3 rounded-xl border outline-none font-mono transition-all duration-300 focus:ring-1 text-xs ${
//                       isDark 
//                         ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                         : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                     }`} 
//                     style={getFieldStyle()}
//                     placeholder="https://example.com/img1.png, https://example.com/img2.png"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: t.textSecondary }}>
//                     Detailed Product Description
//                   </label>
//                   <textarea 
//                     rows={3} required
//                     value={formData.description}
//                     onChange={e => setFormData({...formData, description: e.target.value})}
//                     className={`px-4 py-3 rounded-xl border outline-none leading-relaxed transition-all duration-300 focus:ring-1 ${
//                       isDark 
//                         ? "focus:border-cyan-500/50 focus:ring-cyan-500/30 text-white placeholder-white/25" 
//                         : "focus:border-cyan-600/50 focus:ring-cyan-600/30 text-black placeholder-black/30"
//                     }`} 
//                     style={getFieldStyle()}
//                     placeholder="Describe the cinematic features and structural architectural highlights..."
//                   />
//                 </div>

//                 {/* Advanced Visual Spec Editors */}
//                 <div className="flex flex-col gap-6 border-t pt-6" style={{ borderColor: t.borderLight }}>
                  
//                   {/* DISPLAY SPECS SECTION */}
//                   <div className="flex flex-col gap-3">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: t.text }}>
//                           {addType === "laptop" ? "Display Specs (HUD Badges)" : "Component Specifications"}
//                         </h4>
//                         <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>
//                           {addType === "laptop" ? "These badges are displayed on the product cards." : "Hardware details stored in database."}
//                         </p>
//                       </div>
                      
//                       <div className="flex items-center gap-2">
//                         {/* Toggle Mode */}
//                         <div className="flex p-0.5 rounded-lg border text-[10px] font-bold bg-black/20" style={{ borderColor: t.borderLight }}>
//                           <button
//                             type="button"
//                             onClick={() => {
//                               if (isSpecsValid) setSpecsEditorMode("visual");
//                             }}
//                             className={`px-2.5 py-1 rounded-md transition-all duration-300 ${
//                               specsEditorMode === "visual" && isSpecsValid
//                                 ? "bg-cyan-500 text-white font-black shadow-lg shadow-cyan-500/20"
//                                 : "text-neutral-400 hover:text-white"
//                             }`}
//                             disabled={!isSpecsValid}
//                             title={!isSpecsValid ? "Please fix JSON syntax errors first" : ""}
//                           >
//                             Visual Builder
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setSpecsEditorMode("json")}
//                             className={`px-2.5 py-1 rounded-md transition-all duration-300 ${
//                               specsEditorMode === "json"
//                                 ? "bg-cyan-500 text-white font-black shadow-lg shadow-cyan-500/20"
//                                 : "text-neutral-400 hover:text-white"
//                             }`}
//                           >
//                             Raw JSON
//                           </button>
//                         </div>
                        
//                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase transition-all duration-300 ${
//                           isSpecsValid 
//                             ? "bg-green-500/15 text-green-500" 
//                             : "bg-red-500/15 text-red-500 animate-pulse"
//                         }`}>
//                           {isSpecsValid ? "✓ Valid" : "✗ Error"}
//                         </span>
//                       </div>
//                     </div>

//                     {specsEditorMode === "visual" && isSpecsValid ? (
//                       addType === "laptop" ? (
//                         /* Laptop specs: Array of { label, value, color }*/
//                         <div className="flex flex-col gap-3 p-4 rounded-2xl border bg-black/25 backdrop-blur-md" style={{ borderColor: t.borderLight }}>
//                           <div className="flex flex-col gap-2">
//                             {getParsedSpecs().map((spec: any, idx: number) => (
//                               <div key={idx} className="flex gap-2 items-center">
//                                 <input
//                                   type="text"
//                                   placeholder="Label (e.g. CPU)"
//                                   value={spec.label || ""}
//                                   onChange={e => {
//                                     const arr = getParsedSpecs();
//                                     arr[idx] = { ...arr[idx], label: e.target.value };
//                                     updateParsedSpecs(arr);
//                                   }}
//                                   className="flex-1 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                   style={{ borderColor: t.borderLight }}
//                                 />
//                                 <input
//                                   type="text"
//                                   placeholder="Value (e.g. Core i7)"
//                                   value={spec.value || ""}
//                                   onChange={e => {
//                                     const arr = getParsedSpecs();
//                                     arr[idx] = { ...arr[idx], value: e.target.value };
//                                     updateParsedSpecs(arr);
//                                   }}
//                                   className="flex-2 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                   style={{ borderColor: t.borderLight }}
//                                 />
//                                 <select
//                                   value={spec.color || "cyan"}
//                                   onChange={e => {
//                                     const arr = getParsedSpecs();
//                                     arr[idx] = { ...arr[idx], color: e.target.value };
//                                     updateParsedSpecs(arr);
//                                   }}
//                                   className="px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                   style={{ borderColor: t.borderLight }}
//                                 >
//                                   {["cyan", "green", "blue", "purple", "red", "gold", "orange", "emerald"].map(col => (
//                                     <option key={col} value={col} className="bg-neutral-900 text-white">{col}</option>
//                                   ))}
//                                 </select>
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     const arr = getParsedSpecs();
//                                     arr.splice(idx, 1);
//                                     updateParsedSpecs(arr);
//                                   }}
//                                   className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 flex items-center justify-center transition-all active:scale-95"
//                                 >
//                                   <FontAwesomeIcon icon={faTimes} />
//                                 </button>
//                               </div>
//                             ))}
//                             {getParsedSpecs().length === 0 && (
//                               <p className="text-[10px] font-semibold text-center py-4" style={{ color: t.textSubtle }}>
//                                 No display specs configured. Add your first spec badge below!
//                               </p>
//                             )}
//                           </div>
                          
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const arr = getParsedSpecs();
//                               arr.push({ label: "", value: "", color: "cyan" });
//                               updateParsedSpecs(arr);
//                             }}
//                             className="py-2.5 rounded-xl border border-dashed transition-all hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 active:scale-[0.98]"
//                             style={{ borderColor: t.borderLight }}
//                           >
//                             <FontAwesomeIcon icon={faPlus} className="mr-1.5" /> Add Display Spec Row
//                           </button>
//                         </div>
//                       ) : (
//                         /* Hardware specs: Object of { key: value }*/
//                         <div className="flex flex-col gap-4 p-4 rounded-2xl border bg-black/25 backdrop-blur-md" style={{ borderColor: t.borderLight }}>
                          
//                           {/* Render Schema-based inputs if category matches predefined schema */}
//                           {HARDWARE_SCHEMAS[formData.category] ? (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4 mb-2" style={{ borderColor: t.borderLight }}>
//                               {HARDWARE_SCHEMAS[formData.category].map((field) => {
//                                 const val = getParsedHardwareSpecs()[field.key];
//                                 return (
//                                   <div key={field.key} className="flex flex-col gap-1.5">
//                                     <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
//                                       {field.label}
//                                     </label>
//                                     {field.type === "boolean" ? (
//                                       <label className="flex items-center gap-2 cursor-pointer py-2.5 px-3 rounded-xl border bg-black/40 text-xs text-white" style={{ borderColor: t.borderLight }}>
//                                         <input
//                                           type="checkbox"
//                                           checked={!!val}
//                                           onChange={e => {
//                                             const obj = getParsedHardwareSpecs();
//                                             obj[field.key] = e.target.checked;
//                                             updateParsedHardwareSpecs(obj);
//                                           }}
//                                           className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
//                                         />
//                                         <span>Enabled / Included</span>
//                                       </label>
//                                     ) : field.type === "select" ? (
//                                       <select
//                                         value={val || ""}
//                                         onChange={e => {
//                                           const obj = getParsedHardwareSpecs();
//                                           obj[field.key] = e.target.value;
//                                           updateParsedHardwareSpecs(obj);
//                                         }}
//                                         className="px-3 py-2.5 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                         style={{ borderColor: t.borderLight }}
//                                       >
//                                         <option value="" className="bg-neutral-900 text-white">Select...</option>
//                                         {field.options?.map(opt => (
//                                           <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>
//                                         ))}
//                                       </select>
//                                     ) : (
//                                       <input
//                                         type={field.type}
//                                         placeholder={field.placeholder || ""}
//                                         value={val === undefined ? "" : val}
//                                         onChange={e => {
//                                           const obj = getParsedHardwareSpecs();
//                                           obj[field.key] = field.type === "number" ? (Number(e.target.value) || 0) : e.target.value;
//                                           updateParsedHardwareSpecs(obj);
//                                         }}
//                                         className="px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                         style={{ borderColor: t.borderLight }}
//                                       />
//                                     )}
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           ) : (
//                             <p className="text-[10px] font-semibold text-center text-neutral-400 py-2">
//                               No predefined schema keys for this category. Define custom specs below.
//                             </p>
//                           )}
                          
//                           {/* Custom key-value specs at bottom for hardware */}
//                           <div className="flex flex-col gap-2">
//                             <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
//                               Custom Specifications
//                             </label>
//                             {Object.entries(getParsedHardwareSpecs())
//                               .filter(([k]) => !HARDWARE_SCHEMAS[formData.category]?.some(f => f.key === k))
//                               .map(([k, v]: [string, any]) => (
//                                 <div key={k} className="flex gap-2 items-center">
//                                   <input
//                                     type="text"
//                                     placeholder="Spec Key"
//                                     value={k}
//                                     onChange={e => {
//                                       const obj = getParsedHardwareSpecs();
//                                       const newKey = e.target.value;
//                                       if (newKey && newKey !== k) {
//                                         obj[newKey] = v;
//                                         delete obj[k];
//                                         updateParsedHardwareSpecs(obj);
//                                       }
//                                     }}
//                                     className="flex-1 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                     style={{ borderColor: t.borderLight }}
//                                   />
//                                   <input
//                                     type="text"
//                                     placeholder="Spec Value"
//                                     value={v === null || v === undefined ? "" : String(v)}
//                                     onChange={e => {
//                                       const obj = getParsedHardwareSpecs();
//                                       obj[k] = e.target.value;
//                                       updateParsedHardwareSpecs(obj);
//                                     }}
//                                     className="flex-2 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                     style={{ borderColor: t.borderLight }}
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       const obj = getParsedHardwareSpecs();
//                                       delete obj[k];
//                                       updateParsedHardwareSpecs(obj);
//                                     }}
//                                     className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 flex items-center justify-center transition-all active:scale-95"
//                                   >
//                                     <FontAwesomeIcon icon={faTimes} />
//                                   </button>
//                                 </div>
//                               ))}
                            
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 const obj = getParsedHardwareSpecs();
//                                 let counter = 1;
//                                 while (obj[`custom_spec_${counter}`] !== undefined) {
//                                   counter++;
//                                 }
//                                 obj[`custom_spec_${counter}`] = "";
//                                 updateParsedHardwareSpecs(obj);
//                               }}
//                               className="py-2.5 rounded-xl border border-dashed transition-all hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 active:scale-[0.98]"
//                               style={{ borderColor: t.borderLight }}
//                             >
//                               <FontAwesomeIcon icon={faPlus} className="mr-1.5" /> Add Custom Spec Key-Value
//                             </button>
//                           </div>
//                         </div>
//                       )
//                     ) : (
//                       /* Raw JSON View */
//                       <textarea
//                         rows={5} required
//                         value={formData.specs}
//                         onChange={e => setFormData({...formData, specs: e.target.value})}
//                         className={`px-4 py-3 rounded-xl border outline-none font-mono text-[10px] leading-relaxed transition-all focus:ring-1 w-full ${
//                           isDark 
//                             ? "bg-black/50 text-emerald-400 focus:border-emerald-500/50 focus:ring-emerald-500/30" 
//                             : "bg-gray-50 text-emerald-700 focus:border-emerald-600/50 focus:ring-emerald-600/30"
//                         }`}
//                         style={{ borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)" }}
//                       />
//                     )}
//                   </div>

//                   {/* INTERNAL TECHNICAL METADATA (LAPTOP ONLY) */}
//                   {addType === "laptop" && (
//                     <div className="flex flex-col gap-3">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: t.text }}>
//                             Internal Technical Specs
//                           </h4>
//                           <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>
//                             Technical details used in search filters and comparisons.
//                           </p>
//                         </div>
                        
//                         <div className="flex items-center gap-2">
//                           {/* Toggle Mode */}
//                           <div className="flex p-0.5 rounded-lg border text-[10px] font-bold bg-black/20" style={{ borderColor: t.borderLight }}>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 if (isMetadataValid) setMetadataEditorMode("visual");
//                               }}
//                               className={`px-2.5 py-1 rounded-md transition-all duration-300 ${
//                                 metadataEditorMode === "visual" && isMetadataValid
//                                   ? "bg-cyan-500 text-white font-black shadow-lg shadow-cyan-500/20"
//                                   : "text-neutral-400 hover:text-white"
//                               }`}
//                               disabled={!isMetadataValid}
//                               title={!isMetadataValid ? "Please fix JSON syntax errors first" : ""}
//                             >
//                               Visual Builder
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setMetadataEditorMode("json")}
//                               className={`px-2.5 py-1 rounded-md transition-all duration-300 ${
//                                 metadataEditorMode === "json"
//                                   ? "bg-cyan-500 text-white font-black shadow-lg shadow-cyan-500/20"
//                                   : "text-neutral-400 hover:text-white"
//                               }`}
//                             >
//                               Raw JSON
//                             </button>
//                           </div>
                          
//                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase transition-all duration-300 ${
//                             isMetadataValid 
//                               ? "bg-green-500/15 text-green-500" 
//                               : "bg-red-500/15 text-red-500 animate-pulse"
//                           }`}>
//                             {isMetadataValid ? "✓ Valid" : "✗ Error"}
//                           </span>
//                         </div>
//                       </div>

//                       {metadataEditorMode === "visual" && isMetadataValid ? (
//                         <div className="flex flex-col gap-4 p-4 rounded-2xl border bg-black/25 backdrop-blur-md" style={{ borderColor: t.borderLight }}>
//                           {/* Predefined metadata fields */}
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4 mb-2" style={{ borderColor: t.borderLight }}>
//                             {METADATA_FIELDS_INFO.map(field => {
//                               const val = getParsedMetadata()[field.key];
//                               return (
//                                 <div key={field.key} className="flex flex-col gap-1.5">
//                                   <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
//                                     {field.label} <span className="text-[8px] lowercase font-mono opacity-50">({field.key})</span>
//                                   </label>
//                                   <input
//                                     type={field.type === "number" ? "number" : "text"}
//                                     placeholder={field.placeholder}
//                                     value={val === undefined ? "" : field.type === "array" && Array.isArray(val) ? val.join(", ") : val}
//                                     onChange={e => {
//                                       const obj = getParsedMetadata();
//                                       if (field.type === "number") {
//                                         obj[field.key] = Number(e.target.value) || 0;
//                                       } else if (field.type === "array") {
//                                         obj[field.key] = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
//                                       } else {
//                                         obj[field.key] = e.target.value;
//                                       }
//                                       updateParsedMetadata(obj);
//                                     }}
//                                     className="px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                     style={{ borderColor: t.borderLight }}
//                                   />
//                                 </div>
//                               );
//                             })}
//                           </div>
                          
//                           {/* Custom metadata keys */}
//                           <div className="flex flex-col gap-2">
//                             <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
//                               Custom Parameters
//                             </label>
//                             {Object.entries(getParsedMetadata())
//                               .filter(([k]) => !METADATA_FIELDS_INFO.some(f => f.key === k))
//                               .map(([k, v]: [string, any]) => (
//                                 <div key={k} className="flex gap-2 items-center">
//                                   <input
//                                     type="text"
//                                     placeholder="Param Key"
//                                     value={k}
//                                     onChange={e => {
//                                       const obj = getParsedMetadata();
//                                       const newKey = e.target.value;
//                                       if (newKey && newKey !== k) {
//                                         obj[newKey] = v;
//                                         delete obj[k];
//                                         updateParsedMetadata(obj);
//                                       }
//                                     }}
//                                     className="flex-1 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                     style={{ borderColor: t.borderLight }}
//                                   />
//                                   <input
//                                     type="text"
//                                     placeholder="Param Value"
//                                     value={v === null || v === undefined ? "" : String(v)}
//                                     onChange={e => {
//                                       const obj = getParsedMetadata();
//                                       obj[k] = e.target.value;
//                                       updateParsedMetadata(obj);
//                                     }}
//                                     className="flex-2 px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none focus:border-cyan-500/50"
//                                     style={{ borderColor: t.borderLight }}
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       const obj = getParsedMetadata();
//                                       delete obj[k];
//                                       updateParsedMetadata(obj);
//                                     }}
//                                     className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 flex items-center justify-center transition-all active:scale-95"
//                                   >
//                                     <FontAwesomeIcon icon={faTimes} />
//                                   </button>
//                                 </div>
//                               ))}
                            
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 const obj = getParsedMetadata();
//                                 let counter = 1;
//                                 while (obj[`custom_param_${counter}`] !== undefined) {
//                                   counter++;
//                                 }
//                                 obj[`custom_param_${counter}`] = "";
//                                 updateParsedMetadata(obj);
//                               }}
//                               className="py-2.5 rounded-xl border border-dashed transition-all hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 active:scale-[0.98]"
//                               style={{ borderColor: t.borderLight }}
//                             >
//                               <FontAwesomeIcon icon={faPlus} className="mr-1.5" /> Add Custom Parameter Key-Value
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <textarea
//                           rows={5} required
//                           value={formData.technical_metadata}
//                           onChange={e => setFormData({...formData, technical_metadata: e.target.value})}
//                           className={`px-4 py-3 rounded-xl border outline-none font-mono text-[10px] leading-relaxed transition-all focus:ring-1 w-full ${
//                             isDark 
//                               ? "bg-black/50 text-emerald-400 focus:border-emerald-500/50 focus:ring-emerald-500/30" 
//                               : "bg-gray-50 text-emerald-700 focus:border-emerald-600/50 focus:ring-emerald-600/30"
//                           }`}
//                           style={{ borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)" }}
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Switchable toggles */}
//                 <div className="flex gap-6 py-3 border-t border-b" style={{ borderColor: t.borderLight }}>
//                   <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase tracking-wider" style={{ color: t.text }}>
//                     <input 
//                       type="checkbox"
//                       checked={formData.is_deal}
//                       onChange={e => setFormData({...formData, is_deal: e.target.checked})}
//                       className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
//                     />
//                     <span>Mark as Hot Deal</span>
//                   </label>

//                   {addType === "hardware" && (
//                     <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase tracking-wider" style={{ color: t.text }}>
//                       <input 
//                         type="checkbox"
//                         checked={formData.is_new}
//                         onChange={e => setFormData({...formData, is_new: e.target.checked})}
//                         className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
//                       />
//                       <span>Mark as Brand New</span>
//                     </label>
//                   )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-4 mt-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsAddModalOpen(false)}
//                     className="px-6 py-3.5 rounded-xl border transition-all duration-300 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] active:scale-95"
//                     style={{ borderColor: t.borderLight, color: t.text }}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submittingProduct || !isFormJsonValid}
//                     className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
//                       isFormJsonValid 
//                         ? "hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg" 
//                         : "opacity-40 cursor-not-allowed"
//                     }`}
//                     style={{ 
//                       background: isFormJsonValid ? t.accentText : "rgba(100,100,100,0.2)", 
//                       color: isFormJsonValid ? "#fff" : "rgba(255,255,255,0.4)",
//                       boxShadow: isFormJsonValid ? `0 4px 20px ${t.accentText}40` : "none"
//                     }}
//                   >
//                     {submittingProduct ? (
//                       <>
//                         <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> {editingProductId ? "Updating Specifications..." : "Saving To Matrix..."}
//                       </>
//                     ) : (
//                       editingProductId ? "Update Product Details" : "Save & Deploy Product"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Dynamic Toast System Overlay */}
//       <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[99999] pointer-events-none">
//         <AnimatePresence>
//           {toasts.map(toast => {
//             let color = "#06b6d4"; // success: cyan
//             let border = "rgba(6, 182, 212, 0.2)";
//             if (toast.type === "error") {
//               color = "#ef4444";
//               border = "rgba(239, 68, 68, 0.2)";
//             } else if (toast.type === "info") {
//               color = "#3b82f6";
//               border = "rgba(59, 130, 246, 0.2)";
//             }
//             return (
//               <motion.div
//                 key={toast.id}
//                 initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(4px)" }}
//                 animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
//                 exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
//                 className="pointer-events-auto px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 text-xs font-bold max-w-sm"
//                 style={{
//                   background: isDark ? "rgba(12, 12, 12, 0.92)" : "rgba(255, 255, 255, 0.92)",
//                   borderColor: border,
//                   boxShadow: `0 10px 30px -10px ${border}`,
//                   color: isDark ? "#fff" : "#000"
//                 }}
//               >
//                 <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
//                 <span>{toast.message}</span>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </div>

//       {/* Custom Confirmation Dialog Modal Overlay */}
//       <AnimatePresence>
//         {confirmModal?.isOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
//           >
//             <motion.div
//               initial={{ scale: 0.95, y: 15 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.95, y: 15 }}
//               className="max-w-md w-full rounded-3xl border p-6 backdrop-blur-xl flex flex-col gap-6 shadow-2xl"
//               style={{
//                 background: isDark ? "rgba(20, 20, 20, 0.96)" : "rgba(255, 255, 255, 0.96)",
//                 borderColor: t.borderLight
//               }}
//             >
//               <div>
//                 <h4 className="hf text-base font-black uppercase tracking-wider text-red-500 mb-2">
//                   {confirmModal.title}
//                 </h4>
//                 <p className="text-xs font-medium leading-relaxed" style={{ color: t.textSecondary }}>
//                   {confirmModal.message}
//                 </p>
//               </div>

//               <div className="flex justify-end gap-3 text-[10px] font-black uppercase tracking-widest">
//                 <button
//                   onClick={() => setConfirmModal(null)}
//                   className="px-5 py-2.5 rounded-xl border transition-all hover:bg-white/5"
//                   style={{ borderColor: t.borderLight, color: t.text }}
//                 >
//                   Abort Action
//                 </button>
//                 <button
//                   onClick={confirmModal.onConfirm}
//                   className="px-6 py-2.5 rounded-xl text-white transition-all bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20 active:scale-95"
//                 >
//                   Confirm Execute
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// }

// app/(main)/admin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faArrowLeft,
  faChartLine,
  faClipboardList,
  faWarehouse,
  faSpinner,
  faCheck,
  faTimes,
  faEdit,
  faSave,
  faDollarSign,
  faBoxes,
  faUsers,
  faEye,
  faChevronDown,
  faPlus,
  faChevronLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import {
  checkAdminRoleAction,
  fetchAdminOrdersAction,
  updateOrderStatusAction,
  fetchAdminInventoryAction,
  updateProductStockAction,
  addNewProductAction,
  updateProductAction,
  deleteProductAction
} from "@/app/actions/admin";
import { CinematicReveal } from "@/components/ui/CinematicReveal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

// الحقول التقنية للابتوب بناءً على laptop-schema.ts
const METADATA_FIELDS_INFO = [
  { key: "cpu", label: "CPU Model", type: "text", placeholder: "e.g. Intel Core i7-13700H" },
  { key: "gpu", label: "GPU Model", type: "text", placeholder: "e.g. NVIDIA RTX 4060" },
  { key: "ram_gb", label: "RAM (GB)", type: "number", placeholder: "16" },
  { key: "storage_gb", label: "Storage (GB)", type: "number", placeholder: "512" },
  { key: "screen_size", label: "Screen Size (inches)", type: "number", placeholder: "16" },
  { key: "display_hz", label: "Refresh Rate (Hz)", type: "number", placeholder: "144" },
  { key: "battery_hours", label: "Battery Life (hours)", type: "number", placeholder: "8" },
  { key: "nvme_speed_gbs", label: "NVMe Speed (GB/s)", type: "number", placeholder: "7" },
  { key: "vram_gb", label: "VRAM (GB)", type: "number", placeholder: "8" },
  { key: "gpu_tdp_watts", label: "GPU TDP (Watts)", type: "number", placeholder: "140" },
  { key: "gpu_memory_type", label: "GPU Memory Type", type: "text", placeholder: "e.g. GDDR6X" },
  { key: "cpu_cores", label: "CPU Cores", type: "number", placeholder: "14" },
  { key: "cpu_threads", label: "CPU Threads", type: "number", placeholder: "20" },
  { key: "cpu_speed", label: "CPU Boost Speed (GHz)", type: "number", placeholder: "5.0" },
  { key: "display_type", label: "Display Type", type: "text", placeholder: "e.g. IPS, OLED, Mini-LED" },
  { key: "display_response_ms", label: "Response Time (ms)", type: "number", placeholder: "3" },
  { key: "connectivity", label: "Connectivity (Comma-separated)", type: "array", placeholder: "Wi-Fi 6E, Bluetooth 5.2" }
];

// الحقول الخاصة بالقطع الصلبة بناءً على hardware-schema.ts
const HARDWARE_SCHEMAS: Record<string, Array<{ key: string; label: string; type: "text" | "number" | "boolean" | "select"; options?: string[]; placeholder?: string }>> = {
  CPU: [
    { key: "socket", label: "Socket", type: "text", placeholder: "e.g. AM5, LGA1700" },
    { key: "cores", label: "Cores", type: "number", placeholder: "8" },
    { key: "threads", label: "Threads", type: "number", placeholder: "16" },
    { key: "baseClock", label: "Base Clock", type: "text", placeholder: "3.8 GHz" },
    { key: "boostClock", label: "Boost Clock", type: "text", placeholder: "5.4 GHz" },
    { key: "tdp", label: "TDP (Watts)", type: "number", placeholder: "65" },
    { key: "integratedGraphics", label: "Integrated Graphics", type: "boolean" }
  ],
  GPU: [
    { key: "chipset", label: "Chipset", type: "text", placeholder: "e.g. RTX 4090, RX 7900 XTX" },
    { key: "vram", label: "VRAM", type: "text", placeholder: "24GB GDDR6X" },
    { key: "coreClock", label: "Core Clock", type: "text", placeholder: "2.23 GHz" },
    { key: "length", label: "Card Length (mm)", type: "number", placeholder: "304" },
    { key: "tdp", label: "TDP (Watts)", type: "number", placeholder: "450" },
    { key: "recommendedPSU", label: "Recommended PSU (Watts)", type: "number", placeholder: "850" }
  ],
  Motherboard: [
    { key: "socket", label: "Socket", type: "text", placeholder: "e.g. AM5, LGA1700" },
    { key: "formFactor", label: "Form Factor", type: "select", options: ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"] },
    { key: "chipset", label: "Chipset", type: "text", placeholder: "e.g. B650, Z790" },
    { key: "memorySlots", label: "Memory Slots", type: "number", placeholder: "4" },
    { key: "maxMemory", label: "Max Memory Capacity", type: "text", placeholder: "128GB" },
    { key: "wifiIncluded", label: "Wi-Fi Included", type: "boolean" }
  ],
  RAM: [
    { key: "type", label: "Memory Type", type: "select", options: ["DDR5", "DDR4"] },
    { key: "capacity", label: "Capacity", type: "text", placeholder: "e.g. 32GB (2x16GB)" },
    { key: "speed", label: "Speed (MHz)", type: "number", placeholder: "6000" },
    { key: "casLatency", label: "CAS Latency", type: "number", placeholder: "30" },
    { key: "rgb", label: "RGB Lighting", type: "boolean" }
  ],
  Storage: [
    { key: "storageType", label: "Storage Type", type: "select", options: ["NVMe", "SSD", "HDD"] },
    { key: "capacity", label: "Capacity", type: "text", placeholder: "e.g. 2TB, 1TB" },
    { key: "interface", label: "Interface", type: "text", placeholder: "PCIe 4.0 x4, SATA III" },
    { key: "formFactor", label: "Form Factor", type: "text", placeholder: "M.2 2280, 2.5 inch" },
    { key: "readSpeed", label: "Read Speed", type: "text", placeholder: "e.g. 7300 MB/s" },
    { key: "writeSpeed", label: "Write Speed", type: "text", placeholder: "e.g. 6000 MB/s" }
  ],
  Case: [
    { key: "type", label: "Case Type", type: "select", options: ["Mid Tower", "Full Tower", "Mini Tower"] },
    { key: "color", label: "Color", type: "text", placeholder: "Black, White, Gray" },
    { key: "motherboardSupport", label: "Motherboard Support (Comma-separated)", type: "text", placeholder: "ATX, Micro-ATX, Mini-ITX" },
    { key: "includedFans", label: "Included Fans", type: "number", placeholder: "3" },
    { key: "sidePanel", label: "Side Panel Type", type: "select", options: ["Tempered Glass", "Mesh", "Solid"] }
  ],
  Monitor: [
    { key: "size", label: "Display Size (inches)", type: "number", placeholder: "27" },
    { key: "resolution", label: "Resolution", type: "text", placeholder: "2560 x 1440" },
    { key: "refreshRate", label: "Refresh Rate (Hz)", type: "number", placeholder: "144" },
    { key: "panelType", label: "Panel Type", type: "select", options: ["IPS", "VA", "OLED", "TN"] },
    { key: "responseTime", label: "Response Time", type: "text", placeholder: "1ms" },
    { key: "curved", label: "Curved Display", type: "boolean" }
  ]
};

const DEFAULT_LAPTOP_FORM = {
  name: "",
  brand: "",
  tagline: "Experience peak gaming performance.",
  price: 1500,
  original_price: 1800,
  category: "Gaming",
  sub_category: "rtx-40-series",
  stock: 10,
  images: "",
  description: "",
  badge: "none",
  is_deal: false,
  specs: JSON.stringify([
    { "label": "CPU", "value": "Intel Core i7-13700H", "color": "cyan", "raw_value": "13700H" },
    { "label": "GPU", "value": "NVIDIA RTX 4060", "color": "green", "raw_value": "4060" },
    { "label": "RAM", "value": "16GB DDR5", "color": "blue", "raw_value": "16" }
  ], null, 2),
  technical_metadata: JSON.stringify({
    "cpu_brand": "intel",
    "gpu_brand": "nvidia",
    "ram_gb": 16,
    "storage_gb": 512
  }, null, 2),
  color_variants: JSON.stringify([
    { "name": "Midnight Black", "hex": "#0a0a0a" }
  ], null, 2)
};

const DEFAULT_HARDWARE_FORM = {
  name: "",
  brand: "",
  price: 350,
  discount_price: 300,
  category: "CPU",
  stock: 15,
  images: "",
  description: "",
  is_deal: false,
  is_new: true,
  specs: JSON.stringify({
    "socket": "AM5",
    "cores": 8,
    "threads": 16,
    "baseClock": "3.8 GHz"
  }, null, 2)
};

export default function AdminDashboard() {
  const { t, isDark } = useTheme();
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory">("analytics");

  const [orders, setOrders] = useState<any[]>([]);
  const [laptops, setLaptops] = useState<any[]>([]);
  const [hardware, setHardware] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [inventoryType, setInventoryType] = useState<"laptop" | "hardware">("laptop");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [savingStock, setSavingStock] = useState(false);
  const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; type: "success" | "error" | "info"; message: string }[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  const [ordersPage, setOrdersPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<"laptop" | "hardware">("laptop");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [formData, setFormData] = useState<any>(DEFAULT_LAPTOP_FORM);

  const [isSpecsValid, setIsSpecsValid] = useState(true);
  const [isMetadataValid, setIsMetadataValid] = useState(true);
  const [isColorsValid, setIsColorsValid] = useState(true);

  const [specsEditorMode, setSpecsEditorMode] = useState<"visual" | "json">("visual");
  const [metadataEditorMode, setMetadataEditorMode] = useState<"visual" | "json">("visual");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // حالة فلترة النطاق الزمني للإحصائيات
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"7d" | "30d" | "all">("7d");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    try {
      if (!formData.specs.trim()) {
        setIsSpecsValid(true);
      } else {
        JSON.parse(formData.specs);
        setIsSpecsValid(true);
      }
    } catch {
      setIsSpecsValid(false);
    }
  }, [formData.specs]);

  useEffect(() => {
    try {
      if (addType === "hardware") {
        setIsMetadataValid(true);
      } else if (!formData.technical_metadata.trim()) {
        setIsMetadataValid(true);
      } else {
        JSON.parse(formData.technical_metadata);
        setIsMetadataValid(true);
      }
    } catch {
      setIsMetadataValid(false);
    }
  }, [formData.technical_metadata, addType]);

  useEffect(() => {
    try {
      if (addType === "hardware") {
        setIsColorsValid(true);
      } else if (!formData.color_variants.trim()) {
        setIsColorsValid(true);
      } else {
        JSON.parse(formData.color_variants);
        setIsColorsValid(true);
      }
    } catch {
      setIsColorsValid(false);
    }
  }, [formData.color_variants, addType]);

  const isFormJsonValid = isSpecsValid && isMetadataValid && isColorsValid;

  useEffect(() => {
    setOrdersPage(1);
  }, [orderSearchQuery]);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventorySearchQuery, inventoryType]);

  const getParsedSpecs = () => {
    try {
      const parsed = JSON.parse(formData.specs);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const updateParsedSpecs = (newSpecs: any[]) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: JSON.stringify(newSpecs, null, 2)
    }));
  };

  const getParsedMetadata = () => {
    try {
      const parsed = JSON.parse(formData.technical_metadata);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  };

  const updateParsedMetadata = (newMetadata: any) => {
    setFormData((prev: any) => ({
      ...prev,
      technical_metadata: JSON.stringify(newMetadata, null, 2)
    }));
  };

  const getParsedHardwareSpecs = () => {
    try {
      const parsed = JSON.parse(formData.specs);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  };

  const updateParsedHardwareSpecs = (newSpecs: any) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: JSON.stringify(newSpecs, null, 2)
    }));
  };

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await checkAdminRoleAction();
        setIsAdmin(res.isAdmin);
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAccess();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    async function loadAdminData() {
      setLoadingData(true);
      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          fetchAdminOrdersAction(),
          fetchAdminInventoryAction()
        ]);

        if (ordersRes.success && ordersRes.orders) {
          setOrders(ordersRes.orders);
        }
        if (inventoryRes.success) {
          setLaptops(inventoryRes.laptops || []);
          setHardware(inventoryRes.hardware || []);
        }
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadAdminData();
  }, [isAdmin]);

  useEffect(() => {
    if (editingProductId !== null) return;
    if (addType === "laptop") {
      setFormData(DEFAULT_LAPTOP_FORM);
    } else {
      setFormData(DEFAULT_HARDWARE_FORM);
    }
  }, [addType, editingProductId]);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingOrderStatusId(orderId);
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev: any) => prev ? { ...prev, status: nextStatus } : null);
        }
        showToast("Fulfillment status synced successfully.", "success");
      } else {
        showToast(res.error || "Failed to update order status.", "error");
      }
    } catch {
      showToast("Network protocol failure during status sync.", "error");
    } finally {
      setUpdatingOrderStatusId(null);
    }
  };

  const handleUpdateStock = async (id: string, type: "laptop" | "hardware", newStock: number) => {
    setSavingStock(true);
    try {
      const res = await updateProductStockAction(id, type, newStock);
      if (res.success) {
        if (type === "laptop") {
          setLaptops(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        } else {
          setHardware(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        }
        setEditingStockId(null);
        showToast("Fulfillment stock units successfully updated.", "success");
      } else {
        showToast(res.error || "Failed to update stock matrix.", "error");
      }
    } catch {
      showToast("Stock modification network error.", "error");
    } finally {
      setSavingStock(false);
    }
  };

  const handleDeleteProduct = (id: string, type: "laptop" | "hardware") => {
    setConfirmModal({
      isOpen: true,
      title: "Decommission Product Matrix",
      message: "Are you sure you want to permanently decommission this product from live database nodes? This operation is irreversible.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await deleteProductAction(id, type);
          if (res.success) {
            showToast("Product successfully purged.", "success");
            if (type === "laptop") {
              setLaptops(prev => prev.filter(p => p.id !== id));
            } else {
              setHardware(prev => prev.filter(p => p.id !== id));
            }
          } else {
            showToast(res.error || "Decommission protocol failed.", "error");
          }
        } catch {
          showToast("Network disconnection halted purge protocol.", "error");
        }
      }
    });
  };

  const handleStartEditProduct = (item: any, type: "laptop" | "hardware") => {
    setAddType(type);
    setEditingProductId(item.id);
    
    const imagesStr = Array.isArray(item.images) ? item.images.join(", ") : (item.images || "");
    const specsStr = typeof item.specs === "object" ? JSON.stringify(item.specs, null, 2) : (item.specs || "");
    const metadataStr = typeof item.technical_metadata === "object" ? JSON.stringify(item.technical_metadata, null, 2) : (item.technical_metadata || "");
    const colorsStr = typeof item.color_variants === "object" ? JSON.stringify(item.color_variants, null, 2) : (item.color_variants || "[]");
    
    setFormData({
      name: item.name || "",
      brand: item.brand || "",
      tagline: item.tagline || "",
      price: item.price || 0,
      original_price: item.original_price || 0,
      discount_price: item.discount_price || 0,
      category: item.category || "",
      sub_category: item.sub_category || "",
      stock: item.stock || 0,
      images: imagesStr,
      description: item.description || "",
      badge: item.badge || "none",
      is_deal: !!item.is_deal,
      is_new: !!item.is_new,
      specs: specsStr,
      technical_metadata: metadataStr,
      color_variants: colorsStr
    });
    
    setIsAddModalOpen(true);
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormJsonValid) {
      showToast("Please resolve JSON schema validation errors first.", "error");
      return;
    }
    setSubmittingProduct(true);
    try {
      const payload: any = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: formData.images,
        description: formData.description,
        is_deal: formData.is_deal,
        category: formData.category
      };

      if (addType === "hardware") {
        payload.discount_price = Number(formData.discount_price || 0);
        payload.is_new = formData.is_new;
        
        let specsObj = JSON.parse(formData.specs);
        if (formData.category === "Case" && typeof specsObj.motherboardSupport === "string") {
          specsObj.motherboardSupport = specsObj.motherboardSupport.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        payload.specs = specsObj;
      } else {
        payload.tagline = formData.tagline;
        payload.original_price = Number(formData.original_price || formData.price);
        payload.sub_category = formData.sub_category;
        payload.badge = formData.badge;
        payload.technical_metadata = JSON.parse(formData.technical_metadata);
        payload.color_variants = JSON.parse(formData.color_variants);
        payload.specs = JSON.parse(formData.specs);
        payload.features = [];
      }

      if (editingProductId) {
        const res = await updateProductAction(editingProductId, addType, payload);
        if (res.success && res.data) {
          showToast("Product structural metadata updated successfully.", "success");
          if (addType === "laptop") {
            setLaptops(prev => prev.map(p => p.id === editingProductId ? res.data : p));
          } else {
            setHardware(prev => prev.map(p => p.id === editingProductId ? res.data : p));
          }
          setIsAddModalOpen(false);
          setEditingProductId(null);
        } else {
          showToast(res.error || "Failed to update product node.", "error");
        }
      } else {
        const res = await addNewProductAction(addType, payload);
        if (res.success && res.data) {
          showToast("New product successfully cataloged to cloud matrix.", "success");
          if (addType === "laptop") {
            setLaptops(prev => [res.data, ...prev]);
          } else {
            setHardware(prev => [res.data, ...prev]);
          }
          setIsAddModalOpen(false);
        } else {
          showToast(res.error || "Failed to catalog new product.", "error");
        }
      }
    } catch {
      showToast("Fatal error during submission sequence.", "error");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // ──── احتساب الإحصائيات (Analytics) ────
  const deliveredOrders = orders.filter(o => o.status.toLowerCase() === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const activeUsersCount = Array.from(new Set(orders.map(o => o.customer_email))).length;
  const lowStockItemsCount = [...laptops, ...hardware].filter(item => item.stock < 5).length;

  // احتساب متوسط قيمة الطلب (Average Order Value - AOV)
  const averageOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

  // جرد وتجميع المنتجات الأكثر مبيعاً (Top Selling Products)
  const getTopSellingProducts = () => {
    const productMap: { [name: string]: { name: string; count: number; total: number; brand: string } } = {};
    
    orders.forEach(order => {
      if (order.status.toLowerCase() !== "cancelled") {
        (order.order_items || []).forEach((item: any) => {
          if (productMap[item.product_name]) {
            productMap[item.product_name].count += item.quantity;
            productMap[item.product_name].total += item.price * item.quantity;
          } else {
            productMap[item.product_name] = {
              name: item.product_name,
              count: item.quantity,
              total: item.price * item.quantity,
              brand: item.product_type || ""
            };
          }
        });
      }
    });
    
    return Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const getSalesTimelineData = () => {
    const dailyMap: { [date: string]: { date: string; revenue: number; ordersCount: number } } = {};
    const sortedOrders = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    sortedOrders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const amount = (o.status.toLowerCase() === "delivered" || o.status.toLowerCase() === "processing" || o.status.toLowerCase() === "shipped") ? o.total_amount : 0;
      
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].revenue += amount;
        dailyMap[dateStr].ordersCount += 1;
      } else {
        dailyMap[dateStr] = { date: dateStr, revenue: amount, ordersCount: 1 };
      }
    });

    const timelineData = Object.values(dailyMap);
    if (analyticsTimeframe === "7d") return timelineData.slice(-7);
    if (analyticsTimeframe === "30d") return timelineData.slice(-30);
    return timelineData;
  };

  const getStockCompositionData = () => {
    const categoryMap: { [key: string]: number } = {};
    laptops.forEach(l => {
      const cat = l.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    hardware.forEach(h => {
      const cat = h.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    return Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  };

  const CHART_COLORS = ["#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#ec4899", "#14b8a6"];

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: t.bg }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style={{ borderColor: t.accentText, borderTopColor: "transparent" }} />
        <p className="hf text-lg font-bold tracking-wider animate-pulse" style={{ color: t.text }}>SECURE SHIELD LINKING...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: t.bg }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#ef4444" }} />
        <CinematicReveal>
          <div className="max-w-md w-full text-center border p-8 rounded-3xl backdrop-blur-xl relative z-10" style={{ background: t.cardBg, borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-red-500/10" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <h1 className="hf text-2xl font-extrabold tracking-wider mb-3 uppercase" style={{ color: "#ef4444" }}>RESTRICTED SECTOR</h1>
            <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: t.textSecondary }}>
              This domain is secured with role-based firewall settings. Unauthorized attempts are logged.
            </p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text }}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Return to Sanctuary
            </button>
          </div>
        </CinematicReveal>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8 relative transition-all duration-300 ${isAddModalOpen ? "z-[100]" : "z-10"}`} 
      style={{ background: t.bg }}
    >
      {/* Header */}
      <CinematicReveal delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: t.borderLight }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ background: `${t.accentText}15`, color: t.accentText }}>
                SYSTEM ROOT ACCESS
              </span>
            </div>
            <h1 className="hf text-3xl font-extrabold tracking-tight" style={{ color: t.text }}>Sigma Command Center</h1>
            <p className="text-xs font-semibold mt-1" style={{ color: t.textSecondary }}>Manage live inventory, fulfill checkout requests, and monitor matrix metrics.</p>
          </div>
          
          <div className="flex p-1.5 rounded-xl border backdrop-blur-md self-start md:self-center" style={{ background: t.cardBg, borderColor: t.borderLight }}>
            <button
              onClick={() => setActiveTab("analytics")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "analytics" ? t.accentText : "transparent",
                color: activeTab === "analytics" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faChartLine} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "orders" ? t.accentText : "transparent",
                color: activeTab === "orders" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faClipboardList} /> Orders HUD
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2"
              style={{
                background: activeTab === "inventory" ? t.accentText : "transparent",
                color: activeTab === "inventory" ? "#fff" : t.textSecondary
              }}
            >
              <FontAwesomeIcon icon={faWarehouse} /> Inventory
            </button>
          </div>
        </div>
      </CinematicReveal>

      {loadingData && (
        <div className="flex items-center justify-center p-8 rounded-3xl border border-dashed animate-pulse" style={{ background: t.cardBg, borderColor: t.borderLight }}>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg mr-3" style={{ color: t.accentText }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: t.textSecondary }}>SYNCING LIVE MATRIX DATA...</span>
        </div>
      )}

      {!loadingData && (
        <AnimatePresence mode="wait">
          {/* TAB 1: ANALYTICS */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
                {[
                  { label: "Total Matrix Revenue", value: `$${totalRevenue.toLocaleString()}`, desc: "From completed orders", icon: faDollarSign, color: "#10b981" },
                  { label: "Average Order Value", value: `$${Math.round(averageOrderValue).toLocaleString()}`, desc: "Delivered basket size", icon: faBoxes, color: "#06b6d4" },
                  { label: "Matrix Users", value: activeUsersCount.toString(), desc: "Unique buyer accounts", icon: faUsers, color: "#a855f7" },
                  { label: "Critical Stock Warning", value: lowStockItemsCount.toString(), desc: "Products under 5 units", icon: faClipboardList, color: "#f59e0b" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textSubtle }}>{stat.label}</p>
                        <h3 className="hf text-2xl font-extrabold" style={{ color: t.text }}>{stat.value}</h3>
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <FontAwesomeIcon icon={stat.icon} />
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: t.textSecondary }}>{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Revenue Trend Area Chart */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col min-h-[320px]" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="hf text-sm font-black uppercase tracking-wider" style={{ color: t.text }}>Fulfillment Revenue Trend</h3>
                    <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Chronological sales history mapped to dates</p>
                  </div>
                  {/* الفلتر الزمني الديناميكي */}
                  <div className="flex p-0.5 rounded-lg border text-[9px] font-bold bg-black/10" style={{ borderColor: t.borderLight }}>
                    {(["7d", "30d", "all"] as const).map(time => (
                      <button
                        key={time}
                        onClick={() => setAnalyticsTimeframe(time)}
                        className={`px-2 py-1 rounded transition-all duration-300 uppercase`}
                        style={{
                          background: analyticsTimeframe === time ? t.accentText : "transparent",
                          color: analyticsTimeframe === time ? "#fff" : t.textSecondary
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-grow w-full h-[220px]">
                  {getSalesTimelineData().length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>No transaction data available yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getSalesTimelineData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                        <XAxis dataKey="date" stroke={t.textSecondary} fontSize={10} tickLine={false} />
                        <YAxis stroke={t.textSecondary} fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isDark ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
                            borderColor: t.borderLight,
                            borderRadius: "12px",
                            fontSize: "10px"
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Catalog Composition Bar Chart */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col min-h-[320px]" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="mb-4">
                  <h3 className="hf text-sm font-black uppercase tracking-wider" style={{ color: t.text }}>Catalog Composition</h3>
                  <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Ratio of laptops to hardware component inventory records</p>
                </div>
                <div className="flex-grow w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getStockCompositionData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="name" stroke={t.textSecondary} fontSize={10} tickLine={false} />
                      <YAxis stroke={t.textSecondary} fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
                          borderColor: t.borderLight,
                          borderRadius: "12px",
                          fontSize: "10px"
                        }}
                      />
                      <Bar dataKey="count" name="Item Count" radius={[6, 6, 0, 0]}>
                        {getStockCompositionData().map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Dispatch Matrix */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <h3 className="hf text-sm font-black uppercase tracking-wider mb-4" style={{ color: t.text }}>Order Dispatch Matrix</h3>
                <div className="flex flex-col gap-3 flex-grow justify-center">
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => {
                    const count = orders.filter(o => o.status.toLowerCase() === status).length;
                    const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    
                    let barColor = t.accentText;
                    if (status === "delivered") barColor = "#10b981";
                    if (status === "cancelled") barColor = "#ef4444";
                    if (status === "processing") barColor = "#f59e0b";
                    if (status === "shipped") barColor = "#06b6d4";

                    return (
                      <div key={status} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase">
                          <span style={{ color: t.textSecondary }}>{status}</span>
                          <span style={{ color: t.text }}>{count} ({Math.round(pct)}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selling Products Component */}
              <div className="md:col-span-2 p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <h3 className="hf text-sm font-black uppercase tracking-wider mb-4" style={{ color: t.text }}>Top Selling Products</h3>
                <div className="flex flex-col gap-3 flex-grow justify-start">
                  {getTopSellingProducts().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: t.borderLight, background: t.bgSecondary }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: t.text }}>{item.name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: t.textSubtle }}>Type: {item.brand || "Physical Asset"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black" style={{ color: t.accentText }}>x{item.count}</p>
                        <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>${item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {getTopSellingProducts().length === 0 && (
                    <div className="text-center py-10 flex-grow flex flex-col justify-center items-center">
                      <p className="text-xs font-bold" style={{ color: t.textSecondary }}>No sales data calculated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ORDERS HUD */}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <input
                  type="text"
                  placeholder="Search orders by customer name, email or tracking..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
                  style={{
                    background: t.cardBg,
                    borderColor: t.borderLight,
                    color: t.text,
                  }}
                />
              </div>

              <div className="border rounded-2xl overflow-visible backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
                        <th className="py-4 px-6">Tracking ID</th>
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Total Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
                      {(() => {
                        const filtered = orders.filter(o => 
                          o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.tracking_number.toLowerCase().includes(orderSearchQuery.toLowerCase())
                        );
                        const sliced = filtered.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);

                        if (sliced.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-xs font-semibold" style={{ color: t.textSecondary }}>
                                No order logs match the search query.
                              </td>
                            </tr>
                          );
                        }

                        return sliced.map(order => {
                          let badgeBg = "rgba(168,85,247,0.1)";
                          let badgeText = "#a855f7";
                          if (order.status.toLowerCase() === "pending") { badgeBg = "rgba(148,163,184,0.1)"; badgeText = "#94a3b8"; }
                          else if (order.status.toLowerCase() === "processing") { badgeBg = "rgba(245,158,11,0.1)"; badgeText = "#f59e0b"; }
                          else if (order.status.toLowerCase() === "shipped") { badgeBg = "rgba(6,182,212,0.1)"; badgeText = "#06b6d4"; }
                          else if (order.status.toLowerCase() === "delivered") { badgeBg = "rgba(16,185,129,0.1)"; badgeText = "#10b981"; }
                          else if (order.status.toLowerCase() === "cancelled") { badgeBg = "rgba(239,68,68,0.1)"; badgeText = "#ef4444"; }

                          return (
                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{order.tracking_number}</td>
                              <td className="py-4 px-6">
                                <p className="font-bold" style={{ color: t.text }}>{order.customer_name}</p>
                                <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>{order.customer_email}</p>
                              </td>
                              <td className="py-4 px-6" style={{ color: t.textSecondary }}>
                                {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${order.total_amount.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: badgeBg, color: badgeText }}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right flex items-center justify-end gap-3 overflow-visible">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                                  style={{ borderColor: t.borderLight, color: t.text }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                
                                <div className="relative status-dropdown-container overflow-visible">
                                  {/* استبدال الـ Dropdown اليدوي الذي كان يُقص بالـ Styled Native Select الحصين والمقاوم تماماً للقص */}
                                  <select
                                    value={order.status}
                                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase outline-none cursor-pointer bg-transparent transition-all"
                                    style={{ borderColor: t.borderLight, color: t.textSecondary }}
                                  >
                                    {["pending", "processing", "shipped", "delivered", "cancelled"].map(st => (
                                      <option key={st} value={st} className="bg-neutral-900 text-white font-semibold uppercase text-[10px]">
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Pagination */}
              {(() => {
                const filtered = orders.filter(o => 
                  o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                  o.tracking_number.toLowerCase().includes(orderSearchQuery.toLowerCase())
                );
                const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                if (totalPages <= 1) return null;

                return (
                  <div className="flex justify-center items-center gap-3 mt-4">
                    <button
                      onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                      disabled={ordersPage === 1}
                      className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30"
                      style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setOrdersPage(i + 1)}
                          className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                          style={{
                            background: (i + 1) === ordersPage ? t.accentText : t.cardBg,
                            border: `1px solid ${t.borderLight}`,
                            color: (i + 1) === ordersPage ? "#fff" : t.textSecondary
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setOrdersPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={ordersPage === totalPages}
                      className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all disabled:opacity-30"
                      style={{ background: t.cardBg, borderColor: t.borderLight, color: t.text }}
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex p-1 rounded-xl border" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                  <button 
                    onClick={() => setInventoryType("laptop")}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: inventoryType === "laptop" ? t.accentText : "transparent",
                      color: inventoryType === "laptop" ? "#fff" : t.textSecondary
                    }}
                  >
                    Laptops
                  </button>
                  <button 
                    onClick={() => setInventoryType("hardware")}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: inventoryType === "hardware" ? t.accentText : "transparent",
                      color: inventoryType === "hardware" ? "#fff" : t.textSecondary
                    }}
                  >
                    Hardware Components
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingProductId(null);
                    setFormData(inventoryType === "laptop" ? DEFAULT_LAPTOP_FORM : DEFAULT_HARDWARE_FORM);
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                  style={{ background: t.accentText, color: "#fff" }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add New Product
                </button>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={inventorySearchQuery}
                  onChange={e => setInventorySearchQuery(e.target.value)}
                  className="w-full sm:max-w-md px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
                  style={{
                    background: t.cardBg,
                    borderColor: t.borderLight,
                    color: t.text,
                  }}
                />
              </div>

              <div className="border rounded-2xl overflow-hidden backdrop-blur-md" style={{ background: t.cardBg, borderColor: t.borderLight }}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b text-[10px] font-black uppercase tracking-wider" style={{ borderColor: t.borderLight, color: t.textSubtle }}>
                        <th className="py-4 px-6">Product ID</th>
                        <th className="py-4 px-6">Product Name</th>
                        <th className="py-4 px-6">Brand</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock Status</th>
                        <th className="py-4 px-6 text-center">Fulfillment Stock</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs font-medium" style={{ borderColor: t.borderLight }}>
                      {(() => {
                        const items = inventoryType === "laptop" ? laptops : hardware;
                        const filtered = items.filter(item => 
                          item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(inventorySearchQuery.toLowerCase())
                        );
                        const sliced = filtered.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE);

                        if (sliced.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-xs font-semibold" style={{ color: t.textSecondary }}>
                                No products cataloged in this matrix coordinate.
                              </td>
                            </tr>
                          );
                        }

                        return sliced.map(item => {
                          const isLow = item.stock < 5 && item.stock > 0;
                          const isOut = item.stock === 0;

                          return (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-mono font-bold" style={{ color: t.textSecondary }}>{item.id}</td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>{item.name}</td>
                              <td className="py-4 px-6" style={{ color: t.textSecondary }}>{item.brand}</td>
                              <td className="py-4 px-6 font-bold" style={{ color: t.text }}>${item.price.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span 
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                                  style={{ 
                                    background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                    color: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981"
                                  }}
                                >
                                  {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {editingStockId === item.id ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <input 
                                      type="number"
                                      value={tempStockValue}
                                      onChange={e => setTempStockValue(parseInt(e.target.value) || 0)}
                                      className="w-16 px-2 py-1 rounded border text-center font-bold bg-black/40 text-white"
                                      style={{ borderColor: t.borderLight }}
                                    />
                                    <button 
                                      onClick={() => handleUpdateStock(item.id, inventoryType, tempStockValue)}
                                      className="w-7 h-7 rounded bg-green-500/10 text-green-500 flex items-center justify-center"
                                      disabled={savingStock}
                                    >
                                      {savingStock ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
                                    </button>
                                    <button onClick={() => setEditingStockId(null)} className="w-7 h-7 rounded bg-red-500/10 text-red-500 flex items-center justify-center">
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setEditingStockId(item.id);
                                      setTempStockValue(item.stock);
                                    }}
                                    className="px-3 py-1.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 text-[10px] mx-auto hover:bg-white/5"
                                    style={{ borderColor: t.borderLight, color: t.textSecondary }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} /> {item.stock} Units
                                  </button>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleStartEditProduct(item, inventoryType)} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-[10px] uppercase">
                                    <FontAwesomeIcon icon={faEdit} /> Edit
                                  </button>
                                  <button onClick={() => handleDeleteProduct(item.id, inventoryType)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 font-bold text-[10px] uppercase">
                                    <FontAwesomeIcon icon={faTimes} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* DETAIL MODAL FOR ORDER DETAIL VIEW */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            // رفع الـ z-index ليصبح فوق الـ Header بالكامل بنسبة 100%
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }} 
              className="max-w-2xl w-full rounded-3xl border p-6 backdrop-blur-xl flex flex-col gap-6" 
              style={{ 
                // جعل الخلفية صلبة وواضحة جداً بنسبة 0.98 لإنهاء مشكلة تداخل لون الـ Backdrop الرمادي تماماً
                background: isDark ? "rgba(20, 20, 20, 0.98)" : "rgba(255, 255, 255, 0.98)", 
                borderColor: t.borderLight 
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400">Order Detail View</span>
                  <h3 className="hf text-xl font-extrabold" style={{ color: t.text }}>{selectedOrder.tracking_number}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: t.borderLight, color: t.text }}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border flex flex-col gap-2" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                  <p className="text-[10px] font-black uppercase text-neutral-400">Shipping & Customer</p>
                  <p className="text-xs font-bold" style={{ color: t.text }}>{selectedOrder.customer_name}</p>
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Email: {selectedOrder.customer_email}</p>
                  <p className="text-xs font-semibold" style={{ color: t.textSecondary }}>Phone: {selectedOrder.customer_phone}</p>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: t.textSecondary }}>Address: {selectedOrder.shipping_address}</p>
                </div>

                <div className="p-4 rounded-xl border flex flex-col gap-3 justify-between" style={{ borderColor: t.borderSubtle, background: t.bgSecondary }}>
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Fulfillment Status</p>
                    <select 
                      value={selectedOrder.status}
                      onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-xs font-bold uppercase outline-none bg-black/40 text-white font-semibold"
                      style={{ borderColor: t.borderLight }}
                    >
                      {["pending", "processing", "shipped", "delivered", "cancelled"].map(status => (
                        <option key={status} value={status} className="bg-neutral-900 text-white">{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-neutral-400">Transaction Amount</p>
                    <p className="hf text-xl font-black" style={{ color: t.text }}>${selectedOrder.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase text-neutral-400">Ordered Items</p>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {(selectedOrder.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border" style={{ borderColor: t.borderSubtle }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: t.text }}>{item.product_name}</p>
                        <p className="text-[10px] font-semibold" style={{ color: t.textSecondary }}>Price: ${item.price.toLocaleString()}</p>
                      </div>
                      <span className="text-xs font-black" style={{ color: t.accentText }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-hidden">
            <motion.div 
              initial={{ scale: 0.95, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 30 }} 
              className="max-w-3xl w-full rounded-3xl border p-6 backdrop-blur-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-6 shadow-2xl relative scrollbar-thin"
              style={{ 
                background: isDark ? "rgba(20, 20, 20, 0.98)" : "rgba(255, 255, 255, 0.98)", 
                borderColor: t.borderLight,
                color: t.text
              }}
            >
              <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: t.borderLight }}>
                <div>
                  <h3 className="hf text-xl font-black uppercase" style={{ color: t.text }}>
                    {editingProductId ? "Update Specifications" : "Catalog New Product"}
                  </h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ borderColor: t.borderLight, color: t.text }}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-6 text-xs font-bold">
                {/* Segmented control */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase text-neutral-400">Product Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border" style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)", borderColor: t.borderLight }}>
                    <button 
                      type="button" 
                      disabled={!!editingProductId}
                      onClick={() => setAddType("laptop")}
                      className={`py-2 rounded-lg text-xs font-black uppercase`}
                      style={{
                        background: addType === "laptop" ? t.accentText : "transparent",
                        color: addType === "laptop" ? "#fff" : t.textSecondary,
                      }}
                    >
                      Laptop
                    </button>
                    <button 
                      type="button" 
                      disabled={!!editingProductId}
                      onClick={() => setAddType("hardware")}
                      className={`py-2 rounded-lg text-xs font-black uppercase`}
                      style={{
                        background: addType === "hardware" ? t.accentText : "transparent",
                        color: addType === "hardware" ? "#fff" : t.textSecondary,
                      }}
                    >
                      Hardware Component
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Product Name</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Brand</label>
                    <input 
                      type="text" required
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Retail Price ($)</label>
                    <input 
                      type="number" required min="1"
                      value={formData.price || ""}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">
                      {addType === "laptop" ? "Original Price ($)" : "Discount Price ($)"}
                    </label>
                    <input 
                      type="number"
                      value={(addType === "laptop" ? formData.original_price : formData.discount_price) || ""}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setFormData(addType === "laptop" ? { ...formData, original_price: val } : { ...formData, discount_price: val });
                      }}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Stock Units</label>
                    <input 
                      type="number" required min="0"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                </div>

                {addType === "laptop" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Tagline</label>
                    <input 
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData({...formData, tagline: e.target.value})}
                      className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                      style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-neutral-400">Category Name</label>
                    {addType === "hardware" ? (
                      <select
                        required
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value, specs: "{}" })}
                        className="px-4 py-3 rounded-xl border outline-none bg-black/40 text-white font-semibold"
                        style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                      >
                        <option value="CPU" className="bg-neutral-900 text-white">CPU</option>
                        <option value="GPU" className="bg-neutral-900 text-white">GPU</option>
                        <option value="Motherboard" className="bg-neutral-900 text-white">Motherboard</option>
                        <option value="RAM" className="bg-neutral-900 text-white">RAM</option>
                        <option value="Storage" className="bg-neutral-900 text-white">Storage</option>
                        <option value="Case" className="bg-neutral-900 text-white">Case</option>
                        <option value="Monitor" className="bg-neutral-900 text-white">Monitor</option>
                      </select>
                    ) : (
                      <input 
                        type="text" required
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                        style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                      />
                    )}
                  </div>
                  {addType === "laptop" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase text-neutral-400">Subcategory ID</label>
                      <input 
                        type="text"
                        value={formData.sub_category}
                        onChange={e => setFormData({...formData, sub_category: e.target.value})}
                        className="px-4 py-3 rounded-xl border outline-none font-semibold" 
                        style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase text-neutral-400">Images (Separated by comma)</label>
                  <textarea 
                    rows={2} required
                    value={formData.images}
                    onChange={e => setFormData({...formData, images: e.target.value})}
                    className="px-4 py-3 rounded-xl border outline-none font-mono text-xs font-semibold" 
                    style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black uppercase text-neutral-400">Description</label>
                  <textarea 
                    rows={3} required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="px-4 py-3 rounded-xl border outline-none font-semibold leading-relaxed" 
                    style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                  />
                </div>

                {/* VISUAL BUILDER SECTIONS */}
                <div className="flex flex-col gap-6 border-t pt-6" style={{ borderColor: t.borderLight }}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: t.text }}>
                          {addType === "laptop" ? "Display Specs (HUD Badges)" : "Component Specifications"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex p-0.5 rounded-lg border text-[10px] font-bold bg-black/10" style={{ borderColor: t.borderLight }}>
                          <button
                            type="button"
                            onClick={() => isSpecsValid && setSpecsEditorMode("visual")}
                            className={`px-2.5 py-1 rounded-md transition-all duration-300 ${specsEditorMode === "visual" && isSpecsValid ? "bg-cyan-500 text-white font-black" : "text-neutral-400"}`}
                            disabled={!isSpecsValid}
                          >
                            Visual Builder
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpecsEditorMode("json")}
                            className={`px-2.5 py-1 rounded-md transition-all duration-300 ${specsEditorMode === "json" ? "bg-cyan-500 text-white font-black" : "text-neutral-400"}`}
                          >
                            Raw JSON
                          </button>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isSpecsValid ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500 animate-pulse"}`}>
                          {isSpecsValid ? "✓ Valid" : "✗ Error"}
                        </span>
                      </div>
                    </div>

                    {specsEditorMode === "visual" && isSpecsValid ? (
                      addType === "laptop" ? (
                        <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(15, 23, 42, 0.04)", borderColor: t.borderLight }}>
                          <div className="flex flex-col gap-2">
                            {getParsedSpecs().map((spec: any, idx: number) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="text" placeholder="Label (e.g. CPU)"
                                  value={spec.label || ""}
                                  onChange={e => {
                                    const arr = getParsedSpecs();
                                    arr[idx] = { ...arr[idx], label: e.target.value };
                                    updateParsedSpecs(arr);
                                  }}
                                  className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                  style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                />
                                <input
                                  type="text" placeholder="Value (e.g. RTX 4060)"
                                  value={spec.value || ""}
                                  onChange={e => {
                                    const arr = getParsedSpecs();
                                    const val = e.target.value;
                                    const raw = val.toLowerCase().replace(/[^a-z0-9]+/g, '');
                                    arr[idx] = { ...arr[idx], value: val, raw_value: spec.raw_value || raw };
                                    updateParsedSpecs(arr);
                                  }}
                                  className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                  style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                />
                                <input
                                  type="text" placeholder="Raw (Fulfillment Key)"
                                  value={spec.raw_value || ""}
                                  onChange={e => {
                                    const arr = getParsedSpecs();
                                    arr[idx] = { ...arr[idx], raw_value: e.target.value };
                                    updateParsedSpecs(arr);
                                  }}
                                  className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                  style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                />
                                <select
                                  value={spec.color || "cyan"}
                                  onChange={e => {
                                    const arr = getParsedSpecs();
                                    arr[idx] = { ...arr[idx], color: e.target.value };
                                    updateParsedSpecs(arr);
                                  }}
                                  className="px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none"
                                  style={{ borderColor: t.borderLight }}
                                >
                                  {["cyan", "green", "blue", "purple", "red", "orange", "gold"].map(c => (
                                    <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const arr = getParsedSpecs();
                                    arr.splice(idx, 1);
                                    updateParsedSpecs(arr);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center transition-all"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const arr = getParsedSpecs();
                              arr.push({ label: "", value: "", color: "cyan", raw_value: "" });
                              updateParsedSpecs(arr);
                            }}
                            className="py-2.5 rounded-xl border border-dashed text-[10px] font-bold uppercase text-cyan-400"
                            style={{ borderColor: t.borderLight }}
                          >
                            <FontAwesomeIcon icon={faPlus} /> Add Display Spec Badge
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 p-4 rounded-2xl border" style={{ background: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(15, 23, 42, 0.04)", borderColor: t.borderLight }}>
                          {HARDWARE_SCHEMAS[formData.category] ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4 mb-2" style={{ borderColor: t.borderLight }}>
                              {HARDWARE_SCHEMAS[formData.category].map((field) => {
                                const val = getParsedHardwareSpecs()[field.key];
                                return (
                                  <div key={field.key} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-neutral-400">{field.label}</label>
                                    {field.type === "boolean" ? (
                                      <label className="flex items-center gap-2 cursor-pointer py-2.5 px-3 rounded-xl border text-xs" style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}>
                                        <input
                                          type="checkbox"
                                          checked={!!val}
                                          onChange={e => {
                                            const obj = getParsedHardwareSpecs();
                                            obj[field.key] = e.target.checked;
                                            updateParsedHardwareSpecs(obj);
                                          }}
                                          className="rounded bg-black/40 border-white/10 text-cyan-500 w-4 h-4"
                                        />
                                        <span>Included</span>
                                      </label>
                                    ) : field.type === "select" ? (
                                      <select
                                        value={val || ""}
                                        onChange={e => {
                                          const obj = getParsedHardwareSpecs();
                                          obj[field.key] = e.target.value;
                                          updateParsedHardwareSpecs(obj);
                                        }}
                                        className="px-3 py-2 text-xs rounded-xl border bg-black/40 text-white outline-none"
                                        style={{ borderColor: t.borderLight }}
                                      >
                                        <option value="" className="bg-neutral-900 text-white">Select...</option>
                                        {field.options?.map(opt => (
                                          <option key={opt} value={opt} className="bg-neutral-900 text-white">{opt}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={field.type}
                                        placeholder={field.placeholder || ""}
                                        value={val === undefined ? "" : val}
                                        onChange={e => {
                                          const obj = getParsedHardwareSpecs();
                                          obj[field.key] = field.type === "number" ? (Number(e.target.value) || 0) : e.target.value;
                                          updateParsedHardwareSpecs(obj);
                                        }}
                                        className="px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                        style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400">Custom Fields</label>
                            {Object.entries(getParsedHardwareSpecs())
                              .filter(([k]) => !HARDWARE_SCHEMAS[formData.category]?.some(f => f.key === k))
                              .map(([k, v]: [string, any]) => (
                                <div key={k} className="flex gap-2 items-center">
                                  <input
                                    type="text" placeholder="Spec Key"
                                    value={k}
                                    onChange={e => {
                                      const obj = getParsedHardwareSpecs();
                                      const newKey = e.target.value;
                                      if (newKey && newKey !== k) {
                                        obj[newKey] = v;
                                        delete obj[k];
                                        updateParsedHardwareSpecs(obj);
                                      }
                                    }}
                                    className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                    style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                  />
                                  <input
                                    type="text" placeholder="Spec Value"
                                    value={v === null || v === undefined ? "" : String(v)}
                                    onChange={e => {
                                      const obj = getParsedHardwareSpecs();
                                      obj[k] = e.target.value;
                                      updateParsedHardwareSpecs(obj);
                                    }}
                                    className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                    style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const obj = getParsedHardwareSpecs();
                                      delete obj[k];
                                      updateParsedHardwareSpecs(obj);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center transition-all"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </div>
                              ))}
                            <button
                              type="button"
                              onClick={() => {
                                const obj = getParsedHardwareSpecs();
                                let counter = 1;
                                while (obj[`custom_spec_${counter}`] !== undefined) counter++;
                                obj[`custom_spec_${counter}`] = "";
                                updateParsedHardwareSpecs(obj);
                              }}
                              className="py-2.5 rounded-xl border border-dashed text-[10px] font-bold uppercase text-cyan-400"
                              style={{ borderColor: t.borderLight }}
                            >
                              <FontAwesomeIcon icon={faPlus} /> Add Custom Field
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <textarea
                        rows={5} required
                        value={formData.specs}
                        onChange={e => setFormData({...formData, specs: e.target.value})}
                        className="px-4 py-3 rounded-xl border outline-none font-mono text-[10px] leading-relaxed w-full bg-black/50 text-emerald-400"
                        style={{ borderColor: t.borderLight }}
                      />
                    )}
                  </div>

                  {addType === "laptop" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: t.text }}>Internal Technical Specs</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex p-0.5 rounded-lg border text-[10px] font-bold bg-black/10" style={{ borderColor: t.borderLight }}>
                            <button
                              type="button"
                              onClick={() => isMetadataValid && setMetadataEditorMode("visual")}
                              className={`px-2.5 py-1 rounded-md transition-all duration-300 ${metadataEditorMode === "visual" && isMetadataValid ? "bg-cyan-500 text-white font-black" : "text-neutral-400"}`}
                              disabled={!isMetadataValid}
                            >
                              Visual Builder
                            </button>
                            <button
                              type="button"
                              onClick={() => setMetadataEditorMode("json")}
                              className={`px-2.5 py-1 rounded-md transition-all duration-300 ${metadataEditorMode === "json" ? "bg-cyan-500 text-white font-black" : "text-neutral-400"}`}
                            >
                              Raw JSON
                            </button>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isMetadataValid ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500 animate-pulse"}`}>
                            {isMetadataValid ? "✓ Valid" : "✗ Error"}
                          </span>
                        </div>
                      </div>

                      {metadataEditorMode === "visual" && isMetadataValid ? (
                        <div className="flex flex-col gap-4 p-4 rounded-2xl border" style={{ background: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(15, 23, 42, 0.04)", borderColor: t.borderLight }}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4 mb-2" style={{ borderColor: t.borderLight }}>
                            {METADATA_FIELDS_INFO.map(field => {
                              const val = getParsedMetadata()[field.key];
                              return (
                                <div key={field.key} className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-black uppercase text-neutral-400">{field.label}</label>
                                  <input
                                    type={field.type === "number" ? "number" : "text"}
                                    placeholder={field.placeholder}
                                    value={val === undefined ? "" : field.type === "array" && Array.isArray(val) ? val.join(", ") : val}
                                    onChange={e => {
                                      const obj = getParsedMetadata();
                                      if (field.type === "number") {
                                        obj[field.key] = Number(e.target.value) || 0;
                                      } else if (field.type === "array") {
                                        obj[field.key] = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                      } else {
                                        obj[field.key] = e.target.value;
                                      }
                                      updateParsedMetadata(obj);
                                    }}
                                    className="px-3 py-2 text-xs rounded-xl border outline-none font-semibold"
                                    style={{ backgroundColor: t.bgSecondary, borderColor: t.borderLight, color: t.text }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <textarea
                          rows={5} required
                          value={formData.technical_metadata}
                          onChange={e => setFormData({...formData, technical_metadata: e.target.value})}
                          className="px-4 py-3 rounded-xl border outline-none font-mono text-[10px] leading-relaxed w-full bg-black/50 text-emerald-400"
                          style={{ borderColor: t.borderLight }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-6 py-3 border-t border-b" style={{ borderColor: t.borderLight }}>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase" style={{ color: t.text }}>
                    <input 
                      type="checkbox"
                      checked={formData.is_deal}
                      onChange={e => setFormData({...formData, is_deal: e.target.checked})}
                      className="rounded bg-black/40 border-white/10 text-cyan-500 w-4 h-4"
                    />
                    <span>Hot Deal</span>
                  </label>
                  {addType === "hardware" && (
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black uppercase" style={{ color: t.text }}>
                      <input 
                        type="checkbox"
                        checked={formData.is_new}
                        onChange={e => setFormData({...formData, is_new: e.target.checked})}
                        className="rounded bg-black/40 border-white/10 text-cyan-500 w-4 h-4"
                      />
                      <span>Mark as Brand New</span>
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button" onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3.5 rounded-xl border text-[10px] font-black uppercase transition-all hover:bg-white/5"
                    style={{ borderColor: t.borderLight, color: t.text }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct || !isFormJsonValid}
                    className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all`}
                    style={{ 
                      background: isFormJsonValid ? t.accentText : "rgba(100,100,100,0.2)", 
                      color: isFormJsonValid ? "#fff" : "rgba(255,255,255,0.4)"
                    }}
                  >
                    {submittingProduct ? "Saving..." : (editingProductId ? "Update Specs" : "Save & Deploy")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast System Overlay */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[99999] pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let color = "#06b6d4";
            let border = "rgba(6, 182, 212, 0.2)";
            if (toast.type === "error") { color = "#ef4444"; border = "rgba(239, 68, 68, 0.2)"; }
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-auto px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 text-xs font-bold"
                style={{
                  background: isDark ? "rgba(12, 12, 12, 0.92)" : "rgba(255, 255, 255, 0.92)",
                  borderColor: border,
                  color: t.text
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom Confirmation Modal Overlay */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div className="max-w-md w-full rounded-3xl border p-6 backdrop-blur-xl flex flex-col gap-6" style={{ background: isDark ? "rgba(20, 20, 20, 0.96)" : "rgba(255, 255, 255, 0.96)", borderColor: t.borderLight }}>
              <div>
                <h4 className="hf text-base font-black uppercase text-red-500 mb-2">{confirmModal.title}</h4>
                <p className="text-xs font-medium leading-relaxed" style={{ color: t.textSecondary }}>{confirmModal.message}</p>
              </div>
              <div className="flex justify-end gap-3 text-[10px] font-black uppercase">
                <button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 rounded-xl border" style={{ borderColor: t.borderLight, color: t.text }}>Abort Action</button>
                <button onClick={confirmModal.onConfirm} className="px-6 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-500">Confirm Execute</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}