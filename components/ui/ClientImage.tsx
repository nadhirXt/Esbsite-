'use client'

import { ImgHTMLAttributes, useState } from 'react'

export function ClientImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return null
  }

  return (
    <img
      {...props}
      onError={(e) => {
        setHasError(true)
        if (props.onError) {
          props.onError(e)
        }
      }}
    />
  )
}
