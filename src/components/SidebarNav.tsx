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
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">=</div>
                <div className="sidebar-title">Equal Sign</div>
            </div>

            <nav className="sidebar-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        end={item.to === '/'}
                    >
                        <span className="sidebar-icon" aria-hidden>
                            {item.icon}
                        </span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <span className="sidebar-footer-text">AI Sign Language Tutor</span>
            </div>
        </aside>
    );
}
