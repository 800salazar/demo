import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./ai-action.module.css";
import type { ComponentProps } from "react";

export function AiAction({ children, className = "", ...props }: ComponentProps<typeof Button>) {
  return <Button type="button" {...props} className={`${styles.action} ${className}`}><Sparkles className={styles.icon} aria-hidden />{children}</Button>;
}
