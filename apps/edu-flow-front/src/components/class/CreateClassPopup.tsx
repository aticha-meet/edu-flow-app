'use client'

import { useEffect, useState } from "react";
import { createClass } from "@/api/class/controller";
import { getTeachers } from "@/api/user/controller";
import useUserStore from "@/store/userStore";

interface formDataType {
    className: string;
    description: string;
    teacherId: string;
}

interface TeacherOption {
    id: string;
    userId: string;
    department: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface CreatePopupType {
    styles?: Record<string, string>;
    setFormData: (data: any) => void;
    setIsModalOpen: (value: boolean) => void;
    setFormError: (value: string) => void;
    setFormSuccess: (value: string) => void;
    setIsSubmitting: (value: boolean) => void;
    isSubmitting: boolean;
    formData: formDataType;
    fetchClasses: () => Promise<void>;
    formError: string;
    formSuccess: string;
}

export const CreateClassPopup = (
    {
        styles,
        setFormData,
        setIsModalOpen,
        setFormError,
        setFormSuccess,
        setIsSubmitting,
        isSubmitting,
        formData,
        fetchClasses,
        formError,
        formSuccess
    }: CreatePopupType) => {

    const userSession = useUserStore((state: any) => state.session);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

    // Fetch teachers when popup opens
    useEffect(() => {
        const fetchTeachers = async () => {
            setIsLoadingTeachers(true);
            try {
                const res = await getTeachers();
                setTeachers(res.data || []);
            } catch (err) {
                console.error("Failed to fetch teachers:", err);
                setTeachers([]);
            } finally {
                setIsLoadingTeachers(false);
            }
        };
        fetchTeachers();
    }, []);

    const handleCloseModal = () => {
        if (isSubmitting) return; // ห้ามปิดขณะกำลัง submit
        setIsModalOpen(false);
        setFormError('');
        setFormSuccess('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: formDataType) => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: formDataType) => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validate
        if (!formData.className.trim()) {
            setFormError('กรุณากรอกชื่อรายวิชา');
            return;
        }
        if (!formData.teacherId) {
            setFormError('กรุณาเลือกอาจารย์ผู้สอน');
            return;
        }

        setIsSubmitting(true);
        try {
            await createClass({
                className: formData.className.trim(),
                description: formData.description.trim() || undefined,
                teacherId: formData.teacherId,
                role: userSession.role,
            });
            setFormSuccess('สร้างรายวิชาสำเร็จ!');
            // Refresh class list after a brief delay
            setTimeout(() => {
                setIsModalOpen(false);
                setFormSuccess('');
                fetchClasses();
            }, 1200);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างรายวิชา';
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles?.modalOverlay} onClick={handleCloseModal} id="create-class-modal-overlay">
            <div className={styles?.modalContent} onClick={(e) => e.stopPropagation()} id="create-class-modal">
                {/* Close button */}
                <button className={styles?.modalClose} onClick={handleCloseModal} id="modal-close-btn" aria-label="ปิด">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Header */}
                <div className={styles?.modalHeader}>
                    <div className={styles?.modalIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <h2 className={styles?.modalTitle}>สร้างรายวิชาใหม่</h2>
                    <p className={styles?.modalSubtitle}>กรอกข้อมูลรายวิชาที่ต้องการสร้าง</p>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateClass} className={styles?.modalForm}>
                    <div className={styles?.formGroup}>
                        <label htmlFor="className" className={styles?.formLabel}>
                            ชื่อรายวิชา <span className={styles?.required}>*</span>
                        </label>
                        <input
                            type="text"
                            id="className"
                            name="className"
                            className={styles?.formInput}
                            placeholder="เช่น Introduction to Computer Science"
                            value={formData.className}
                            onChange={handleInputChange}
                            autoFocus
                        />
                    </div>

                    <div className={styles?.formGroup}>
                        <label htmlFor="description" className={styles?.formLabel}>
                            คำอธิบาย
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className={styles?.formTextarea}
                            placeholder="คำอธิบายรายวิชา (ไม่จำเป็นต้องกรอก)"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div className={styles?.formGroup}>
                        <label htmlFor="teacherId" className={styles?.formLabel}>
                            อาจารย์ผู้สอน <span className={styles?.required}>*</span>
                        </label>
                        <select
                            id="teacherId"
                            name="teacherId"
                            className={styles?.formSelect}
                            value={formData.teacherId}
                            onChange={handleSelectChange}
                            disabled={isLoadingTeachers}
                        >
                            <option value="">
                                {isLoadingTeachers ? 'กำลังโหลด...' : '-- เลือกอาจารย์ผู้สอน --'}
                            </option>
                            {teachers.map((teacher) => (
                                <option key={teacher.userId} value={teacher.userId}>
                                    {teacher.user?.name || teacher.user?.email || teacher.userId}
                                    {teacher.department ? ` (${teacher.department})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Error / Success Messages */}
                    {formError && (
                        <div className={styles?.formMessage} data-type="error" id="form-error-msg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {formError}
                        </div>
                    )}
                    {formSuccess && (
                        <div className={styles?.formMessage} data-type="success" id="form-success-msg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {formSuccess}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles?.modalActions}>
                        <button
                            type="button"
                            className={styles?.cancelBtn}
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                            id="modal-cancel-btn"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className={styles?.submitBtn}
                            disabled={isSubmitting}
                            id="modal-submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles?.spinner} />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    สร้างรายวิชา
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}