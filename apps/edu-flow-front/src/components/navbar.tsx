import style from './navbar.module.scss'

export const Navbar = () => {
    return (
        <nav className={style.navbar}>
            <div className={style.navbarInner}>
                {/* Logo */}
                <div className={style.logo}>
                    <div className={style.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                        </svg>
                    </div>
                    <span className={style.logoText}>EduFlow</span>
                </div>

                {/* Navigation Links */}
                <ul className={style.navLinks}>
                    <li><a href="#" className={style.navLinkActive}>Home</a></li>
                    <li><a href="#" className={style.navLink}>Courses</a></li>
                    <li><a href="#" className={style.navLink}>Schedule</a></li>
                    <li><a href="#" className={style.navLink}>Reports</a></li>
                </ul>

                {/* Auth Button */}
                <div className={style.navActions}>
                    <button className={style.loginBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Login
                    </button>
                </div>
            </div>
        </nav>
    )
}