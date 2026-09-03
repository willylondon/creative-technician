import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-[rgba(234,240,235,0.18)] bg-[#0a0f0e] px-3.5 py-2 text-sm text-[#eaf0eb] shadow-inner transition-all duration-150 placeholder:text-[#74807a] focus-visible:border-[#72e8ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#72e8ef]/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
