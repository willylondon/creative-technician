import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#72e8ef] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#eaf0eb] text-[#050807] font-semibold hover:bg-[#72e8ef] hover:text-[#050807] shadow-sm active:scale-[0.98]",
        primary:
          "bg-[#72e8ef] text-[#050807] font-semibold hover:bg-[#50c8cd] shadow-sm active:scale-[0.98]",
        destructive:
          "bg-[#7e1b1b] text-[#eaf0eb] hover:bg-[#992222] shadow-sm active:scale-[0.98]",
        outline:
          "border border-[rgba(234,240,235,0.18)] bg-[#0e1513] text-[#eaf0eb] hover:bg-[#121b18] hover:border-[rgba(234,240,235,0.36)] hover:text-[#72e8ef] shadow-sm active:scale-[0.98]",
        secondary:
          "bg-[#121b18] text-[#eaf0eb] border border-[rgba(234,240,235,0.1)] hover:bg-[#182420] active:scale-[0.98]",
        ghost:
          "text-[#a8b4ad] hover:text-[#eaf0eb] hover:bg-[rgba(234,240,235,0.06)]",
        link:
          "text-[#72e8ef] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
