import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

const AUTH_KEY = "wg_admin_auth";
const SETTINGS_KEY = "wg_admin_settings";
const ADMINS_KEY = "wg_admins";

interface AdminSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  googleSearchConsole: string;
  googleAnalytics: string;
  googleAdsId: string;
  bingWebmaster: string;
  facebookVerification: string;
  logo: string;
  siteEmail: string;
  newsletterEmail: string;
}

interface AdminUser {
  email: string;
  password: string;
  name: string;
  avatar: string;
}

const DEFAULT_ADMIN: AdminUser = {
  email: "aabeg01@gmail.com",
  password: "aabeg01@gmail.com",
  name: "Admin",
  avatar: "",
};

const defaultSettings: AdminSettings = {
  siteTitle: "WeboGrowth Tools - Free Online Developer & Designer Tools",
  siteDescription: "17+ free online tools: compress images, format JSON, generate QR codes, create meta tags, and more.",
  siteKeywords: "image compressor, json formatter, qr code generator, meta tag generator, free online tools",
  googleSearchConsole: "",
  googleAnalytics: "",
  googleAdsId: "",
  bingWebmaster: "",
  facebookVerification: "",
  logo: "",
};

const dispatchSettingsUpdate = () => {
  window.dispatchEvent(new CustomEvent("wg-settings-updated"));
};

const toolsList = [
  { name: "Image Compressor", path: "/compressor", category: "Image Tools" },
  { name: "Format Converter", path: "/converter", category: "Image Tools" },
  { name: "Image Resizer", path: "/image-resizer", category: "Image Tools" },
  { name: "Favicon Generator", path: "/favicon", category: "Image Tools" },
  { name: "Placeholder Image", path: "/placeholder", category: "Image Tools" },
  { name: "SVG Optimizer", path: "/svg-optimizer", category: "Image Tools" },
  { name: "JSON Formatter", path: "/json-formatter", category: "Developer Tools" },
  { name: "CSS Minifier", path: "/css-minifier", category: "Developer Tools" },
  { name: "Base64 Tool", path: "/base64", category: "Developer Tools" },
  { name: "HTML to Markdown", path: "/html-to-markdown", category: "Developer Tools" },
  { name: "Meta Tag Generator", path: "/meta-tag-generator", category: "SEO & Design" },
  { name: "OG Preview", path: "/og-preview", category: "SEO & Design" },
  { name: "Robots.txt Generator", path: "/robots-generator", category: "SEO & Design" },
  { name: "Color Palette", path: "/color-palette", category: "SEO & Design" },
  { name: "Gradient Generator", path: "/gradient-generator", category: "SEO & Design" },
  { name: "QR Code Generator", path: "/qr-code", category: "SEO & Design" },
  { name: "Lorem Ipsum Generator", path: "/lorem-ipsum", category: "SEO & Design" },
];

