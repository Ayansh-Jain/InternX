import { motion } from 'framer-motion'

const variants = {
    primary: {
        base: {
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
            color: '#E6CFA6',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(58, 75, 65, 0.3)',
        },
    },
    secondary: {
        base: {
            padding: '16px 32px',
            background: 'transparent',
            color: '#3A4B41',
            border: '2px solid #3A4B41',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textDecoration: 'none',
        },
    },
    ghost: {
        base: {
            padding: '12px 24px',
            background: 'transparent',
            color: '#6B7280',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
        },
    },
    beige: {
        base: {
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #E6CFA6 0%, #D4BC8E 100%)',
            color: '#3A4B41',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(230, 207, 166, 0.4)',
        },
    },
}

const sizes = {
    small: {
        padding: '10px 20px',
        fontSize: '14px',
        borderRadius: '8px',
    },
    medium: {
        padding: '14px 28px',
        fontSize: '15px',
        borderRadius: '10px',
    },
    large: {
        padding: '18px 36px',
        fontSize: '17px',
        borderRadius: '12px',
    },
}

function AnimatedButton({
    children,
    variant = 'primary',
    size = 'medium',
    onClick,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style = {},
    ...props
}) {
    const variantStyle = variants[variant]?.base || variants.primary.base
    const sizeStyle = sizes[size] || sizes.medium

    const buttonStyle = {
        ...variantStyle,
        ...sizeStyle,
        ...(fullWidth && { width: '100%' }),
        ...(disabled && { opacity: 0.6, cursor: 'not-allowed' }),
        ...style,
    }

    return (
        <motion.button
            style={buttonStyle}
            onClick={disabled ? undefined : onClick}
            whileHover={disabled ? {} : { scale: 1.03, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
            disabled={disabled}
            {...props}
        >
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span>{icon}</span>}
        </motion.button>
    )
}

export default AnimatedButton
