'use client';

import { useState, useRef, useEffect } from 'react';
import style from './navbar.module.scss';
import Link from 'next/link';
import { CreateProfilePopup } from '@/components/profile/CreateProfilePopup';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { href: '/course', label: 'Course' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;
  const userRole = user?.role as 'ADMIN' | 'TEACHER' | 'STUDENT' | undefined;
  const isAuthenticated = status === 'authenticated' && !!user;

  // ADMIN can create both teacher & student; TEACHER can only create student
  const allowedRoles: ('teacher' | 'student')[] | undefined =
    userRole === 'TEACHER' ? ['student'] : undefined;

  const canCreateProfile = userRole === 'ADMIN' || userRole === 'TEACHER';

  // Extract avatar initials
  const userName = user?.name || user?.email || 'User';
  const userEmail = user?.email || '';
  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut({ callbackUrl: '/login' });
  };

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

          {/* Actions */}
          <div className={style.navActions}>
            {/* Create Profile Button (Preserved for ADMIN & TEACHER) */}
            {canCreateProfile && (
              <button
                className={style.createProfileBtn}
                onClick={() => setIsProfilePopupOpen(true)}
                id="create-profile-btn"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
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
                <span>สร้างโปรไฟล์</span>
              </button>
            )}

            {/* Profile Avatar / Dropdown OR Login Button */}
            {isAuthenticated ? (
              <div className={style.profileContainer} ref={dropdownRef}>
                <button
                  className={`${style.profileBtn} ${isDropdownOpen ? style.active : ''}`}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  id="profile-dropdown-btn"
                  type="button"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={userName}
                      className={style.avatar}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={style.avatarFallback}>
                      {userInitial}
                    </div>
                  )}

                  {/* User Info Preview */}
                  <div className={style.userInfo}>
                    <span className={style.userName}>{userName}</span>
                    {userRole && (
                      <span className={style.userRoleMini}>{userRole}</span>
                    )}
                  </div>

                  {/* Chevron Icon */}
                  <svg
                    className={`${style.chevron} ${isDropdownOpen ? style.open : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={style.dropdown} role="menu" aria-label="User menu">
                    {/* User Header */}
                    <div className={style.dropdownHeader}>
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={userName}
                          className={style.largeAvatar}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={style.largeAvatarFallback}>
                          {userInitial}
                        </div>
                      )}
                      <div className={style.dropdownUserMeta}>
                        <p className={style.dropdownUserName}>{userName}</p>
                        <p className={style.dropdownUserEmail}>{userEmail}</p>
                        {userRole && (
                          <span className={style.roleBadge} data-role={userRole}>
                            {userRole}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={style.dropdownDivider} />

                    {/* Menu List */}
                    <ul className={style.dropdownList} role="none">
                      <li role="none">
                        <Link
                          href="/course"
                          className={style.dropdownLink}
                          onClick={() => setIsDropdownOpen(false)}
                          role="menuitem"
                        >
                          <span className={style.dropdownItemIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                          </span>
                          <span>ห้องเรียนของฉัน</span>
                        </Link>
                      </li>

                      {canCreateProfile && (
                        <li role="none">
                          <button
                            type="button"
                            className={style.dropdownItem}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsProfilePopupOpen(true);
                            }}
                            role="menuitem"
                          >
                            <span className={style.dropdownItemIcon}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                              </svg>
                            </span>
                            <span>สร้างโปรไฟล์</span>
                          </button>
                        </li>
                      )}

                      <div className={style.dropdownDivider} />

                      <li role="none">
                        <button
                          type="button"
                          className={style.logoutItem}
                          onClick={handleLogout}
                          role="menuitem"
                          id="logout-btn"
                        >
                          <span className={style.dropdownItemIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          </span>
                          <span>ออกจากระบบ</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={style.loginBtn} id="navbar-login-btn">
                <svg
                  width="16"
                  height="16"
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
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Popup */}
      <CreateProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        allowedRoles={allowedRoles}
      />
    </>
  );
};
