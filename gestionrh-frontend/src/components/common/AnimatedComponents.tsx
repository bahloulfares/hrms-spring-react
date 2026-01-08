import { motion } from 'framer-motion';
import React from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
};

export const FadeIn: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {children}
        </motion.div>
    );
};

export const SlideIn: React.FC<PageTransitionProps & { direction?: 'left' | 'right' | 'up' | 'down' }> = ({
    children,
    direction = 'left'
}) => {
    const variants = {
        left: { x: -50 },
        right: { x: 50 },
        up: { y: -50 },
        down: { y: 50 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...variants[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export const ScaleIn: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
        >
            {children}
        </motion.div>
    );
};
