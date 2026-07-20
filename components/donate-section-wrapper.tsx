import { getSettings } from "@/app/actions/settings"
import { DonateSection } from "@/components/donate-section"

export async function DonateSectionWrapper() {
  const settings = await getSettings()
  const donations = (settings.donations as Record<string, string>) || {}

  if (!donations.bitcoin && !donations.ethereum && !donations.usdt && !donations.monero) {
    return null
  }

  const cryptoOptions = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      address: donations.bitcoin,
      icon: "₿",
      color: "from-orange-500 to-amber-600",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      address: donations.ethereum,
      icon: "Ξ",
      color: "from-blue-500 to-purple-600",
    },
    {
      name: "USDT",
      symbol: "USDT",
      address: donations.usdt,
      icon: "⊞",
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Monero",
      symbol: "XMR",
      address: donations.monero,
      icon: "ⓧ",
      color: "from-orange-600 to-red-600",
    },
  ].filter((option) => option.address)

  return <DonateSection cryptoOptions={cryptoOptions} />
}
