import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27a75c] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#27a75c] to-[#00477a] text-white hover:from-[#229a52] hover:to-[#003d6a] shadow-lg shadow-[#27a75c]/20",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-[#27a75c]/30 bg-transparent text-gray-300 hover:bg-[#27a75c]/10 hover:text-white hover:border-[#27a75c]/50",
        secondary:
          "bg-[#00477a]/20 text-white hover:bg-[#00477a]/30",
        ghost: "text-[#27a75c]/70 hover:bg-[#27a75c]/10 hover:text-[#27a75c]",
        link: "text-[#27a75c] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
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







