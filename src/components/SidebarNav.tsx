import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../services/authService';
import './SidebarNav.css';

type NavItem = {
    label: string;
    to: string;
    icon: string;
};

export default function SidebarNav() {
    const [collapsed, setCollapsed] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

    // 인증 상태에 따른 네비게이션 아이템 구성
    const authItems: NavItem[] = isLoggedIn
        ? [{ label: 'Profile', to: '/profile', icon: '👤' }]
        : [
            { label: 'Login', to: '/login', icon: '🔑' },
            { label: 'Sign Up', to: '/login?signup=true', icon: '✍️' },
        ];

    const mainItems: NavItem[] = [
        { label: 'Learn', to: '/', icon: '🏠' },
        { label: 'Practice Today', to: '/simulation', icon: '🎯' },
        { label: 'Alphabet', to: '/alphabet', icon: '🔤' },
        { label: 'Learning History', to: '/history', icon: '🕘' },
    ];

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved === 'true') setCollapsed(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(collapsed));
    }, [collapsed]);

    // 인증 상태 변경 감지 (로그인/로그아웃 시 사이드바 업데이트)
    useEffect(() => {
        const checkAuthStatus = () => {
            setIsLoggedIn(authService.isAuthenticated());
        };

        // storage 이벤트로 로그인/로그아웃 감지
        window.addEventListener('storage', checkAuthStatus);

        // 주기적으로 인증 상태 확인 (같은 탭에서의 변경 감지)
        const interval = setInterval(checkAuthStatus, 1000);

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
            clearInterval(interval);
        };
    }, []);

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
                {/* 인증 관련 버튼 (Profile 또는 Login/Sign Up) */}
                {authItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
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

                {/* 구분선 */}
                <div className="sidebar-divider"></div>

                {/* 메인 메뉴 (Learn, Alphabet, Learning History) */}
                {mainItems.map((item) => (
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
