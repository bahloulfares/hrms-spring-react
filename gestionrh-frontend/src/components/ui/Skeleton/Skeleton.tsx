import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}) => {
    const baseClasses = 'bg-slate-200';
    
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };
    
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };
    
    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };
    
    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
};

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant="text"
                    width={index === lines - 1 ? '75%' : '100%'}
                    height="0.875rem"
                />
            ))}
        </div>
    );
};

interface SkeletonCardProps {
    className?: string;
    hasImage?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', hasImage = false }) => {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
            {hasImage && (
                <Skeleton variant="rectangular" height="12rem" className="mb-4" />
            )}
            <Skeleton variant="text" height="1.5rem" className="mb-3" width="60%" />
            <SkeletonText lines={3} />
            <div className="flex gap-2 mt-4">
                <Skeleton variant="rectangular" height="2.5rem" width="6rem" />
                <Skeleton variant="rectangular" height="2.5rem" width="6rem" />
            </div>
        </div>
    );
};

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
    rows = 5,
    columns = 4,
    className = '',
}) => {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, index) => (
                        <Skeleton key={index} variant="text" height="1rem" width="80%" />
                    ))}
                </div>
            </div>
            
            {/* Rows */}
            <div className="divide-y divide-slate-200">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton key={colIndex} variant="text" height="0.875rem" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface SkeletonStatCardProps {
    className?: string;
}

export const SkeletonStatCard: React.FC<SkeletonStatCardProps> = ({ className = '' }) => {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width="3rem" height="3rem" />
                <Skeleton variant="rectangular" width="4rem" height="1.5rem" />
            </div>
            <Skeleton variant="text" height="2rem" width="50%" className="mb-2" />
            <Skeleton variant="text" height="0.875rem" width="70%" />
        </div>
    );
};

interface SkeletonChartProps {
    className?: string;
    height?: string | number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ className = '', height = '20rem' }) => {
    return (
        <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
            <Skeleton variant="text" height="1.5rem" width="40%" className="mb-6" />
            <div className="flex items-end justify-between gap-2" style={{ height }}>
                {Array.from({ length: 8 }).map((_, index) => {
                    const randomHeight = Math.floor(Math.random() * 60) + 40;
                    return (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            width="100%"
                            height={`${randomHeight}%`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
