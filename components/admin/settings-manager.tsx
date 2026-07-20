"use client"

import { useState, useTransition } from "react"
import { Save, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateMultipleSettings } from "@/app/actions/settings"

interface SettingsManagerProps {
  initialSettings: Record<string, unknown>
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const general = (initialSettings.general as Record<string, string>) || {}
  const features = (initialSettings.features as Record<string, boolean>) || {}
  const contact = (initialSettings.contact as Record<string, string>) || {}
  const donations = (initialSettings.donations as Record<string, string>) || {}

  const [siteName, setSiteName] = useState(general.site_name || "WealthPath")
  const [tagline, setTagline] = useState(general.tagline || "Your Guide to Building Passive Wealth")
  const [description, setDescription] = useState(general.description || "")

  const [showQuiz, setShowQuiz] = useState(features.show_quiz ?? true)
  const [showCalculator, setShowCalculator] = useState(features.show_calculator ?? true)
  const [showStories, setShowStories] = useState(features.show_stories ?? true)
  const [showResources, setShowResources] = useState(features.show_resources ?? true)

  const [supportEmail, setSupportEmail] = useState(contact.support_email || "")
  const [twitterUrl, setTwitterUrl] = useState(contact.twitter || "")
  const [linkedinUrl, setLinkedinUrl] = useState(contact.linkedin || "")

  const [bitcoinAddress, setBitcoinAddress] = useState(donations.bitcoin || "")
  const [ethereumAddress, setEthereumAddress] = useState(donations.ethereum || "")
  const [usdtAddress, setUsdtAddress] = useState(donations.usdt || "")
  const [moneroAddress, setMoneroAddress] = useState(donations.monero || "")

  const [pendingGeneral, startGeneralTransition] = useTransition()
  const [pendingFeatures, startFeaturesTransition] = useTransition()
  const [pendingContact, startContactTransition] = useTransition()
  const [pendingDonations, startDonationsTransition] = useTransition()

  const [savedGeneral, setSavedGeneral] = useState(false)
  const [savedFeatures, setSavedFeatures] = useState(false)
  const [savedContact, setSavedContact] = useState(false)
  const [savedDonations, setSavedDonations] = useState(false)

  function saveGeneral() {
    startGeneralTransition(async () => {
      await updateMultipleSettings([
        {
          key: "general",
          value: { site_name: siteName, tagline, description },
        },
      ])
      setSavedGeneral(true)
      setTimeout(() => setSavedGeneral(false), 2000)
    })
  }

  function saveFeatures() {
    startFeaturesTransition(async () => {
      await updateMultipleSettings([
        {
          key: "features",
          value: {
            show_quiz: showQuiz,
            show_calculator: showCalculator,
            show_stories: showStories,
            show_resources: showResources,
          },
        },
      ])
      setSavedFeatures(true)
      setTimeout(() => setSavedFeatures(false), 2000)
    })
  }

  function saveContact() {
    startContactTransition(async () => {
      await updateMultipleSettings([
        {
          key: "contact",
          value: { support_email: supportEmail, twitter: twitterUrl, linkedin: linkedinUrl },
        },
      ])
      setSavedContact(true)
      setTimeout(() => setSavedContact(false), 2000)
    })
  }

  function saveDonations() {
    startDonationsTransition(async () => {
      await updateMultipleSettings([
        {
          key: "donations",
          value: { bitcoin: bitcoinAddress, ethereum: ethereumAddress, usdt: usdtAddress, monero: moneroAddress },
        },
      ])
      setSavedDonations(true)
      setTimeout(() => setSavedDonations(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Basic site information and branding</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the site..." />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveGeneral} disabled={pendingGeneral} size="sm" className="gap-1.5">
            {pendingGeneral ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedGeneral ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savedGeneral ? "Saved" : "Save General"}
          </Button>
        </CardFooter>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Toggles</CardTitle>
          <CardDescription>Turn website sections on or off</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[
            { id: "showQuiz", label: "Income Quiz", value: showQuiz, setter: setShowQuiz },
            { id: "showCalc", label: "Compound Calculator", value: showCalculator, setter: setShowCalculator },
            { id: "showStories", label: "Success Stories", value: showStories, setter: setShowStories },
            { id: "showResources", label: "Resources Section", value: showResources, setter: setShowResources },
          ].map((toggle) => (
            <div key={toggle.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
              <Label htmlFor={toggle.id} className="cursor-pointer font-medium">
                {toggle.label}
              </Label>
              <Switch id={toggle.id} checked={toggle.value} onCheckedChange={toggle.setter} />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={saveFeatures} disabled={pendingFeatures} size="sm" className="gap-1.5">
            {pendingFeatures ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedFeatures ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savedFeatures ? "Saved" : "Save Features"}
          </Button>
        </CardFooter>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
          <CardDescription>Support and social media links</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input id="supportEmail" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@wealthpath.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="twitter">Twitter / X URL</Label>
            <Input id="twitter" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/wealthpath" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/wealthpath" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveContact} disabled={pendingContact} size="sm" className="gap-1.5">
            {pendingContact ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedContact ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savedContact ? "Saved" : "Save Contact"}
          </Button>
        </CardFooter>
      </Card>

      {/* Cryptocurrency Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cryptocurrency Donations</CardTitle>
          <CardDescription>Add wallet addresses for cryptocurrency donations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bitcoin">Bitcoin (BTC) Address</Label>
            <Input id="bitcoin" value={bitcoinAddress} onChange={(e) => setBitcoinAddress(e.target.value)} placeholder="1A1z7agoat7qxSpZxyjzYkYVfB5z4WSQmF" />
            <p className="text-xs text-muted-foreground">Public Bitcoin address for donations</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ethereum">Ethereum (ETH) Address</Label>
            <Input id="ethereum" value={ethereumAddress} onChange={(e) => setEthereumAddress(e.target.value)} placeholder="0x742d35Cc6634C0532925a3b844Bc7e7595f42aE" />
            <p className="text-xs text-muted-foreground">Public Ethereum address (also works for ERC-20 tokens)</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="usdt">USDT Address (Tron/Polygon)</Label>
            <Input id="usdt" value={usdtAddress} onChange={(e) => setUsdtAddress(e.target.value)} placeholder="Enter USDT wallet address" />
            <p className="text-xs text-muted-foreground">USDT wallet address (can be Tron TRC-20 or Polygon)</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monero">Monero (XMR) Address</Label>
            <Input id="monero" value={moneroAddress} onChange={(e) => setMoneroAddress(e.target.value)} placeholder="Enter Monero address" />
            <p className="text-xs text-muted-foreground">Public Monero address for privacy-focused donations</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveDonations} disabled={pendingDonations} size="sm" className="gap-1.5">
            {pendingDonations ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedDonations ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savedDonations ? "Saved" : "Save Donations"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
