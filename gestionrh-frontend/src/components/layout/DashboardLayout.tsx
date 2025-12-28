import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { User, LogOut, Settings, ChevronDown, Bell, Search } from 'lucide-react';
import { useState } from 'react';

export const DashboardLayout = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        ...(user?.roles?.includes('ADMIN') ? [{ label: 'Config. Congés', path: '/dashboard/leaves/config', icon: '⚙️' }] : []),
        { label: 'Historique', path: '/dashboard/history', icon: '📜' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">GestionRH</h1>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
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
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="bg-transparent border-none outline-none text-sm text-slate-600 w-full"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors">
                            <Bell className="w-5 h-5 text-slate-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-slate-200"></div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl hover:bg-slate-50 transition-all group"
                            >
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user?.nomComplet}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                        {user?.roles?.[0]}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                                    {user?.nomComplet?.charAt(0)}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { navigate('/dashboard/profile'); setIsMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <User className="w-4 h-4" /> Mon Profil
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                            <Settings className="w-4 h-4" /> Paramètres
                                        </button>
                                        <div className="h-[1px] bg-slate-50 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                                        >
                                            <LogOut className="w-4 h-4" /> Se déconnecter
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-10 bg-[#F8FAFC]">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
