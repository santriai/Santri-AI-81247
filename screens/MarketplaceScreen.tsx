import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import {
  subscribeToMarketplaceProducts,
  addMarketplaceProduct,
  deleteMarketplaceProduct,
  reportMarketplaceProduct
} from '../services/firebase';
import {
  Search,
  ShoppingCart,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
  Star,
  MapPin,
  PlusCircle,
  X,
  ChevronRight,
  Heart,
  Store,
  CreditCard,
  PackageCheck,
  Flame,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Award,
  Bell,
  User,
  Wallet,
  Settings,
  CheckCircle2,
  Box,
  TrendingUp,
  Clock,
  Share2,
  HelpCircle,
  LogOut,
  Upload,
  Link,
  Globe,
  ExternalLink,
  Phone,
  Bookmark,
  Flag,
  AlertTriangle
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: 'kitab' | 'busana' | 'sholat' | 'herbal' | 'aksesoris';
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  soldCount: number;
  location: string;
  imageUrl: string;
  imageUrls?: string[];
  badge?: 'Santri Mall' | 'Star+' | 'Bazar Santri' | string;
  freeShipping: boolean;
  cashback: boolean;
  stock: number;
  sellerName: string;
  sellerAvatarUrl?: string;
  description: string;
  variations?: string[];
  whatsappNumber?: string;
  shopeeUrl?: string;
  tokopediaUrl?: string;
  externalUrl?: string;
}

const INITIAL_PRODUCTS: Product[] = [];

export interface CartItem {
  product: Product;
  quantity: number;
}

