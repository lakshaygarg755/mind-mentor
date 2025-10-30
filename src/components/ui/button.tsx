import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-teal-900)] text-white hover:bg-[var(--color-teal-800)] border-2 border-b-4 border-r-4 border-[var(--color-navy-900)] rounded-lg hover:translate-y-[2px] hover:translate-x-[-2px] hover:border-b-2 hover:border-r-2 transition-all duration-100 shadow-sm hover:shadow active:translate-y-[2px] active:translate-x-[-2px] active:border-b-2 active:border-r-2",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-b-4 border-r-4 border-[var(--color-navy-900)] shadow-sm hover:bg-destructive/90 hover:border-b-2 hover:border-r-2",
        outline:
          "border-2 border-b-4 border-r-4 border-[var(--color-navy-900)] bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-b-2 hover:border-r-2",
        secondary:
          "bg-[var(--color-lavender-700)] text-[var(--color-teal-900)] border-2 border-b-4 border-r-4 border-[var(--color-navy-900)] hover:bg-[var(--color-lavender-500)]",
        ghost: "border-2 border-transparent hover:bg-accent hover:text-accent-foreground hover:border-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-1.5",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
