import { CommandBar } from "@medusajs/ui"

export type BulkCommandBarProps = {
  selectedCount: number
  onClear: () => void
  onAction: (action: "status" | "pricing" | "category" | "brand" | "delete") => void
}

export const BulkCommandBar = ({
  selectedCount,
  onClear,
  onAction,
}: BulkCommandBarProps) => {
  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {selectedCount} selected
        </CommandBar.Value>
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("status")}
          label="Status"
          shortcut="s"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("pricing")}
          label="Pricing"
          shortcut="p"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("category")}
          label="Category"
          shortcut="c"
        />
        <CommandBar.Seperator />
        <CommandBar.Command
          action={() => onAction("brand")}
          label="Brand"
          shortcut="b"
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
