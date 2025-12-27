import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../features/auth/authSlice';

export const DashboardLayout = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const navItems = [
        { label: 'Accueil', path: '/dashboard' },
        { label: 'Employés', path: '/dashboard/employees' },
        { label: 'Départements', path: '/dashboard/departments' },
        { label: 'Postes', path: '/dashboard/jobs' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">GestionRH</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded-md transition-colors ${location.pathname === item.path
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};
