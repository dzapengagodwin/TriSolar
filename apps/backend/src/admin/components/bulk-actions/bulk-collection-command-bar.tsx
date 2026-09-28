import { CommandBar } from "@medusajs/ui"

export type BulkCollectionCommandBarProps = {
  selectedCount: number
  onClear: () => void
  onAction: (action: "add_products" | "remove_products" | "delete") => void
}

export const BulkCollectionCommandBar = ({
  selectedCount,
  onClear,
  onAction,
}: BulkCollectionCommandBarProps) => {
  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {selectedCount} selected
        </CommandBar.Value>
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("add_products")}
          label="Add Products"
          shortcut="a"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("remove_products")}
          label="Remove Products"
          shortcut="r"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("delete")}
          label="Delete"
          shortcut="d"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={onClear}
          label="Clear"
          shortcut="esc"
        />
      </CommandBar.Bar>
    </CommandBar>
  )
}
