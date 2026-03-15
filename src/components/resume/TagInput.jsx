import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { styles } from './FormStyles'

export default function TagInput({ tags, onAdd, onRemove, placeholder }) {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()
            onAdd(inputValue.trim())
            setInputValue('')
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onRemove(tags.length - 1)
        }
    }

    return (
        <div style={styles.tagInput}>
            {tags.map((tag, index) => (
                <motion.span
                    key={index}
                    style={styles.tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    {tag}
                    <button
                        type="button"
                        style={styles.tagRemove}
                        onClick={() => onRemove(index)}
                    >
                        <X size={14} />
                    </button>
                </motion.span>
            ))}
            <input
                type="text"
                style={styles.tagInputField}
                placeholder={tags.length === 0 ? placeholder : ''}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}
