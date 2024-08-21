import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button/buttonVariants'

export { default as Button } from './Button.vue'

export type ButtonVariants = VariantProps<typeof buttonVariants>
