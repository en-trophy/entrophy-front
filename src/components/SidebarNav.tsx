import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarNav.css';

type NavItem = {
    label: string;
    to: string;
    icon: string;
};

const navItems: NavItem[] = [
    { label: 'Learn', to: '/', icon: '🏠' },
    { label: 'Alphabet', to: '/alphabet', icon: '🔤' },
    { label: 'Profile', to: '/profile', icon: '👤' },
    { label: 'Learning History', to: '/history', icon: '🕘' },
];

export default function SidebarNav() {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved === 'true') setCollapsed(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(collapsed));
    }, [collapsed]);

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-top">
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setCollapsed((v) => !v)}
                    aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    =
                </button>

            </div>

            <nav className="sidebar-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        <span className="sidebar-icon" aria-hidden>
                            {item.icon}
                        </span>
                        {!collapsed && <span className="sidebar-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!collapsed ? (
                    <span className="sidebar-footer-text">AI Sign Language Tutor</span>
                ) : (
                    <span className="sidebar-footer-dot" aria-hidden>
                        •
                    </span>
                )}
            </div>
        </aside>
    );
}
