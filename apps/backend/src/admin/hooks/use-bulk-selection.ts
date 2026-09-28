import { useState, useCallback, useMemo } from "react"

export function useBulkSelection<T extends { id: string }>(items: T[] = []) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({})

  const selectedIds = useMemo(() => {
    return Object.keys(selectedMap).filter((id) => selectedMap[id])
  }, [selectedMap])

  const selectedCount = selectedIds.length

  const isSelected = useCallback(
    (id: string) => Boolean(selectedMap[id]),
    [selectedMap]
  )

  const toggleItem = useCallback((id: string) => {
    setSelectedMap((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = true
      }
      return next
    })
  }, [])

  const selectItems = useCallback((ids: string[]) => {
    setSelectedMap((prev) => {
      const next = { ...prev }
      for (const id of ids) {
        next[id] = true
      }
      return next
    })
  }, [])

  const deselectItems = useCallback((ids: string[]) => {
    setSelectedMap((prev) => {
      const next = { ...prev }
      for (const id of ids) {
        delete next[id]
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMap({})
  }, [])

  const isAllSelected = useMemo(() => {
    if (items.length === 0) return false
    return items.every((item) => selectedMap[item.id])
  }, [items, selectedMap])

  const isSomeSelected = useMemo(() => {
    if (items.length === 0) return false
    return items.some((item) => selectedMap[item.id]) && !isAllSelected
  }, [items, selectedMap, isAllSelected])

  const togglePage = useCallback(() => {
    if (isAllSelected) {
      deselectItems(items.map((i) => i.id))
    } else {
      selectItems(items.map((i) => i.id))
    }
  }, [isAllSelected, items, deselectItems, selectItems])

  return {
    selectedIds,
    selectedCount,
    isSelected,
    toggleItem,
    togglePage,
    selectItems,
    deselectItems,
    clearSelection,
    isAllSelected,
    isSomeSelected,
  }
}
