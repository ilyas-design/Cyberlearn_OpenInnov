'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { addFavorite, removeFavorite, isFavorite } from '@/app/firebase/favorites';
import toast from 'react-hot-toast';
import styles from './FavoriteButton.module.css';

interface FavoriteButtonProps {
    lessonId: string;
    showLabel?: boolean;
}

export default function FavoriteButton({ lessonId, showLabel = false }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            if (user) {
                const favStatus = await isFavorite(user.uid, lessonId);
                setIsFav(favStatus);
            }
        };

        checkFavorite();
    }, [user, lessonId]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Vous devez être connecté pour ajouter des favoris');
            return;
        }

        setLoading(true);

        try {
            if (isFav) {
                const success = await removeFavorite(user.uid, lessonId);
                if (success) {
                    setIsFav(false);
                    toast.success('Retiré des favoris');
                }
            } else {
                const success = await addFavorite(user.uid, lessonId);
                if (success) {
                    setIsFav(true);
                    toast.success('Ajouté aux favoris ⭐');
                }
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour des favoris');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`${styles.favoriteButton} ${isFav ? styles.active : ''}`}
            onClick={handleToggleFavorite}
            disabled={loading}
            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
            <Star
                size={showLabel ? 18 : 20}
                fill={isFav ? 'currentColor' : 'none'}
            />
            {showLabel && (
                <span className={styles.label}>
                    {isFav ? 'Favori' : 'Ajouter aux favoris'}
                </span>
            )}
        </button>
    );
}
