import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { User, LogOut, Settings, ChevronDown, Bell, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const DashboardLayout = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // Handle Escape key to close menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
                // Restore focus to menu button
                menuButtonRef.current?.focus();
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isMenuOpen]);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const navItems = [
        { label: 'Accueil', path: '/dashboard', icon: '🏠' },
        { label: 'Employés', path: '/dashboard/employees', icon: '👥' },
        { label: 'Départements', path: '/dashboard/departments', icon: '🏢' },
        { label: 'Postes', path: '/dashboard/jobs', icon: '💼' },
        { label: 'Congés', path: '/dashboard/leaves', icon: '📅' },
        ...(user?.roles?.some(role => ['ADMIN', 'RH', 'MANAGER'].includes(role))
            ? [{ label: 'Validations', path: '/dashboard/leaves/approvals', icon: '✅' }]
            : []),
        ...(user?.roles?.some(role => ['ADMIN', 'RH', 'MANAGER'].includes(role))
            ? [{ label: 'Stats congés', path: '/dashboard/leaves/stats', icon: '📊' }]
            : []),
        ...(user?.roles?.includes('ADMIN') ? [{ label: 'Config. Congés', path: '/dashboard/leaves/config', icon: '⚙️' }] : []),
        { label: 'Historique', path: '/dashboard/history', icon: '📜' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">GestionRH</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1" aria-label="Menu principal">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            aria-current={location.pathname === item.path ? 'page' : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold translate-x-1'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav"
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Search bar - Hidden on small screens */}
                    <div className="hidden md:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            aria-label="Rechercher dans l'application"
                            className="bg-transparent border-none outline-none text-sm text-slate-600 w-full focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button 
                            aria-label="Notifications"
                            className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Bell className="w-5 h-5 text-slate-500" aria-hidden="true" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" aria-label="Nouvelle notification"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

                        {/* User Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                ref={menuButtonRef}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label={`Menu utilisateur - ${user?.nomComplet}`}
                                aria-expanded={isMenuOpen}
                                aria-haspopup="menu"
                                aria-controls="user-menu"
                                className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 pr-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user?.nomComplet}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                        {user?.roles?.[0]}
                                    </div>
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                                    {user?.nomComplet?.charAt(0)}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsMenuOpen(false)}
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
                                            onClick={() => { navigate('/dashboard/profile'); setIsMenuOpen(false); }}
                                            role="menuitem"
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50"
                                        >
                                            <User className="w-4 h-4" aria-hidden="true" /> Mon Profil
                                        </button>
                                        <button 
                                            onClick={() => { navigate('/dashboard/settings'); setIsMenuOpen(false); }}
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

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-10 bg-[#F8FAFC]">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile navigation overlay */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMenuOpen(false)}
                    role="presentation"
                >
                    <div
                        id="mobile-nav"
                        role="navigation"
                        aria-label="Navigation mobile"
                        className="w-72 h-full bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold" aria-hidden="true">G</div>
                                <h1 className="text-xl font-black text-slate-800 tracking-tight">GestionRH</h1>
                            </div>
                            <nav className="space-y-1" aria-label="Menu principal">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        aria-current={location.pathname === item.path ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${location.pathname === item.path
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-lg" aria-hidden="true">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
