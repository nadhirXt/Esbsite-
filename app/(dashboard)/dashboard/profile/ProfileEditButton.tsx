'use client'

import { useState } from 'react'
import { Edit2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import ProfileEditModal from './ProfileEditModal'

export default function ProfileEditButton({ initialName, initialLinkedin }: { initialName: string, initialLinkedin: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit2 className="w-4 h-4 mr-2" />
        Modifier le profil
      </Button>

      {isOpen && (
        <ProfileEditModal 
          initialName={initialName} 
          initialLinkedin={initialLinkedin} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}
