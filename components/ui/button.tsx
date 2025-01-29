import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClassNameValue } from "tailwind-merge";
import { useSettings } from "@/lib/store";
import { ibmPlexSansArabic, ibmPlexSansHebrew } from "@/lib/fonts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm enabled:hover:bg-primary/90",
        outlined:
          "border border-input bg-neutral-50 dark:bg-neutral-800/70 enabled:hover:bg-white enabled:active:bg-neutral-100 enabled:dark:hover:bg-neutral-700/40 enabled:dark:active:bg-neutral-700/50 enabled:hover:text-accent-foreground shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-xs enabled:hover:bg-accent enabled:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:border-input enabled:hover:bg-neutral-200 enabled:active:bg-neutral-300 enabled:dark:hover:bg-neutral-700/30 enabled:dark:active:bg-neutral-700/40 enabled:hover:text-accent-foreground shadow-xs",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface RawButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export interface ButtonProps extends RawButtonProps {
  tooltip?: React.ReactNode;
  triggerclassname?: ClassNameValue;
  tooltipproviderprops?: Omit<
    React.ComponentProps<typeof TooltipProvider>,
    "children"
  >;
}

const RawButton = React.forwardRef<HTMLButtonElement, RawButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
RawButton.displayName = "RawButton";

const Button = (props: ButtonProps) => {
  return (
    <TooltipProvider {...props.tooltipproviderprops}>
      <Tooltip>
        <TooltipTrigger className={cn(props.triggerclassname)} asChild>
          <RawButton {...props} />
        </TooltipTrigger>
        {props.tooltip ? (
          <TooltipContent
            className={
              useSettings.getState().language == "ar"
                ? ibmPlexSansArabic.className
                : ibmPlexSansHebrew.className
            }
          >
            {props.tooltip}
          </TooltipContent>
        ) : (
          <></>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export { Button, RawButton, buttonVariants };