const Admin = () => {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("seo");
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editOldPass, setEditOldPass] = useState("");
  const [editNewPass, setEditNewPass] = useState("");
  // New admin state
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY);
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setAuthenticated(true);
        setCurrentAdmin(parsed);
        setEditName(parsed.name || "");
      } catch {}
    }
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(saved) }); } catch {}
    }
    const savedAdmins = localStorage.getItem(ADMINS_KEY);
    if (savedAdmins) {
      try { setAdmins(JSON.parse(savedAdmins)); } catch {}
    } else {
      setAdmins([DEFAULT_ADMIN]);
      localStorage.setItem(ADMINS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const allAdmins: AdminUser[] = (() => {
      try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]"); } catch { return [DEFAULT_ADMIN]; }
    })();
    const found = allAdmins.find((a) => a.email === email && a.password === password);
    if (found) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(found));
      setAuthenticated(true);
      setCurrentAdmin(found);
      setEditName(found.name);
      toast({ title: "Login successful" });
    } else {
      toast({ title: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setCurrentAdmin(null);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    dispatchSettingsUpdate();
    toast({ title: "Settings saved successfully" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      toast({ title: "Logo must be under 500KB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newSettings = { ...settings, logo: reader.result as string };
      setSettings(newSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      dispatchSettingsUpdate();
      toast({ title: "Logo uploaded & saved" });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = () => {
    if (!currentAdmin) return;
    const allAdmins: AdminUser[] = (() => {
      try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]"); } catch { return []; }
    })();

    const idx = allAdmins.findIndex((a) => a.email === currentAdmin.email);
    if (idx === -1) return;

    if (editOldPass && editNewPass) {
      if (editOldPass !== allAdmins[idx].password) {
        toast({ title: "Old password is incorrect", variant: "destructive" });
        return;
      }
      allAdmins[idx].password = editNewPass;
    }
    allAdmins[idx].name = editName;
    localStorage.setItem(ADMINS_KEY, JSON.stringify(allAdmins));
    setAdmins(allAdmins);
    const updated = allAdmins[idx];
    setCurrentAdmin(updated);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    setEditOldPass("");
    setEditNewPass("");
    toast({ title: "Profile updated" });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentAdmin) return;
    const reader = new FileReader();
    reader.onload = () => {
      const allAdmins: AdminUser[] = (() => {
        try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]"); } catch { return []; }
      })();
      const idx = allAdmins.findIndex((a) => a.email === currentAdmin.email);
      if (idx === -1) return;
      allAdmins[idx].avatar = reader.result as string;
      localStorage.setItem(ADMINS_KEY, JSON.stringify(allAdmins));
      setAdmins(allAdmins);
      setCurrentAdmin(allAdmins[idx]);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(allAdmins[idx]));
      toast({ title: "Avatar updated" });
    };
    reader.readAsDataURL(file);
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminPass) {
      toast({ title: "Email and password required", variant: "destructive" });
      return;
    }
    const allAdmins: AdminUser[] = (() => {
      try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]"); } catch { return []; }
    })();
    if (allAdmins.find((a) => a.email === newAdminEmail)) {
      toast({ title: "Admin with this email already exists", variant: "destructive" });
      return;
    }
    const newAdmin: AdminUser = { email: newAdminEmail, password: newAdminPass, name: newAdminName || "Admin", avatar: "" };
    allAdmins.push(newAdmin);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(allAdmins));
    setAdmins(allAdmins);
    setNewAdminEmail("");
    setNewAdminPass("");
    setNewAdminName("");
    toast({ title: "New admin added" });
  };

  const handleRemoveAdmin = (adminEmail: string) => {
    if (adminEmail === currentAdmin?.email) {
      toast({ title: "Cannot remove yourself", variant: "destructive" });
      return;
    }
    const allAdmins: AdminUser[] = (() => {
      try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]"); } catch { return []; }
    })();
    const filtered = allAdmins.filter((a) => a.email !== adminEmail);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(filtered));
    setAdmins(filtered);
    toast({ title: "Admin removed" });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <Helmet><title>Admin Login | WeboGrowth Tools</title></Helmet>
        <form onSubmit={handleLogin} className="bg-surface-container rounded-xl p-8 w-full max-w-md space-y-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-headline font-bold text-foreground">Admin Login</h1>
            <p className="text-on-surface-variant text-sm mt-2">WeboGrowth Tools Dashboard</p>
          </div>
          <div>
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">Login</button>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: "seo", label: "SEO Settings", icon: "search" },
    { id: "verification", label: "Verification", icon: "verified" },
    { id: "logo", label: "Logo", icon: "image" },
    { id: "profile", label: "My Profile", icon: "person" },
    { id: "admins", label: "Manage Admins", icon: "group" },
    { id: "tools", label: "Tools", icon: "build" },
    { id: "sitemap", label: "Sitemap", icon: "map" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Helmet><title>Admin Dashboard | WeboGrowth Tools</title></Helmet>

      <header className="bg-surface-container-low border-b border-outline-variant/15 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="WeboGrowth" className="h-8" />
          ) : (
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          )}
          <h1 className="text-lg font-headline font-bold">WeboGrowth Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          {currentAdmin && (
            <div className="flex items-center gap-2">
              {currentAdmin.avatar ? (
                <img src={currentAdmin.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">{currentAdmin.name?.[0]?.toUpperCase() || "A"}</div>
              )}
              <span className="text-sm text-on-surface-variant hidden sm:inline">{currentAdmin.name}</span>
            </div>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant text-sm hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">open_in_new</span>View Site
          </a>
          <button onClick={handleLogout} className="text-sm text-error hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">logout</span>Logout
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-surface-container-low min-h-[calc(100vh-65px)] p-4 hidden md:block">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden flex overflow-x-auto border-b border-outline-variant/15 bg-surface-container-low px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          {activeTab === "seo" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">SEO Settings</h2>
              <p className="text-on-surface-variant text-sm">Configure site-wide SEO metadata for better search engine visibility.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Site Title</label>
                  <input value={settings.siteTitle} onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Meta Description</label>
                  <textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} rows={3} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
                  <p className="text-xs text-on-surface-variant/60 mt-1">{settings.siteDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Keywords</label>
                  <input value={settings.siteKeywords} onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })} className="w-full bg-surface-container rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">Save SEO Settings</button>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">Verification & Analytics</h2>
              <p className="text-on-surface-variant text-sm">Add verification codes for search engines and analytics tracking.</p>
              <div className="space-y-4">
                {[
                  { key: "googleSearchConsole" as const, icon: "search", title: "Google Search Console", placeholder: "e.g. ABC123xyz...", desc: "Paste the content value from the meta tag verification code." },
                  { key: "googleAnalytics" as const, icon: "analytics", title: "Google Analytics", placeholder: "G-XXXXXXXXXX", desc: "Enter your Google Analytics Measurement ID." },
                  { key: "googleAdsId" as const, icon: "ads_click", title: "Google Ads", placeholder: "ca-pub-XXXXXXXXXXXXXXXX", desc: "Enter your Google AdSense Publisher ID to show ads on your site." },
                  { key: "bingWebmaster" as const, icon: "travel_explore", title: "Bing Webmaster", placeholder: "Bing verification code", desc: "Paste the content value from Bing Webmaster verification meta tag." },
                  { key: "facebookVerification" as const, icon: "facebook", title: "Facebook Domain Verification", placeholder: "Facebook verification code", desc: "Paste the content value from Facebook domain verification meta tag." },
                ].map((item) => (
                  <div key={item.key} className="bg-surface-container rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      <h3 className="font-headline font-bold">{item.title}</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">{item.desc}</p>
                    <input value={settings[item.key]} onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })} placeholder={item.placeholder} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm" />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">Save Verification Settings</button>
            </div>
          )}

          {activeTab === "logo" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">Logo Management</h2>
              <p className="text-on-surface-variant text-sm">Upload and manage your site logo. Max file size: 500KB. Changes reflect immediately in the navbar.</p>
              <div className="bg-surface-container rounded-xl p-8 text-center">
                {settings.logo ? (
                  <div className="space-y-4">
                    <img src={settings.logo} alt="Site Logo" className="max-h-24 mx-auto" />
                    <button onClick={() => { const ns = { ...settings, logo: "" }; setSettings(ns); localStorage.setItem(SETTINGS_KEY, JSON.stringify(ns)); dispatchSettingsUpdate(); toast({ title: "Logo removed" }); }} className="text-sm text-error hover:underline">Remove Logo</button>
                  </div>
                ) : (
                  <div className="py-8">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-4 block">add_photo_alternate</span>
                    <p className="text-on-surface-variant text-sm mb-4">No logo uploaded yet</p>
                  </div>
                )}
                <label className="inline-flex bg-primary text-on-primary px-6 py-3 rounded-lg font-bold cursor-pointer hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all mt-4">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">upload</span>Upload Logo
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">My Profile</h2>
              <div className="bg-surface-container rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {currentAdmin?.avatar ? (
                      <img src={currentAdmin.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">{currentAdmin?.name?.[0]?.toUpperCase() || "A"}</div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-on-primary text-sm">edit</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-lg">{currentAdmin?.name}</p>
                    <p className="text-on-surface-variant text-sm">{currentAdmin?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">Display Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="border-t border-outline-variant/15 pt-4">
                  <h3 className="font-headline font-bold mb-4">Change Password</h3>
                  <div className="space-y-3">
                    <input type="password" value={editOldPass} onChange={(e) => setEditOldPass(e.target.value)} placeholder="Current password" className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                    <input type="password" value={editNewPass} onChange={(e) => setEditNewPass(e.target.value)} placeholder="New password" className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <button onClick={handleProfileSave} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all">Save Profile</button>
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">Manage Admins</h2>
              <p className="text-on-surface-variant text-sm">Add or remove admin accounts.</p>

              {/* Add new admin */}
              <div className="bg-surface-container rounded-xl p-6 space-y-4">
                <h3 className="font-headline font-bold">Add New Admin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Name" className="bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm" />
                  <input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="Email" type="email" className="bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm" />
                  <input value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} placeholder="Password" type="password" className="bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm" />
                </div>
                <button onClick={handleAddAdmin} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all text-sm">Add Admin</button>
              </div>

              {/* Admin list */}
              <div className="bg-surface-container rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/15">
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Name</th>
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Email</th>
                      <th className="text-right px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.email} className="border-b border-outline-variant/10">
                        <td className="px-4 py-3 text-foreground">{admin.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{admin.email}</td>
                        <td className="px-4 py-3 text-right">
                          {admin.email === currentAdmin?.email ? (
                            <span className="text-xs text-primary font-bold">You</span>
                          ) : (
                            <button onClick={() => handleRemoveAdmin(admin.email)} className="text-xs text-error hover:underline">Remove</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">Tools Overview</h2>
              <p className="text-on-surface-variant text-sm">All {toolsList.length} tools with their routes and categories.</p>
              <div className="bg-surface-container rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/15">
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Tool</th>
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Category</th>
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Path</th>
                      <th className="text-left px-4 py-3 font-label uppercase tracking-widest text-xs text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolsList.map((tool) => (
                      <tr key={tool.path} className="border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{tool.name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{tool.category}</td>
                        <td className="px-4 py-3"><code className="text-primary text-xs bg-primary/10 px-2 py-1 rounded">{tool.path}</code></td>
                        <td className="px-4 py-3"><span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sitemap" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold">Sitemap</h2>
              <p className="text-on-surface-variant text-sm">Current sitemap.xml configuration. Submit this URL to Google Search Console:</p>
              <div className="bg-surface-container rounded-xl p-4">
                <code className="text-primary text-sm break-all">https://tools.webogrowth.com/sitemap.xml</code>
              </div>
              <div className="bg-surface-container rounded-xl p-6">
                <h3 className="font-headline font-bold mb-4">Indexed URLs</h3>
                <div className="space-y-2">
                  {["/", "/compressor", "/converter", "/svg-optimizer", "/favicon", "/image-resizer", "/placeholder", "/json-formatter", "/css-minifier", "/base64", "/html-to-markdown", "/meta-tag-generator", "/og-preview", "/robots-generator", "/color-palette", "/gradient-generator", "/qr-code", "/lorem-ipsum", "/about-us", "/contact-us", "/privacy-policy", "/terms-of-service"].map((url) => (
                    <div key={url} className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                      <code className="text-on-surface-variant">https://tools.webogrowth.com{url}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
