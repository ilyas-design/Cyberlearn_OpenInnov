'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Rechercher...', initialValue = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300); // Debounce de 300ms

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
            <Search className={styles.searchIcon} size={20} />
            <input
                type="text"
                className={styles.searchInput}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {query && (
                <button
                    className={styles.clearButton}
                    onClick={handleClear}
                    aria-label="Effacer la recherche"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}
