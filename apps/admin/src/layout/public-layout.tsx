export function PublicLayout({ children }: { children: React.ReactNode }) {
    return <div className="relative z-10 flex min-h-svh items-center justify-center p-6 md:p-10">
        {children}
    </div>
}
