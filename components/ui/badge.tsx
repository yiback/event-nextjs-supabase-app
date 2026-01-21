import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        new: "border-transparent bg-blue-500 text-white",
        // Deadline variants
        deadline: "border-transparent bg-gray-500 text-white",
        deadlineSoon: "border-transparent bg-amber-500 text-white",
        deadlineToday: "border-transparent bg-red-500 text-white",
        deadlineClosed: "border-transparent bg-gray-300 text-gray-600",
        // Attendance variants
        attending: "border-transparent bg-emerald-100 text-emerald-700",
        notAttending: "border-transparent bg-red-100 text-red-700",
        maybe: "border-transparent bg-amber-100 text-amber-700",
        // Role variants (모임 멤버 역할)
        owner: "border-transparent bg-purple-100 text-purple-700",
        admin: "border-transparent bg-blue-100 text-blue-700",
        member: "border-transparent bg-gray-100 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
