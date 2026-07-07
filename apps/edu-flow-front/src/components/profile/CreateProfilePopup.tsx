'use client'

import { useEffect, useState } from 'react'
import styles from './createProfilePopup.module.scss'
import { createTeacherProfile, createStudentProfile } from '@/api/profile/controller'
import { getListUsers } from '@/api/user/controller'

type ProfileRole = 'teacher' | 'student'

interface CreateProfilePopupProps {
    isOpen: boolean
    onClose: () => void
}

export const CreateProfilePopup = ({ isOpen, onClose }: CreateProfilePopupProps) => {
    const [role, setRole] = useState<ProfileRole>('teacher')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    // Shared fields
    const [email, setEmail] = useState('')

    // Teacher-specific
    const [department, setDepartment] = useState('')

    // Student-specific
    const [studentId, setStudentId] = useState('')

    // User list for selecting
    const [users, setUsers] = useState<any[]>([])
    const [selectedUserId, setSelectedUserId] = useState('')
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [hasLoadedUsers, setHasLoadedUsers] = useState(false)

    // Fetch users when popup opens
    const loadUsers = async () => {
        if (hasLoadedUsers) return
        setIsLoadingUsers(true)
        try {
            const res = await getListUsers(`/users/${role === 'teacher' ? "teacher" : "student"}`)
            setUsers(res.data || [])
            setHasLoadedUsers(true)
        } catch (err) {
            console.error('Failed to fetch users:', err)
            setUsers([])
        } finally {
            setIsLoadingUsers(false)
        }
    }

    // Load users on first open
    useEffect(() => {
        if (isOpen && !hasLoadedUsers && !isLoadingUsers) {
            loadUsers()
        }
    }, [isOpen, role]);

    const resetForm = () => {
        setEmail('')
        setDepartment('')
        setStudentId('')
        setSelectedUserId('')
        setFormError('')
        setFormSuccess('')
    }

    const handleClose = () => {
        if (isSubmitting) return
        resetForm()
        setHasLoadedUsers(false)
        onClose()
    }

    const handleRoleSwitch = (newRole: ProfileRole) => {
        setRole(newRole)
        setHasLoadedUsers(false)
        setFormError('')
        setFormSuccess('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')

        if (!selectedUserId) {
            setFormError('กรุณาเลือกผู้ใช้')
            return
        }

        if (role === 'teacher') {
            if (!department.trim()) {
                setFormError('กรุณากรอกภาควิชา')
                return
            }
        } else {
            if (!studentId.trim()) {
                setFormError('กรุณากรอกรหัสนักเรียน')
                return
            }
        }

        setIsSubmitting(true)
        try {
            if (role === 'teacher') {
                await createTeacherProfile({
                    userId: selectedUserId,
                    department: department.trim(),
                })
                setFormSuccess('สร้างโปรไฟล์ครูสำเร็จ!')
            } else {
                await createStudentProfile({
                    userId: selectedUserId,
                    studentId: studentId.trim(),
                })
                setFormSuccess('สร้างโปรไฟล์นักเรียนสำเร็จ!')
            }

            setTimeout(() => {
                handleClose()
            }, 1200)
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างโปรไฟล์'
            setFormError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={handleClose} id="create-profile-modal-overlay">
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} id="create-profile-modal">
                {/* Close Button */}
                <button className={styles.modalClose} onClick={handleClose} id="profile-modal-close-btn" aria-label="ปิด">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalIcon} data-role={role}>
                        {role === 'teacher' ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </div>
                    <h2 className={styles.modalTitle}>
                        {role === 'teacher' ? 'สร้างโปรไฟล์ครู' : 'สร้างโปรไฟล์นักเรียน'}
                    </h2>
                    <p className={styles.modalSubtitle}>
                        {role === 'teacher'
                            ? 'เลือกผู้ใช้และกรอกข้อมูลภาควิชาเพื่อสร้างโปรไฟล์ครู'
                            : 'เลือกผู้ใช้และกรอกรหัสนักเรียนเพื่อสร้างโปรไฟล์นักเรียน'}
                    </p>
                </div>

                {/* Role Tabs */}
                <div className={styles.roleTabs}>
                    <button
                        type="button"
                        className={role === 'teacher' ? styles.roleTabActive : styles.roleTab}
                        data-role="teacher"
                        onClick={() => handleRoleSwitch('teacher')}
                        id="role-tab-teacher"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        ครู
                    </button>
                    <button
                        type="button"
                        className={role === 'student' ? styles.roleTabActive : styles.roleTab}
                        data-role="student"
                        onClick={() => handleRoleSwitch('student')}
                        id="role-tab-student"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        นักเรียน
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* User Selection */}
                    <div className={styles.formGroup}>
                        <label htmlFor="profileUserId" className={styles.formLabel}>
                            เลือกผู้ใช้ <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="profileUserId"
                            name="userId"
                            className={styles.formSelect}
                            value={selectedUserId}
                            onChange={(e) => { setSelectedUserId(e.target.value); setFormError(''); }}
                            disabled={isLoadingUsers}
                        >
                            <option className='bg-black' value="">
                                {isLoadingUsers ? 'กำลังโหลด...' : '-- เลือกผู้ใช้ --'}
                            </option>
                            {users.map((user: any) => (
                                <option className='bg-black' key={user.id} value={user.id}>
                                    {user.name || user.email} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher: Department */}
                    {role === 'teacher' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="department" className={styles.formLabel}>
                                ภาควิชา <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                className={styles.formInput}
                                placeholder="เช่น Electrical Education"
                                value={department}
                                onChange={(e) => { setDepartment(e.target.value); setFormError(''); }}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Student: Student ID */}
                    {role === 'student' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="studentIdInput" className={styles.formLabel}>
                                รหัสนักเรียน <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="studentIdInput"
                                name="studentId"
                                className={styles.formInput}
                                data-role="student"
                                placeholder="เช่น 65010001"
                                value={studentId}
                                onChange={(e) => { setStudentId(e.target.value); setFormError(''); }}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Error / Success Messages */}
                    {formError && (
                        <div className={styles.formMessage} data-type="error" id="profile-form-error-msg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {formError}
                        </div>
                    )}
                    {formSuccess && (
                        <div className={styles.formMessage} data-type="success" id="profile-form-success-msg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {formSuccess}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleClose}
                            disabled={isSubmitting}
                            id="profile-modal-cancel-btn"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            data-role={role}
                            disabled={isSubmitting}
                            id="profile-modal-submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles.spinner} />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    {role === 'teacher' ? 'สร้างโปรไฟล์ครู' : 'สร้างโปรไฟล์นักเรียน'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
