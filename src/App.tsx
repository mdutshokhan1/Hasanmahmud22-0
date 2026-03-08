import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  X, 
  Phone, 
  MapPin, 
  User, 
  Send,
  Facebook,
  Menu,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";
import { Product, MenuLink, OrderFormData } from "./types";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [menuLinks, setMenuLinks] = useState<MenuLink[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({ name: "", phone: "", address: "" });
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // Admin state
  const [newProduct, setNewProduct] = useState({ title: "", price: "", image: "" });
  const [newLink, setNewLink] = useState({ label: "", href: "" });

  useEffect(() => {
    fetchProducts();
    fetchMenu();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const fetchMenu = async () => {
    const res = await fetch("/api/menu");
    const data = await res.json();
    setMenuLinks(data);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= 2) return prev;
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > 2) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) }),
    });
    setNewProduct({ title: "", price: "", image: "" });
    fetchProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });
    setNewLink({ label: "", href: "" });
    fetchMenu();
  };

  const handleDeleteLink = async (id: number) => {
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    fetchMenu();
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order processing
    setIsOrderSuccess(true);
    setTimeout(() => {
      setIsOrderSuccess(false);
      setIsCheckoutOpen(false);
      setCart([]);
      setFormData({ name: "", phone: "", address: "" });
    }, 3000);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const whatsappLink = `https://wa.me/1234567890?text=${encodeURIComponent(
    `Hello! I'd like to order:\n${cart.map(item => `- ${item.product.title} (x${item.quantity})`).join("\n")}\n\nTotal: $${totalAmount.toFixed(2)}`
  )}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span className="font-display font-bold text-xl tracking-tight">LUXE.</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {menuLinks.map(link => (
              <a 
                key={link.id} 
                href={link.href} 
                className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
              title="Admin Mode"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="relative p-2 text-stone-600 hover:text-stone-900"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-stone-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
              alt="Hero Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Elevate Your <span className="text-emerald-400">Lifestyle</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-10"
            >
              Curated premium products designed for the modern individual. 
              Quality meets minimalist design in every piece.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <a 
                href="#products" 
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105"
              >
                Shop Collection <ChevronRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Admin Panel */}
        <AnimatePresence>
          {isAdmin && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border-b border-emerald-100 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                    <Settings className="w-6 h-6" /> Admin Management
                  </h2>
                  <button onClick={() => setIsAdmin(false)} className="text-emerald-600 hover:text-emerald-800">
                    Close Panel
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Manage Menu */}
                  <div>
                    <h3 className="font-bold mb-4 text-emerald-800">Manage Menu Links</h3>
                    <form onSubmit={handleAddLink} className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="Label" 
                        className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 bg-white"
                        value={newLink.label}
                        onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Href (#id)" 
                        className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 bg-white"
                        value={newLink.href}
                        onChange={e => setNewLink({ ...newLink, href: e.target.value })}
                        required
                      />
                      <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        <Plus className="w-5 h-5" />
                      </button>
                    </form>
                    <div className="space-y-2">
                      {menuLinks.map(link => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100">
                          <span className="text-sm font-medium">{link.label} ({link.href})</span>
                          <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manage Products */}
                  <div>
                    <h3 className="font-bold mb-4 text-emerald-800">Add New Product</h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Product Title" 
                        className="w-full px-4 py-2 rounded-lg border border-emerald-200 bg-white"
                        value={newProduct.title}
                        onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                        required
                      />
                      <div className="flex gap-4">
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="Price" 
                          className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 bg-white"
                          value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          className="flex-2 px-4 py-2 rounded-lg border border-emerald-200 bg-white"
                          value={newProduct.image}
                          onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                          required
                        />
                      </div>
                      <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                        Add Product to Catalog
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <section id="products" className="py-24 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Collection</h2>
              <p className="text-stone-500">Handpicked items for your daily needs.</p>
            </div>
            <div className="text-sm text-stone-400 font-medium">
              Showing {products.length} items
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <motion.div 
                layout
                key={product.id} 
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                  <p className="text-stone-500 text-sm mb-4">${product.price.toFixed(2)}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-emerald-400" />
                <span className="font-display font-bold text-2xl tracking-tight">LUXE.</span>
              </div>
              <p className="text-stone-400 max-w-sm">
                Premium lifestyle products delivered to your doorstep. 
                Join our community of modern minimalists.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-stone-400 text-sm">
                {menuLinks.map(link => (
                  <li key={link.id}><a href={link.href} className="hover:text-emerald-400">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Connect</h4>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-3 bg-stone-800 rounded-full hover:bg-emerald-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="p-3 bg-stone-800 rounded-full hover:bg-emerald-600 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            © 2024 LUXE. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Your Cart
                </h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                    <p className="text-stone-500">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title} 
                        className="w-20 h-20 object-cover rounded-lg border border-stone-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-bold text-sm">{item.product.title}</h4>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-stone-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 mb-3">${item.product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stone-200 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 hover:bg-stone-50"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              disabled={item.quantity >= 2}
                              className="p-1 hover:bg-stone-50 disabled:opacity-30"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          {item.quantity >= 2 && (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Max Limit</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" /> Order on WhatsApp
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              {isOrderSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Received!</h2>
                  <p className="text-stone-500">We'll contact you shortly to confirm your delivery.</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Complete Your Order</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Delivery Address
                      </label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                        placeholder="123 Street, City, Country"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-stone-500">Total to pay</span>
                        <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                      </div>
                      <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                        <Send className="w-5 h-5" /> Place Order Now
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
