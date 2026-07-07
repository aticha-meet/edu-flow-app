'use client'

import { useState, useEffect } from 'react'
import styles from '@/app/exam/exam.module.scss'

interface ScoreRingProps {
    percentage: number
}

export const ScoreRing = ({ percentage }: ScoreRingProps) => {
    const radius = 60
    const stroke = 8
    const normalizedRadius = radius - stroke / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const [offset, setOffset] = useState(circumference)

    useEffect(() => {
        const timer = setTimeout(() => {
            setOffset(circumference - (percentage / 100) * circumference)
        }, 100)
        return () => clearTimeout(timer)
    }, [circumference, percentage])

    const getStrokeColor = () => {
        if (percentage >= 80) return '#22c55e'
        if (percentage >= 60) return '#6366f1'
        if (percentage >= 40) return '#f59e0b'
        return '#ef4444'
    }

    return (
        <div className={styles.scoreRing}>
            <svg className={styles.scoreRingSvg} width={radius * 2} height={radius * 2}>
                <circle
                    className={styles.scoreRingBg}
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className={styles.scoreRingFill}
                    stroke={getStrokeColor()}
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className={styles.scoreRingText}>
                <span className={styles.scoreRingPercent}>{percentage}</span>
                <span className={styles.scoreRingLabel}>คะแนน %</span>
            </div>
        </div>
    )
}
