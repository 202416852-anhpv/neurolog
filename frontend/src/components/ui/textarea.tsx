import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-xl border border-input bg-muted/50 px-3.5 py-2.5 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/20 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        abc: "min-h-24 resize-y",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Textarea };
