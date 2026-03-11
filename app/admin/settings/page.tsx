import { getSettings } from "@/app/actions/settings"
import { SettingsManager } from "@/components/admin/settings-manager"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Site Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure global settings for the WealthPath platform
        </p>
      </div>
      <SettingsManager initialSettings={settings} />
    </div>
  )
}
