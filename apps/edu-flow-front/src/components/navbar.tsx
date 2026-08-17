'use client';

import { useState } from 'react';
import style from './navbar.module.scss';
import Link from 'next/link';
import { CreateProfilePopup } from '@/components/profile/CreateProfilePopup';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/course', label: 'Course' },
  // { href: '/courses', label: 'Courses' },
  // { href: '/exam', label: 'Exam' },
  // { href: '/schedule', label: 'Schedule' },
  // { href: '/reports', label: 'Reports' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  return (
    <>
      <nav className={style.navbar}>
        <div className={style.navbarInner}>
          {/* Logo */}
          <Link href="/" className={style.logo}>
            <div className={style.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              </svg>
            </div>
            <span className={style.logoText}>EduFlow</span>
          </Link>

          {/* Navigation Links — Centered */}
          <ul className={style.navLinks}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    pathname?.startsWith(item.href)
                      ? style.navLinkActive
                      : style.navLink
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Button */}
          <div className={style.navActions}>
            {/* Create Profile Button */}
            <button
              className={style.createProfileBtn}
              onClick={() => setIsProfilePopupOpen(true)}
              id="create-profile-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              สร้างโปรไฟล์
            </button>

            <button className={style.loginBtn}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Popup */}
      <CreateProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
      />
    </>
  );
};
