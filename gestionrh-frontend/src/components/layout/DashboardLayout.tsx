import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { User, LogOut, Settings, ChevronDown, Bell, Search, Menu, X, Home, Users, Building2, Briefcase, Calendar, CheckSquare, BarChart3, FileText, UserCircle2, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsWithWebSocket } from '@/hooks/useNotificationsWithWebSocket';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

export const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const { unreadCount } = useNotifications();
    const { isWebSocketConnected } = useNotificationsWithWebSocket();

    // Auto-refresh des données toutes les 60 secondes (optimisé pour scalabilité)
    // ✅ Réduit de 30s à 60s → -66% charge serveur avec 100+ utilisateurs
    useAutoRefresh([
        ['notifications'],
        ['unread-count'],
        ['my-leaves'],
        ['pending-leaves'],
        ['my-balances'],
        ['user-profile']
    ], 60000, true);

    // Init + responsive sync: sidebar ouverte sur desktop, fermée sur mobile
    useEffect(() => {
        const setInitial = () => setIsSidebarOpen(window.innerWidth >= 768);
        setInitial();

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
                setIsUserMenuOpen(false);
                setIsNotificationOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close overlays on navigation (mobile focus)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
            setIsUserMenuOpen(false);
            setIsNotificationOpen(false);
        }
    }, [location.pathname]);

    // Handle Escape key to close menus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSidebarOpen) setIsSidebarOpen(false);
                if (isUserMenuOpen) setIsUserMenuOpen(false);
                if (isNotificationOpen) setIsNotificationOpen(false);
                menuButtonRef.current?.focus();
            }
        };

        if (isSidebarOpen || isUserMenuOpen || isNotificationOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isSidebarOpen, isUserMenuOpen, isNotificationOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Vérifier les permissions de l'utilisateur
    const hasRole = (roles: string[]) => {
        if (!user?.roles) return false;
        return user.roles.some(userRole => roles.includes(userRole));
    };

    const canViewEmployees = hasRole(['ADMIN', 'RH', 'MANAGER']);
    const canViewDepartments = hasRole(['ADMIN', 'RH']);
    const canViewJobs = hasRole(['ADMIN', 'RH']);
    const canApproveLeaves = hasRole(['ADMIN', 'RH', 'MANAGER']);
    const canViewStats = hasRole(['ADMIN', 'RH', 'MANAGER']);
    const canConfigLeaves = hasRole(['ADMIN', 'RH']);
    const canViewHistory = hasRole(['ADMIN', 'RH']);

    const navItems = [
        { label: 'Accueil', path: '/dashboard', icon: Home, visible: true },
        { label: 'Employés', path: '/dashboard/employees', icon: Users, visible: canViewEmployees },
        { label: 'Départements', path: '/dashboard/departments', icon: Building2, visible: canViewDepartments },
        { label: 'Postes', path: '/dashboard/jobs', icon: Briefcase, visible: canViewJobs },
        { label: 'Congés', path: '/dashboard/leaves', icon: Calendar, visible: true },
        { label: 'Validations', path: '/dashboard/leaves/approvals', icon: CheckSquare, visible: canApproveLeaves },
        { label: 'Stats congés', path: '/dashboard/leaves/stats', icon: BarChart3, visible: canViewStats },
        { label: 'Config. Congés', path: '/dashboard/leaves/config', icon: Settings, visible: canConfigLeaves },
        { label: 'Historique', path: '/dashboard/history', icon: FileText, visible: canViewHistory },
    ].filter(item => item.visible);

    // Générer breadcrumbs dynamiques
    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Accueil', path: '/dashboard' }];
        
        if (pathSegments.length > 1) {
            const currentPage = navItems.find(item => item.path === location.pathname);
            if (currentPage && currentPage.path !== '/dashboard') {
                breadcrumbs.push({ label: currentPage.label, path: currentPage.path });
            }
        }
        
        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar responsive */}
            <aside
                id="sidebar-nav"
                className={`flex flex-col bg-white border-r border-slate-200 transform transition-all duration-300 fixed md:static inset-y-0 left-0 z-40 md:z-20 overflow-hidden ${
                    isSidebarOpen
                        ? 'translate-x-0 w-72 md:w-64 shadow-xl md:shadow-none'
                        : '-translate-x-full w-72 md:w-0 md:opacity-0 pointer-events-none'
                }`}
            >
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">GestionRH</h1>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pro Edition</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto" aria-label="Menu principal">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200/50 font-semibold scale-[1.02]'
                                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-blue-600 hover:shadow-sm hover:scale-[1.01]'
                                    }`}
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setIsSidebarOpen(false);
                                    }
                                }}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                )}
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                
                {/* Section Profil Utilisateur */}
                <div className="p-4 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                            {(user?.prenom?.charAt(0) || user?.nom?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate leading-tight">
                                {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    {user?.roles?.[0] || 'User'}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
                    {/* Sidebar toggle button (desktop + mobile) */}
                    <button
                        ref={menuButtonRef}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label={isSidebarOpen ? 'Fermer la barre latérale' : 'Ouvrir la barre latérale'}
                        aria-expanded={isSidebarOpen}
                        aria-controls="sidebar-nav"
                        className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {isSidebarOpen ? (
                            <X className="w-6 h-6 text-slate-600" aria-hidden="true" />
                        ) : (
                            <Menu className="w-6 h-6 text-slate-600" aria-hidden="true" />
                        )}
                    </button>

                    {/* Search bar - Améliorée */}
                    <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border-2 border-slate-200 w-96 shadow-sm hover:shadow-md focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-100 transition-all group">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Rechercher... (Ctrl+K)"
                            aria-label="Rechercher dans l'application"
                            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full font-medium"
                        />
                        <kbd className="hidden group-focus-within:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded border border-slate-200">
                            ⌘K
                        </kbd>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
                                aria-expanded={isNotificationOpen}
                                className={`relative p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500'
                                }`}
                            >
                                <Bell className="w-5 h-5" aria-hidden="true" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            <NotificationDropdown 
                                isOpen={isNotificationOpen} 
                                onClose={() => setIsNotificationOpen(false)} 
                            />
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                        {/* User Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label={`Menu utilisateur - ${user?.prenom} ${user?.nom}`}
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="menu"
                                aria-controls="user-menu"
                                title={isWebSocketConnected ? '🟢 Connecté en temps réel' : '🟡 Mode hors ligne'}
                                className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 pr-2 py-1.5 rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-slate-800 leading-none mb-0.5 truncate">{`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none truncate">
                                        {user?.roles?.[0] || 'Utilisateur'}
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        {(user?.prenom?.charAt(0) || user?.nom?.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                        isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                                    }`} />
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all duration-300 flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isUserMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsUserMenuOpen(false)}
                                        role="presentation"
                                    ></div>
                                    <div 
                                        id="user-menu"
                                        role="menu"
                                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { navigate('/dashboard/profile'); setIsUserMenuOpen(false); }}
                                            role="menuitem"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50"
                                        >
                                            <User className="w-4 h-4" aria-hidden="true" /> Mon Profil
                                        </button>
                                        <button 
                                            onClick={() => { navigate('/dashboard/settings'); setIsUserMenuOpen(false); }}
                                            role="menuitem"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50"
                                        >
                                            <Settings className="w-4 h-4" aria-hidden="true" /> Paramètres
                                        </button>
                                        <div className="h-[1px] bg-slate-50 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            role="menuitem"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold focus:outline-none focus:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4" aria-hidden="true" /> Se déconnecter
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Breadcrumbs */}
                {breadcrumbs.length > 1 && (
                    <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-3">
                        <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center gap-2">
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            to={crumb.path}
                                            className="text-slate-500 hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded-lg transition-all font-medium"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-10 bg-[#F8FAFC]">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                    role="presentation"
                />
            )}
        </div>
    );
};