export const MarketplaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  // Navigation Tab State specifically for Toko Santri
  const [activeNavTab, setActiveNavTab] = useState<'beranda' | 'favorit' | 'jualan' | 'notifikasi' | 'saya'>('beranda');

  // Core Data States with Real-Time Firestore Persistence
  const [products, setProducts] = useState<Product[]>([]);

  // Subscribe to real-time Cloud Firestore products
  React.useEffect(() => {
    const unsubscribe = subscribeToMarketplaceProducts((firestoreProds) => {
      setProducts((firestoreProds || []) as Product[]);
    });
    return () => unsubscribe();
  }, []);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'priceLow' | 'priceHigh'>('popular');

  // Cart & Order State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDetailImageIdx, setSelectedDetailImageIdx] = useState<number>(0);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'shopeepay' | 'cod' | 'qris' | 'transfer'>('shopeepay');
  const [orders, setOrders] = useState<any[]>([]);

  // Report Product Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [productToReport, setProductToReport] = useState<Product | null>(null);
  const [reportReason, setReportReason] = useState('Penipuan / Toko Fiktif');

  // Deep Link & External Navigation Handler
  const handleOpenExternalLink = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url) return;
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    
    // Check if Android Native Interface function exists
    if (window.AndroidNativeInterface?.openExternalUrl) {
      try {
        window.AndroidNativeInterface.openExternalUrl(target);
        return;
      } catch (err) {
        console.warn("Gagal membuka link via AndroidNativeInterface.openExternalUrl:", err);
      }
    }
    if (window.AndroidNativeInterface?.openUrl) {
      try {
        window.AndroidNativeInterface.openUrl(target);
        return;
      } catch (err) {
        console.warn("Gagal membuka link via AndroidNativeInterface.openUrl:", err);
      }
    }

    try {
      const opened = window.open(target, '_system') || window.open(target, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        if (window.top && window.top !== window) {
          window.top.location.href = target;
        } else {
          window.location.href = target;
        }
      }
    } catch (err) {
      if (window.top && window.top !== window) {
        window.top.location.href = target;
      } else {
        window.location.href = target;
      }
    }
  };

  const handleOpenWhatsApp = (e: React.MouseEvent, rawPhone: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rawPhone) return;
    let targetUrl = '';
    if (rawPhone.startsWith('http://') || rawPhone.startsWith('https://')) {
      targetUrl = rawPhone;
    } else {
      const cleanNum = rawPhone.replace(/[^0-9]/g, '');
      const formattedNum = cleanNum.startsWith('0') ? '62' + cleanNum.substring(1) : cleanNum;
      targetUrl = `https://wa.me/${formattedNum}?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat dengan produk ${productName} di Toko Santri.`)}`;
    }

    if (window.AndroidNativeInterface?.openExternalUrl) {
      try {
        window.AndroidNativeInterface.openExternalUrl(targetUrl);
        return;
      } catch (err) {
        console.warn("Gagal membuka WA via AndroidNativeInterface.openExternalUrl:", err);
      }
    }
    if (window.AndroidNativeInterface?.openUrl) {
      try {
        window.AndroidNativeInterface.openUrl(targetUrl);
        return;
      } catch (err) {
        console.warn("Gagal membuka WA via AndroidNativeInterface.openUrl:", err);
      }
    }

    try {
      const opened = window.open(targetUrl, '_system') || window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        if (window.top && window.top !== window) {
          window.top.location.href = targetUrl;
        } else {
          window.location.href = targetUrl;
        }
      }
    } catch (err) {
      if (window.top && window.top !== window) {
        window.top.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    }
  };
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleOpenReportModal = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProductToReport(product);
    setReportReason('Penipuan / Toko Fiktif');
    setReportNote('');
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToReport) return;
    setIsSubmittingReport(true);
    try {
      await reportMarketplaceProduct(productToReport, reportReason, reportNote, user);
      showToast('Laporan Anda berhasil terkirim ke Tim Admin. Terima kasih!', 'success');
      setIsReportModalOpen(false);
      setProductToReport(null);
    } catch (err: any) {
      console.error("Error reporting product:", err);
      showToast('Gagal mengirim laporan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Notifications State
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'order' | 'promo' | 'seller';
  }>>([]);

  // Add Product Form State (Maksimal 2 Foto & Variasi)
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'kitab' | 'busana' | 'sholat' | 'herbal' | 'aksesoris'>('kitab');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductLocation, setNewProductLocation] = useState('Kab. Jombang');
  const [newProductImage1, setNewProductImage1] = useState('');
  const [newProductImageFile1, setNewProductImageFile1] = useState<string | null>(null);
  const [newProductImage2, setNewProductImage2] = useState('');
  const [newProductImageFile2, setNewProductImageFile2] = useState<string | null>(null);
  const [newProductVariations, setNewProductVariations] = useState('');
  const [newProductWa, setNewProductWa] = useState('');
  const [newProductShopee, setNewProductShopee] = useState('');
  const [newProductTokopedia, setNewProductTokopedia] = useState('');
  const [newProductExternal, setNewProductExternal] = useState('');

  // Helper untuk mengompres foto base64 agar ukuran dokumen Firestore tetap kecil (< 200KB)
  const compressBase64Image = (dataUrl: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleImageFileChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file foto 1 terlalu besar (maksimal 10MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressBase64Image(raw, 800, 800, 0.7);
        setNewProductImageFile1(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file foto 2 terlalu besar (maksimal 10MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressBase64Image(raw, 800, 800, 0.7);
        setNewProductImageFile2(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  // Share Product Handler
  const handleShareProduct = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
    const shareText = `*${product.name}*\nHarga: Rp${product.price.toLocaleString('id-ID')}\nPenjual: ${product.sellerName} (${product.location})\n\nDapatkan produk ini & penuhi kebutuhan santri di Aplikasi Kitab Kuning & Toko Santri AI!`;

    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText(product.name, `${shareText}\n\nDownload Aplikasi di Google Play Store:\n${playStoreUrl}`);
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: playStoreUrl,
        });
      } catch (err) {
        // ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\nDownload Aplikasi di Google Play Store:\n${playStoreUrl}`);
        showToast(`Detail produk "${product.name.slice(0, 20)}..." & link Play Store berhasil disalin!`, 'success');
      } catch (err) {
        showToast('Gagal menyalin link produk.', 'error');
      }
    }
  };

  // Cart Calculations
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Dihapus dari Favorit Toko Santri', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Ditambahkan ke Favorit Toko Santri!', 'success');
        return [...prev, productId];
      }
    });
  };

  const handleAddToCart = (product: Product, qty: number = 1, showToastNotify: boolean = true) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    if (showToastNotify) {
      showToast(`"${product.name.slice(0, 20)}..." masuk keranjang!`, 'success');
    }
  };

  const handleFinishOrder = () => {
    if (cartItems.length === 0) return;

    // 1. Simpan pesanan ke daftar pesanan
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: [...cartItems],
      totalPrice: totalCartPrice,
      paymentMethod,
      status: 'Dikemas'
    };
    setOrders(prev => [newOrder, ...prev]);

    // 2. Buat notifikasi pemberitahuan ke penjual
    const sellerNames = Array.from(new Set(cartItems.map(item => item.product.sellerName))).join(', ');
    const productSummary = cartItems.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');

    const sellerNotif = {
      id: `notif-${Date.now()}`,
      title: 'Pemberitahuan Pesanan Dikirim ke Penjual!',
      message: `Pesanan (${cartItems.length} barang) senilai Rp${totalCartPrice.toLocaleString('id-ID')} diselesaikan. Notifikasi pemberitahuan telah terkirim ke toko penjual (${sellerNames}) untuk item: ${productSummary}.`,
      time: 'Baru saja',
      type: 'seller' as const
    };
    setNotifications(prev => [sellerNotif, ...prev]);

    // 3. Bersihkan keranjang dan tutup drawer
    setCartItems([]);
    setIsCartOpen(false);

    // 4. Notifikasi Toast
    showToast('Pesanan Selesai! Pemberitahuan telah dikirimkan ke notifikasi penjual.', 'success');
  };

  const handleBuyFromCart = () => {
    if (cartItems.length === 0) return;

    cartItems.forEach(item => {
      let targetUrl = '';
      if (item.product.shopeeUrl) {
        targetUrl = item.product.shopeeUrl;
      } else if (item.product.tokopediaUrl) {
        targetUrl = item.product.tokopediaUrl;
      } else if (item.product.whatsappNumber) {
        const rawNum = item.product.whatsappNumber.replace(/[^0-9]/g, '');
        const cleanNum = rawNum.startsWith('0') ? '62' + rawNum.slice(1) : rawNum;
        targetUrl = item.product.whatsappNumber.startsWith('http')
          ? item.product.whatsappNumber
          : `https://wa.me/${cleanNum}?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat membeli produk ${item.product.name} (${item.quantity}x) di Toko Santri.`)}`;
      } else if (item.product.externalUrl) {
        targetUrl = item.product.externalUrl;
      } else {
        targetUrl = `https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat membeli produk ${item.product.name} dari ${item.product.sellerName} di Toko Santri.`)}`;
      }

      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    });

    showToast('Mengarahkan ke link URL penjual...', 'success');
  };

  const handleBuyNow = (product: Product) => {
    // 1. Otomatis simpan ke daftar simpan / keranjang
    handleAddToCart(product, 1, false);

    // 2. Tentukan link mana yang dipasang pemilik toko
    let targetUrl = '';
    if (product.shopeeUrl) {
      targetUrl = product.shopeeUrl;
    } else if (product.tokopediaUrl) {
      targetUrl = product.tokopediaUrl;
    } else if (product.whatsappNumber) {
      const rawNum = product.whatsappNumber.replace(/[^0-9]/g, '');
      const cleanNum = rawNum.startsWith('0') ? '62' + rawNum.slice(1) : rawNum;
      targetUrl = product.whatsappNumber.startsWith('http')
        ? product.whatsappNumber
        : `https://wa.me/${cleanNum}?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat membeli produk ${product.name} (Rp${product.price.toLocaleString('id-ID')}) di Toko Santri.`)}`;
    } else if (product.externalUrl) {
      targetUrl = product.externalUrl;
    } else {
      targetUrl = `https://wa.me/?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat membeli produk ${product.name} dari ${product.sellerName} di Toko Santri.`)}`;
    }

    showToast(`Produk disimpan & mengarahkan ke link toko penjual...`, 'success');
    setSelectedProduct(null);

    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) return;
    const newOrder = {
      id: `SANTRIPAY-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: [...cartItems],
      totalPrice: totalCartPrice,
      paymentMethod,
      status: 'Dikemas'
    };
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    showToast('Pesanan berhasil dibuat! Penjual Toko Santri siap mengirimkan barang.', 'success');
    setActiveNavTab('saya');
  };

  const handleAddCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) {
      showToast('Harap isi nama dan harga produk!', 'error');
      return;
    }

    const hasAtLeastOneLink = newProductWa.trim() || newProductShopee.trim() || newProductTokopedia.trim() || newProductExternal.trim();
    if (!hasAtLeastOneLink) {
      showToast('Harap isi minimal 1 link penjualan / kontak (WhatsApp, Shopee, Tokopedia, atau Website)!', 'warning');
      return;
    }

    let rawImg1 = newProductImageFile1 || newProductImage1 || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
    let rawImg2 = newProductImageFile2 || newProductImage2 || '';

    // Kompres jika berupa Data URL (base64)
    if (rawImg1.startsWith('data:image')) {
      rawImg1 = await compressBase64Image(rawImg1, 800, 800, 0.6);
    }
    if (rawImg2.startsWith('data:image')) {
      rawImg2 = await compressBase64Image(rawImg2, 800, 800, 0.6);
    }

    const collectedImages = [rawImg1];
    if (rawImg2) collectedImages.push(rawImg2);

    const parsedVariations = newProductVariations
      ? newProductVariations.split(',').map(v => v.trim()).filter(Boolean)
      : undefined;

    const createdProductPayload: Record<string, any> = {
      name: newProductName,
      description: newProductDesc || 'Produk kualitas terjamin hasil karya santri pesantren.',
      category: newProductCategory,
      price: parseFloat(newProductPrice) || 0,
      originalPrice: (parseFloat(newProductPrice) || 0) * 1.2,
      discountPercent: 15,
      rating: 5.0,
      soldCount: 0,
      location: newProductLocation || 'Kab. Jombang',
      imageUrl: rawImg1,
      imageUrls: collectedImages,
      badge: 'Bazar Santri',
      freeShipping: true,
      cashback: true,
      stock: parseInt(newProductStock) || 10,
      sellerName: user?.displayName || 'Toko Santri Mandiri',
      sellerAvatarUrl: userData?.photoURL || userData?.avatarUrl || user?.photoURL || ''
    };

    if (parsedVariations && parsedVariations.length > 0) createdProductPayload.variations = parsedVariations;
    if (newProductWa.trim()) createdProductPayload.whatsappNumber = newProductWa.trim();
    if (newProductShopee.trim()) createdProductPayload.shopeeUrl = newProductShopee.trim();
    if (newProductTokopedia.trim()) createdProductPayload.tokopediaUrl = newProductTokopedia.trim();
    if (newProductExternal.trim()) createdProductPayload.externalUrl = newProductExternal.trim();

    try {
      if (user) {
        await addMarketplaceProduct(createdProductPayload, user);
      } else {
        const localProd = { id: `prod-user-${Date.now()}`, ...createdProductPayload } as Product;
        setProducts(prev => [localProd, ...prev]);
      }

      setIsAddProductOpen(false);
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductImage1('');
      setNewProductImageFile1(null);
      setNewProductImage2('');
      setNewProductImageFile2(null);
      setNewProductVariations('');
      setNewProductWa('');
      setNewProductShopee('');
      setNewProductTokopedia('');
      setNewProductExternal('');
      showToast('Produk Anda berhasil tersimpan & diterbitkan di Toko Santri!', 'success');
      setActiveNavTab('beranda');
    } catch (err: any) {
      console.error("Error saving marketplace product:", err);
      let friendlyMsg = err?.message || 'Terjadi kesalahan teknis saat menyimpan produk.';
      if (friendlyMsg.includes('1,048,576') || friendlyMsg.includes('bytes') || friendlyMsg.includes('size') || friendlyMsg.includes('exceeds')) {
        friendlyMsg = 'Ukuran foto produk terlalu besar. Silakan gunakan foto yang lebih kecil atau kompres terlebih dahulu.';
      } else if (friendlyMsg.includes('permission-denied') || friendlyMsg.includes('permission')) {
        friendlyMsg = 'Akses ditolak. Silakan login terlebih dahulu untuk menerbitkan produk.';
      }
      showToast('Gagal menyimpan produk: ' + friendlyMsg, 'error');
    }
  };

  const handleDeleteProduct = async (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini dari Toko Santri?')) {
      try {
        await deleteMarketplaceProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('Produk berhasil dihapus!', 'success');
      } catch (err) {
        console.error("Error deleting product:", err);
        showToast('Gagal menghapus produk.', 'error');
      }
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesBadge = selectedBadge === 'all' || (selectedBadge === 'mall' && p.badge === 'Santri Mall') || (selectedBadge === 'star' && p.badge === 'Star+');
        return matchesSearch && matchesCat && matchesBadge;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.soldCount - a.soldCount;
        if (sortBy === 'priceLow') return a.price - b.price;
        if (sortBy === 'priceHigh') return b.price - a.price;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBadge, sortBy]);

  const favoriteProducts = useMemo(() => {
    return products.filter(p => favorites.includes(p.id));
  }, [products, favorites]);

  const userListedProducts = useMemo(() => {
    return products.filter(p => p.id.startsWith('prod-user-') || p.sellerName === (user?.displayName || 'Toko Santri Mandiri'));
  }, [products, user]);

  const totalSellerSoldPcs = useMemo(() => {
    return userListedProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0);
  }, [userListedProducts]);

  const totalSellerEarnings = useMemo(() => {
    return userListedProducts.reduce((sum, p) => sum + ((p.soldCount || 0) * p.price), 0);
  }, [userListedProducts]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 text-slate-800 dark:text-slate-100 font-sans">
      {/* TOP HEADER TOKO SANTRI */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#EE4D2D] via-[#FF5722] to-[#F53D2D] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          {/* Top Navbar Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
                title="Kembali ke Beranda Utama"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="flex items-center gap-1.5">
                <Store size={18} className="text-yellow-300" />
                <span className="font-black text-base tracking-wide">Toko Santri</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Keranjang Belanja"
              >
                <ShoppingCart size={20} />
                {totalCartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-400 text-red-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-[#EE4D2D]"
                  >
                    {totalCartCount}
                  </motion.span>
                )}
              </button>

              {/* Chat Icon */}
              <button
                onClick={() => showToast('Pesan Toko Santri dibuka!', 'info')}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                title="Pesan / Chat"
              >
                <MessageSquare size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {activeNavTab === 'beranda' && (
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kitab, sarung BHS, sajadah, herbal santri..."
                className="w-full pl-9 pr-8 py-2 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* DYNAMIC SCREEN CONTENT BASED ON BOTTOM TAB */}
      <main className="max-w-4xl mx-auto px-3 pt-3 space-y-4">
        {/* TAB 1: BERANDA / EXPLORE */}
        {activeNavTab === 'beranda' && (
          <>
            {/* HERO PROMO BANNER */}
            <div className="relative bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 rounded-3xl p-5 text-white shadow-lg overflow-hidden border border-white/20">
              <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
                <ShoppingBag size={200} />
              </div>

              <div className="relative z-10 space-y-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-400 text-red-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                    BAROKAH EXPO
                  </span>
                  <span className="text-[11px] font-bold text-yellow-200 flex items-center gap-1">
                    <Truck size={13} /> Pengiriman Seluruh Indonesia
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black leading-snug drop-shadow-sm">
                  Pasar Kitab & Produk Muslim Santri Nusantara
                </h2>

                <p className="text-xs text-amber-100 font-medium">
                  Dapatkan diskon khusus kitab kuning, sarung sutera, sajadah empuk, dan produk herbal nabawi.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedBadge('mall');
                      showToast('Menampilkan Produk Pilihan Toko Santri', 'info');
                    }}
                    className="px-3.5 py-1.5 bg-white text-[#EE4D2D] rounded-full text-xs font-black shadow-md hover:bg-yellow-300 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Award size={13} />
                    <span>Pilihan Umat</span>
                  </button>

                  <button
                    onClick={() => setSelectedCategory('kitab')}
                    className="px-3.5 py-1.5 bg-black/20 hover:bg-black/30 border border-white/30 rounded-full text-xs font-bold text-white transition-all backdrop-blur-md"
                  >
                    Bazar Kitab Kuning
                  </button>
                </div>
              </div>
            </div>

            {/* CATEGORY GRID */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D] border border-orange-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                    <Store size={20} />
                  </div>
                  <span>Semua</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('kitab')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                    selectedCategory === 'kitab'
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D] border border-orange-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
                    <Tag size={20} />
                  </div>
                  <span>Kitab Kuning</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('busana')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                    selectedCategory === 'busana'
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D] border border-orange-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Busana</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('sholat')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                    selectedCategory === 'sholat'
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D] border border-orange-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <ShieldCheck size={20} />
                  </div>
                  <span>Sajadah</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('herbal')}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                    selectedCategory === 'herbal'
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D] border border-orange-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <Sparkles size={20} />
                  </div>
                  <span>Herbal</span>
                </button>
              </div>
            </div>

            {/* FLASH SALE TICKER */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="text-yellow-300 animate-bounce" size={20} />
                <span className="font-black text-xs uppercase tracking-wider">FLASH SALE HARI INI</span>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-yellow-200">
                  02 : 45 : 18
                </span>
              </div>
            </div>

            {/* SORTING BAR */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    sortBy === 'popular'
                      ? 'bg-[#EE4D2D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Terpopuler
                </button>
                <button
                  onClick={() => setSortBy('priceLow')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    sortBy === 'priceLow'
                      ? 'bg-[#EE4D2D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Harga Termurah
                </button>
                <button
                  onClick={() => setSortBy('priceHigh')}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    sortBy === 'priceHigh'
                      ? 'bg-[#EE4D2D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Harga Tertinggi
                </button>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const isFav = favorites.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/70 dark:border-slate-800 flex flex-col cursor-pointer group hover:-translate-y-0.5 relative"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Share & Favorite Buttons Overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                        <button
                          onClick={(e) => handleShareProduct(product, e)}
                          className="p-1.5 rounded-full bg-black/40 text-white hover:bg-orange-600 hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                          title="Bagikan Produk"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="p-1.5 rounded-full bg-black/40 text-white hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
                          title="Simpan Produk"
                        >
                          <Heart size={13} className={isFav ? "fill-rose-500 text-rose-500" : "text-white"} />
                        </button>
                      </div>

                      {/* Badge Overlay */}
                      {product.badge && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shadow-md ${
                          product.badge === 'Santri Mall' ? 'bg-[#D0011B]' : product.badge === 'Star+' ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Info Container */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-[#EE4D2D] transition-colors">
                        {product.name}
                      </h3>

                      {/* Price & Sales */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-[#EE4D2D]">Rp</span>
                          <span className="text-sm font-black text-[#EE4D2D] leading-none">
                            {product.price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {product.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rp{product.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star size={10} className="fill-amber-500" />
                            <span>{product.rating}</span>
                          </div>
                          <span>{product.soldCount > 1000 ? `${(product.soldCount/1000).toFixed(1)}rb` : product.soldCount} terjual</span>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-slate-400 pt-0.5 truncate">
                          <MapPin size={9} />
                          <span className="truncate">{product.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TAB 2: FAVORIT */}
        {activeNavTab === 'favorit' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black flex items-center gap-2 text-rose-500">
                  <Heart size={20} className="fill-rose-500" />
                  <span>Favorit Saya</span>
                </h2>
                <p className="text-xs text-slate-500">Daftar produk Toko Santri yang Anda simpan</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 rounded-full">
                {favoriteProducts.length} Produk
              </span>
            </div>

            {favoriteProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-3 border border-slate-200/60 dark:border-slate-800">
                <Heart size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
                <h3 className="text-sm font-bold text-slate-600">Belum ada produk favorit</h3>
                <p className="text-xs text-slate-400">Tandai produk pilihan dengan ikon hati di Toko Santri.</p>
                <button
                  onClick={() => setActiveNavTab('beranda')}
                  className="px-5 py-2 bg-[#EE4D2D] text-white rounded-full text-xs font-bold shadow-md"
                >
                  Cari Produk Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favoriteProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 p-2.5 flex flex-col justify-between space-y-2 cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-black/40 text-rose-500 rounded-full"
                      >
                        <Heart size={14} className="fill-rose-500" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold line-clamp-2">{product.name}</h4>

                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      <span className="font-black text-[#EE4D2D]">Rp{product.price.toLocaleString('id-ID')}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        className="p-1.5 bg-orange-100 dark:bg-orange-950 text-[#EE4D2D] rounded-lg font-bold flex items-center gap-1"
                      >
                        <ShoppingCart size={12} />
                        <span>+ Keranjang</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JUALAN / SELLER CENTER */}
        {activeNavTab === 'jualan' && (
          <div className="space-y-4">
            {/* Seller Header Stats */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-5 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg border border-white/30 backdrop-blur-md">
                    <Store size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-black">{user?.displayName || 'Toko Santri Mandiri'}</h2>
                    <p className="text-xs text-amber-100">Pusat Penjualan & UMKM Pesantren</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-2 bg-white text-[#EE4D2D] rounded-2xl text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Tambah Produk</span>
                </button>
              </div>

              {/* Seller Analytics Ticker */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                <div className="bg-black/10 rounded-2xl p-2 backdrop-blur-md">
                  <span className="text-[10px] text-amber-100 block font-medium">Produk Aktif</span>
                  <strong className="text-sm font-black">{userListedProducts.length}</strong>
                </div>

                <div className="bg-black/10 rounded-2xl p-2 backdrop-blur-md">
                  <span className="text-[10px] text-amber-100 block font-medium">Terjual</span>
                  <strong className="text-sm font-black">{totalSellerSoldPcs} Pcs</strong>
                </div>

                <div className="bg-black/10 rounded-2xl p-2 backdrop-blur-md">
                  <span className="text-[10px] text-amber-100 block font-medium">Penghasilan</span>
                  <strong className="text-sm font-black">Rp{totalSellerEarnings.toLocaleString('id-ID')}</strong>
                </div>
              </div>
            </div>

            {/* List of Seller's Products */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-xs font-black uppercase text-slate-500">Daftar Dagangan Anda</h3>
                <span className="text-xs font-bold text-[#EE4D2D]">Status: Aktif</span>
              </div>

              {userListedProducts.length === 0 ? (
                <div className="text-center py-8 space-y-2 text-slate-400">
                  <Box size={40} className="mx-auto text-slate-300" />
                  <p className="text-xs font-medium">Anda belum mendaftarkan produk baru di Toko Santri.</p>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-[#EE4D2D] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    + Mulaikan Jualan Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userListedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border">
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{product.name}</h4>
                        <p className="text-xs font-black text-[#EE4D2D]">Rp{product.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                          Stok: {product.stock}
                        </span>
                        <button
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFIKASI */}
        {activeNavTab === 'notifikasi' && (
          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black flex items-center gap-2 text-amber-500">
                  <Bell size={20} />
                  <span>Notifikasi Toko Santri</span>
                </h2>
                <p className="text-xs text-slate-500">Pemberitahuan transaksi, promo, dan obrolan</p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 space-y-2 p-6 shadow-sm">
                <Bell size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Belum Ada Notifikasi</p>
                <p className="text-[11px] text-slate-400">Pemberitahuan transaksi & aktivitas Toko Santri Anda akan muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      notif.type === 'seller'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        : notif.type === 'order'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80'
                        : 'bg-orange-100 text-[#EE4D2D] dark:bg-orange-950/80'
                    }`}>
                      {notif.type === 'seller' ? <Store size={18} /> : notif.type === 'order' ? <PackageCheck size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div className="space-y-0.5 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SAYA / PROFIL */}
        {activeNavTab === 'saya' && (
          <div className="space-y-4">
            {/* User Profile Header */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <UserAvatar 
                photoURL={userData?.photoURL || userData?.avatarUrl || user?.photoURL} 
                displayName={user?.displayName} 
                points={userData?.points || 0}
                avatarFrame={userData?.avatarFrame}
                verificationBadge={userData?.verificationBadge}
                size="lg" 
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-black truncate">{user?.displayName || 'Santri AI User'}</h2>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'santri@pesantren.id'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                  Member Santri Priority
                </span>
              </div>
            </div>

            {/* Orders Status Quick Menu */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-slate-500">Pesanan Saya</h3>
                <span className="text-xs font-bold text-[#EE4D2D]">{orders.length} Transaksi</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <CreditCard size={18} className="mx-auto text-orange-500" />
                  <span>Belum Bayar</span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <Box size={18} className="mx-auto text-amber-500" />
                  <span>Dikemas ({orders.length})</span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <Truck size={18} className="mx-auto text-sky-500" />
                  <span>Dikirim</span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <CheckCircle2 size={18} className="mx-auto text-emerald-500" />
                  <span>Selesai</span>
                </div>
              </div>

              {orders.length > 0 && (
                <div className="pt-2 border-t space-y-2">
                  {orders.map(ord => (
                    <div key={ord.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <strong className="font-bold">{ord.id}</strong>
                        <p className="text-[10px] text-slate-500">{ord.items.length} Barang • Rp{ord.totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">{ord.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* SPECIAL DEDICATED NAVBOTTOM FOR TOKO SANTRI */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl py-2 px-3">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          {/* 1. Beranda */}
          <button
            onClick={() => setActiveNavTab('beranda')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeNavTab === 'beranda'
                ? 'text-[#EE4D2D] font-extrabold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <Store size={20} className={activeNavTab === 'beranda' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5">Beranda</span>
          </button>

          {/* 2. Favorit */}
          <button
            onClick={() => setActiveNavTab('favorit')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeNavTab === 'favorit'
                ? 'text-[#EE4D2D] font-extrabold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <Heart size={20} className={activeNavTab === 'favorit' ? 'fill-rose-500 text-rose-500 scale-110' : ''} />
            <span className="text-[10px] mt-0.5">Favorit</span>
          </button>

          {/* 3. Jualan */}
          <button
            onClick={() => setActiveNavTab('jualan')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeNavTab === 'jualan'
                ? 'text-[#EE4D2D] font-extrabold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <PlusCircle size={22} className={activeNavTab === 'jualan' ? 'text-[#EE4D2D] scale-110' : ''} />
            <span className="text-[10px] mt-0.5">Jualan</span>
          </button>

          {/* 4. Notifikasi */}
          <button
            onClick={() => setActiveNavTab('notifikasi')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
              activeNavTab === 'notifikasi'
                ? 'text-[#EE4D2D] font-extrabold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <Bell size={20} className={activeNavTab === 'notifikasi' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5">Notifikasi</span>
          </button>

          {/* 5. Saya / Profil */}
          <button
            onClick={() => setActiveNavTab('saya')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeNavTab === 'saya'
                ? 'text-[#EE4D2D] font-extrabold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            <User size={20} className={activeNavTab === 'saya' ? 'scale-110' : ''} />
            <span className="text-[10px] mt-0.5">Saya</span>
          </button>
        </div>
      </nav>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative border-t sm:border border-slate-200 dark:border-slate-800"
            >
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  onClick={(e) => handleOpenReportModal(selectedProduct, e)}
                  className="bg-black/40 text-white p-2 rounded-full hover:bg-rose-600 backdrop-blur-md transition-all"
                  title="Laporkan Produk ke Admin"
                >
                  <Flag size={18} />
                </button>
                <button
                  onClick={() => handleShareProduct(selectedProduct)}
                  className="bg-black/40 text-white p-2 rounded-full hover:bg-orange-600 backdrop-blur-md transition-all"
                  title="Bagikan Produk"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 backdrop-blur-md"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Photo Display (Max 2 Photos) */}
              {(() => {
                const photos = selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0
                  ? selectedProduct.imageUrls.slice(0, 2)
                  : [selectedProduct.imageUrl];
                const activePhoto = photos[selectedDetailImageIdx] || photos[0] || selectedProduct.imageUrl;

                return (
                  <div className="space-y-2">
                    <div className="relative aspect-square sm:aspect-video w-full bg-slate-100 dark:bg-slate-800">
                      <img src={activePhoto} alt={selectedProduct.name} className="w-full h-full object-cover transition-all" />
                      {selectedProduct.badge && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 bg-[#EE4D2D] text-white text-xs font-black rounded-full shadow-lg">
                          {selectedProduct.badge}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Switcher if 2 Photos */}
                    {photos.length > 1 && (
                      <div className="flex items-center justify-center gap-2 px-5 pt-1">
                        {photos.map((pUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedDetailImageIdx(idx)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                              selectedDetailImageIdx === idx
                                ? 'border-[#EE4D2D] scale-105 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={pUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#EE4D2D]">
                      Rp{selectedProduct.price.toLocaleString('id-ID')}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        Rp{selectedProduct.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold leading-snug">{selectedProduct.name}</h2>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-500" /> {selectedProduct.rating}
                    </span>
                    <span>•</span>
                    <span>{selectedProduct.soldCount} Terjual</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                      <MapPin size={12} /> {selectedProduct.location}
                    </span>
                  </div>
                </div>

                {/* Variasi Produk */}
                {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                  <div className="space-y-2 p-3 bg-amber-50/70 dark:bg-slate-800/60 rounded-2xl border border-amber-200/80 dark:border-slate-700">
                    <h4 className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Pilih Variasi Produk</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variations.map((variant, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariation(variant)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedVariation === variant
                              ? 'bg-[#EE4D2D] text-white shadow-sm scale-105'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#EE4D2D]'
                          }`}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Info with Photo */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      photoURL={selectedProduct.sellerAvatarUrl || (selectedProduct.sellerName === user?.displayName ? (userData?.photoURL || userData?.avatarUrl || user?.photoURL) : user?.photoURL)} 
                      displayName={selectedProduct.sellerName}
                      points={selectedProduct.sellerName === user?.displayName ? (userData?.points || 0) : 0}
                      avatarFrame={selectedProduct.sellerName === user?.displayName ? userData?.avatarFrame : undefined}
                      verificationBadge={selectedProduct.sellerName === user?.displayName ? userData?.verificationBadge : undefined}
                      size="sm"
                    />
                    <div>
                      <h4 className="text-xs font-bold">{selectedProduct.sellerName}</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Toko Aktif Santri</p>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Fitur Chat dengan ${selectedProduct.sellerName} dibuka!`, 'info')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#EE4D2D] text-[#EE4D2D] rounded-xl text-xs font-bold shadow-sm"
                  >
                    Chat Toko
                  </button>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Produk</h4>
                    <button
                      onClick={(e) => handleOpenReportModal(selectedProduct, e)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
                    >
                      <AlertTriangle size={12} />
                      <span>Laporkan Produk</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* External Action Links (WhatsApp, Shopee, Tokopedia, Web/Affiliate) */}
                {(selectedProduct.whatsappNumber || selectedProduct.shopeeUrl || selectedProduct.tokopediaUrl || selectedProduct.externalUrl) && (
                  <div className="space-y-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-orange-200/80 dark:border-slate-700">
                    <h4 className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <ExternalLink size={14} className="text-[#EE4D2D]" />
                      <span>Beli / Hubungi Penjual Langsung</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedProduct.whatsappNumber && (
                        <a
                          href={
                            selectedProduct.whatsappNumber.startsWith('http')
                              ? selectedProduct.whatsappNumber
                              : `https://wa.me/${selectedProduct.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalamu'alaikum, saya berminat dengan produk ${selectedProduct.name} di Toko Santri.`)}`
                          }
                          onClick={(e) => handleOpenWhatsApp(e, selectedProduct.whatsappNumber!, selectedProduct.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <MessageSquare size={16} />
                          <span>Chat WhatsApp</span>
                        </a>
                      )}

                      {selectedProduct.shopeeUrl && (
                        <a
                          href={selectedProduct.shopeeUrl.startsWith('http') ? selectedProduct.shopeeUrl : `https://${selectedProduct.shopeeUrl}`}
                          onClick={(e) => handleOpenExternalLink(e, selectedProduct.shopeeUrl!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-[#EE4D2D] text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#d63e20] active:scale-95 transition-all cursor-pointer"
                        >
                          <Store size={16} />
                          <span>Beli di Shopee</span>
                        </a>
                      )}

                      {selectedProduct.tokopediaUrl && (
                        <a
                          href={selectedProduct.tokopediaUrl.startsWith('http') ? selectedProduct.tokopediaUrl : `https://${selectedProduct.tokopediaUrl}`}
                          onClick={(e) => handleOpenExternalLink(e, selectedProduct.tokopediaUrl!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer"
                        >
                          <ShoppingBag size={16} />
                          <span>Beli di Tokopedia</span>
                        </a>
                      )}

                      {selectedProduct.externalUrl && (
                        <a
                          href={selectedProduct.externalUrl.startsWith('http') ? selectedProduct.externalUrl : `https://${selectedProduct.externalUrl}`}
                          onClick={(e) => handleOpenExternalLink(e, selectedProduct.externalUrl!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                        >
                          <Globe size={16} />
                          <span>Link Web / Affiliate</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-3 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-orange-100 dark:bg-orange-950/60 text-[#EE4D2D] rounded-2xl font-black text-xs border border-orange-300 dark:border-orange-800 hover:bg-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    <span>+ Keranjang</span>
                  </button>

                  <button
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="flex-1 py-3 bg-[#EE4D2D] text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/20 hover:bg-[#d63e20] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-[#EE4D2D]" />
                  <h3 className="font-extrabold text-sm">Keranjang Belanja Toko Santri ({totalCartCount})</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                    <ShoppingCart size={48} className="text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-medium">Keranjang belanja Anda masih kosong</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                    >
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover border" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.product.name}</h4>
                        <span className="text-xs font-extrabold text-[#EE4D2D]">
                          Rp{item.product.price.toLocaleString('id-ID')}
                        </span>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleUpdateQty(item.product.id, -1)}
                            className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold px-2">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.product.id, 1)}
                            className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-xl transition-all active:scale-95 shrink-0"
                        title="Batal / Hapus dari keranjang"
                      >
                        Batal / Hapus
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Total Pembayaran:</span>
                    <span className="text-base font-black text-[#EE4D2D]">
                      Rp{totalCartPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleBuyFromCart}
                      className="flex-1 py-3.5 bg-[#EE4D2D] hover:bg-[#d63e20] text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      title="Mengarahkan langsung ke link URL toko / WhatsApp"
                    >
                      <ExternalLink size={16} />
                      <span>Beli</span>
                    </button>

                    <button
                      onClick={handleFinishOrder}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      title="Selesaikan pesanan dan kirim pemberitahuan ke penjual"
                    >
                      <CheckCircle2 size={16} />
                      <span>Selesai ({totalCartCount})</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[#EE4D2D]">
                  <CreditCard size={18} />
                  <span>Konfirmasi Pembayaran Toko Santri</span>
                </h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Jumlah Barang ({totalCartCount})</span>
                  <span>Rp{totalCartPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm">
                  <span>Total Tagihan</span>
                  <span className="text-[#EE4D2D]">Rp{totalCartPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-500">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2 font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('shopeepay')}
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                      paymentMethod === 'shopeepay'
                        ? 'border-[#EE4D2D] bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Wallet size={16} className="text-[#EE4D2D]" />
                    <span>SantriPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#EE4D2D] bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Truck size={16} className="text-[#EE4D2D]" />
                    <span>Bayar di Tempat (COD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-[#EE4D2D] bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <CreditCard size={16} className="text-[#EE4D2D]" />
                    <span>QRIS Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-[#EE4D2D] bg-orange-50 dark:bg-orange-950/60 text-[#EE4D2D]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Store size={16} className="text-[#EE4D2D]" />
                    <span>Transfer Bank</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full py-4 bg-[#EE4D2D] text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/20 hover:bg-[#d63e20] transition-all active:scale-95"
              >
                Buat Pesanan Sekarang
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[#EE4D2D]">
                  <Store size={18} />
                  <span>Tambah Produk Toko Santri Baru</span>
                </h3>
                <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCustomProduct} className="space-y-3.5 text-xs">
                {/* 1. Nama Produk */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                    placeholder="Contoh: Sarung Tenun Santri Motif Batik"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                  />
                </div>

                {/* 2. Deskripsi Produk (DIPINDAHKAN LANGSUNG DI BAWAH NAMA PRODUK) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Produk</label>
                  <textarea
                    rows={3}
                    value={newProductDesc}
                    onChange={e => setNewProductDesc(e.target.value)}
                    placeholder="Tuliskan spesifikasi, bahan, jilid, dan keunggulan produk Anda..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                  />
                </div>

                {/* 3. Kategori & Harga */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                    <select
                      value={newProductCategory}
                      onChange={e => setNewProductCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                    >
                      <option value="kitab">Kitab & Buku</option>
                      <option value="busana">Busana Muslim</option>
                      <option value="sholat">Perlengkapan Sholat</option>
                      <option value="herbal">Herbal</option>
                      <option value="aksesoris">Aksesoris</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={newProductPrice}
                      onChange={e => setNewProductPrice(e.target.value)}
                      placeholder="75000"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                    />
                  </div>
                </div>

                {/* 4. Stok & Lokasi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stok Produk</label>
                    <input
                      type="number"
                      value={newProductStock}
                      onChange={e => setNewProductStock(e.target.value)}
                      placeholder="10"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Toko</label>
                    <input
                      type="text"
                      value={newProductLocation}
                      onChange={e => setNewProductLocation(e.target.value)}
                      placeholder="Kab. Jombang"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* 5. Variasi Produk */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Variasi Produk (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={newProductVariations}
                    onChange={e => setNewProductVariations(e.target.value)}
                    placeholder="Contoh: Ukuran S, Ukuran M, Ukuran L, Warna Hitam, Warna Putih"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]"
                  />
                </div>

                {/* 6. Foto Produk (Maksimal 2 Foto) */}
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Upload size={14} className="text-[#EE4D2D]" />
                      <span>Foto Produk (Maksimal 2 Foto)</span>
                    </span>
                    <span className="text-[10px] text-[#EE4D2D] font-semibold">Max 2 Foto</span>
                  </label>

                  {/* Foto 1 (Utama) */}
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Foto 1 (Utama)</span>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-orange-50 transition-colors text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        <Upload size={12} className="text-[#EE4D2D]" />
                        <span>Upload Perangkat</span>
                        <input type="file" accept="image/*" onChange={handleImageFileChange1} className="hidden" />
                      </label>
                    </div>
                    <input
                      type="url"
                      value={newProductImage1}
                      onChange={e => {
                        setNewProductImage1(e.target.value);
                        if (e.target.value) setNewProductImageFile1(null);
                      }}
                      placeholder="Atau tempel URL Gambar 1"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]"
                    />
                    {(newProductImageFile1 || newProductImage1) && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-orange-300 shadow-sm mt-1">
                        <img src={newProductImageFile1 || newProductImage1} alt="Preview 1" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setNewProductImageFile1(null); setNewProductImage1(''); }}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-rose-600"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Foto 2 (Tambahan) */}
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Foto 2 (Tambahan - Opsional)</span>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-orange-50 transition-colors text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        <Upload size={12} className="text-[#EE4D2D]" />
                        <span>Upload Perangkat</span>
                        <input type="file" accept="image/*" onChange={handleImageFileChange2} className="hidden" />
                      </label>
                    </div>
                    <input
                      type="url"
                      value={newProductImage2}
                      onChange={e => {
                        setNewProductImage2(e.target.value);
                        if (e.target.value) setNewProductImageFile2(null);
                      }}
                      placeholder="Atau tempel URL Gambar 2"
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]"
                    />
                    {(newProductImageFile2 || newProductImage2) && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-orange-300 shadow-sm mt-1">
                        <img src={newProductImageFile2 || newProductImage2} alt="Preview 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setNewProductImageFile2(null); setNewProductImage2(''); }}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-rose-600"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Kolom Link Penjualan / Toko / Affiliate */}
                <div className="space-y-2 p-3 bg-orange-50/60 dark:bg-slate-800/60 rounded-2xl border border-orange-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Link size={14} className="text-[#EE4D2D]" />
                    <span>Link Penjualan / Kontak (Opsional - Isi Salah Satu)</span>
                  </div>

                  {/* Link WA */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Nomor WhatsApp / Link WA</label>
                    <input
                      type="text"
                      value={newProductWa}
                      onChange={e => setNewProductWa(e.target.value)}
                      placeholder="Contoh: 081234567890 atau https://wa.me/62812..."
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>

                  {/* Link Shopee */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Link Shopee / Shopee Affiliate</label>
                    <input
                      type="url"
                      value={newProductShopee}
                      onChange={e => setNewProductShopee(e.target.value)}
                      placeholder="https://shopee.co.id/namatoko/produk..."
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>

                  {/* Link Tokopedia */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Link Toko Tokopedia</label>
                    <input
                      type="url"
                      value={newProductTokopedia}
                      onChange={e => setNewProductTokopedia(e.target.value)}
                      placeholder="https://tokopedia.com/namatoko/produk..."
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>

                  {/* Link Web / Affiliate Lain */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Link Website / Link Affiliate Lainnya</label>
                    <input
                      type="url"
                      value={newProductExternal}
                      onChange={e => setNewProductExternal(e.target.value)}
                      placeholder="https://website-toko.com atau link affiliate..."
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#EE4D2D] text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/20 hover:bg-[#d63e20] transition-all active:scale-95 mt-2"
                >
                  Terbitkan Produk Sekarang
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAPORAN PRODUK MODAL */}
      <AnimatePresence>
        {isReportModalOpen && productToReport && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center font-bold">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Laporkan Produk</h3>
                  <p className="text-xs text-slate-500">Bantu kami menjaga keamanan Toko Santri AI</p>
                </div>
              </div>

              {/* Reported Product Preview Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <img
                  src={productToReport.imageUrl || (productToReport.imageUrls && productToReport.imageUrls[0])}
                  alt={productToReport.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{productToReport.name}</h4>
                  <p className="text-[11px] font-black text-[#EE4D2D]">Rp{productToReport.price.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-slate-400">Penjual: {productToReport.sellerName || 'Santri Seller'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Alasan Pelaporan</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Penipuan / Toko Fiktif">Penipuan / Toko Fiktif</option>
                    <option value="Konten Tidak Layak / Melanggar Syariat">Konten Tidak Layak / Melanggar Syariat</option>
                    <option value="Produk Palsu / Tiruan">Produk Palsu / Tiruan</option>
                    <option value="Harga / Deskripsi Tidak Sesuai">Harga / Deskripsi Tidak Sesuai</option>
                    <option value="Spam / Produk Ganda">Spam / Produk Ganda</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={3}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Tuliskan detail masalah agar tim Admin dapat memverifikasi..."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold text-xs hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplaceScreen;
