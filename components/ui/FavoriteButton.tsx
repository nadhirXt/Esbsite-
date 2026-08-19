'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/actions/favorites'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  documentId: string
  initialIsFavorite: boolean
  className?: string
  iconClassName?: string
}

export default function FavoriteButton({ documentId, initialIsFavorite, className, iconClassName }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic update
    const newValue = !isFavorite
    setIsFavorite(newValue)
    
    if (newValue) {
      toast.success('Ajouté aux favoris')
    } else {
      toast.info('Retiré des favoris')
    }

    startTransition(async () => {
      try {
        const actualValue = await toggleFavorite(documentId, window.location.pathname)
        if (actualValue !== newValue) {
          setIsFavorite(actualValue)
          toast.error('Une erreur est survenue lors de la synchronisation')
        }
      } catch (error) {
        setIsFavorite(!newValue) // Revert on error
        toast.error('Erreur de connexion')
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "p-1.5 rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center",
        isFavorite 
          ? "text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20" 
          : "text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800",
        className
      )}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart 
        className={cn("w-4 h-4 transition-transform", isFavorite && "fill-current scale-110", iconClassName)} 
      />
    </button>
  )
}
