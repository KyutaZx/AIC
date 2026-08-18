import * as React from"react"
import { Slot } from"@radix-ui/react-slot"
import { cva, type VariantProps } from"class-variance-authority"

import { cn } from"@/lib/utils"

const buttonVariants = cva(
"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
 {
 variants: {
 variant: {
 default:"bg-[#0000FF] text-white hover:bg-[#0000CC]",
 destructive:
"bg-red-500 text-white hover:bg-red-600",
 outline:
"border border-[#E0E6FF] bg-white hover:bg-[#F5F7FF] hover:text-[#0A0A1A]",
 secondary:
"bg-[#F5F7FF] text-[#0A0A1A] hover:bg-[#E0E6FF]",
 ghost:"hover:bg-[#F5F7FF] hover:text-[#0A0A1A]",
 link:"text-[#0000FF] underline-offset-4 hover:underline",
 },
 size: {
 default:"h-10 px-4 py-2",
 sm:"h-9 rounded-md px-3",
 lg:"h-11 rounded-md px-8",
 icon:"h-10 w-10",
 },
 },
 defaultVariants: {
 variant:"default",
 size:"default",
 },
 },
)

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot :"button"
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 )
 },
)
Button.displayName ="Button"

export { Button, buttonVariants }
