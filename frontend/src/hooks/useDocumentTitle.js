import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) {
      return
    }

    document.title = title
  }, [title])
}
