export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pomoc</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Centrum pomocy systemu zarządzania.
            W celu uzyskania pomocy, skontaktuj się z administratorem systemu.
          </p>
        </div>
      </div>
    </div>
  )
}