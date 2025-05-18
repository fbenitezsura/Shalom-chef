import React from "react"
import { clx } from "@medusajs/ui"

/**
 * Línea divisora genérica.
 *
 * @param orientation - "horizontal" (por defecto) o "vertical".
 * @param className   - Clases Tailwind extra (ej. color, grosor).
 */
type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={clx(
        "shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-full h-px rotate-90",
        className
      )}
      {...props}
    />
  )
)

Separator.displayName = "Separator"

export default Separator
