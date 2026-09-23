import { Button, IconButton, Input, Label, Text, toast, clx } from "@medusajs/ui"
import { ArrowUpTray, Photo, Trash, XMarkMini, Spinner } from "@medusajs/icons"
import { useState, useRef } from "react"

export type MediaUploadFieldProps = {
  value: string
  onChange: (url: string) => void
  label?: string
  description?: string
  placeholder?: string
  aspectRatio?: "square" | "banner" | "any"
  className?: string
}

export const MediaUploadField = ({
  value,
  onChange,
  label,
  description,
  placeholder = "https://example.com/image.jpg",
  aspectRatio = "any",
  className,
}: MediaUploadFieldProps) => {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Please upload a valid image file (PNG, JPG, SVG, WebP, AVIF)",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)

      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload image")
      }

      const data = await res.json()
      const uploadedUrl = data.files?.[0]?.url

      if (!uploadedUrl) {
        throw new Error("No URL returned from upload server")
      }

      onChange(uploadedUrl)
      toast.success("Uploaded", {
        description: "Image uploaded successfully",
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image"
      toast.error("Upload Failed", {
        description: `${msg}. You can also enter an image URL directly.`,
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemove = () => {
    onChange("")
  }

  const isSquare = aspectRatio === "square"
  const isBanner = aspectRatio === "banner"

  return (
    <div className={clx("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <Label size="small">
              {label}
            </Label>
          )}
          {description && (
            <Text size="xsmall" className="text-ui-fg-subtle">
              {description}
            </Text>
          )}
        </div>

        <div className="flex items-center gap-1 bg-ui-bg-subtle p-0.5 rounded-lg border border-ui-border-base">
          <Button
            type="button"
            variant={mode === "upload" ? "secondary" : "transparent"}
            size="small"
            onClick={() => setMode("upload")}
            className="text-xs"
          >
            Upload File
          </Button>
          <Button
            type="button"
            variant={mode === "url" ? "secondary" : "transparent"}
            size="small"
            onClick={() => setMode("url")}
            className="text-xs"
          >
            Image URL
          </Button>
        </div>
      </div>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={clx(
              "border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2",
              uploading
                ? "bg-ui-bg-subtle border-ui-border-base opacity-60 cursor-not-allowed"
                : "border-ui-border-base hover:border-ui-border-interactive hover:bg-ui-bg-subtle bg-ui-bg-base"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-ui-bg-subtle flex items-center justify-center text-ui-fg-subtle border border-ui-border-base">
              {uploading ? (
                <Spinner className="w-4 h-4 text-ui-fg-interactive" />
              ) : (
                <ArrowUpTray className="w-4 h-4" />
              )}
            </div>
            <div className="text-center">
              <Text size="small" className="font-medium text-ui-fg-base">
                {uploading ? "Uploading..." : "Click or drag image to upload"}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                PNG, JPG, SVG, WebP up to 10MB
              </Text>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs"
          />
          {value && (
            <IconButton
              type="button"
              variant="secondary"
              size="small"
              onClick={handleRemove}
              className="shrink-0"
            >
              <XMarkMini className="w-4 h-4" />
            </IconButton>
          )}
        </div>
      )}

      {/* Media Preview Card */}
      {value && (
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={clx(
                "rounded border border-ui-border-base bg-white overflow-hidden shrink-0 flex items-center justify-center p-0.5",
                isSquare ? "w-10 h-10" : isBanner ? "w-20 h-10" : "w-12 h-10"
              )}
            >
              <img
                src={value}
                alt="Media preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
            </div>
            <div className="overflow-hidden">
              <Text size="xsmall" className="font-medium text-ui-fg-base truncate block max-w-xs">
                {value}
              </Text>
              <Text size="2xsmall" className="text-ui-fg-muted">
                Active media source
              </Text>
            </div>
          </div>

          <IconButton
            type="button"
            variant="transparent"
            size="small"
            onClick={handleRemove}
            className="text-ui-fg-muted hover:text-ui-fg-danger shrink-0"
          >
            <Trash className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      )}
    </div>
  )
}

export default MediaUploadField

