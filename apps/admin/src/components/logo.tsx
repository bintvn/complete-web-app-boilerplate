import { BedDouble } from 'lucide-react'

export function Logo({ size = 24, className }: { size?: number; className?: string }) {
    return <BedDouble aria-hidden="true" className={className} size={size} />
}
