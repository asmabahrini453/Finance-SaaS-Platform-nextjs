import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

//for dynamic tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
