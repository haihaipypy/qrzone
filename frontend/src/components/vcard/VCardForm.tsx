'use client'

import { useState } from 'react'

interface VCardContact {
  firstName: string
  lastName: string
  organization?: string
  title?: string
  phones: Array<{
    type?: 'home' | 'work' | 'mobile' | 'fax'
    number: string
    isPrimary?: boolean
  }>
  emails: Array<{
    type?: 'home' | 'work' | 'other'
    address: string
    isPrimary?: boolean
  }>
  urls: Array<{
    type?: 'home' | 'work' | 'blog' | 'other'
    url: string
  }>
  addresses: Array<{
    type?: 'home' | 'work'
    street?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }>
  notes?: string
  alternativeNames?: Array<{
    language: string
    firstName: string
    lastName: string
  }>
  localizedTitles?: Array<{
    language: string
    title: string
  }>
}

interface VCardFormProps {
  onSave: (contact: VCardContact) => void
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
]

export function VCardForm({ onSave }: VCardFormProps) {
  const [contact, setContact] = useState<VCardContact>({
    firstName: '',
    lastName: '',
    phones: [{ type: 'mobile', number: '', isPrimary: true }],
    emails: [{ type: 'work', address: '', isPrimary: true }],
    urls: [],
    addresses: [],
    alternativeNames: [],
    localizedTitles: []
  })

  const [currentLanguage, setCurrentLanguage] = useState('en')

  const addPhone = () => {
    setContact(prev => ({
      ...prev,
      phones: [...prev.phones, { type: 'mobile', number: '' }]
    }))
  }

  const addEmail = () => {
    setContact(prev => ({
      ...prev,
      emails: [...prev.emails, { type: 'other', address: '' }]
    }))
  }

  const addUrl = () => {
    setContact(prev => ({
      ...prev,
      urls: [...prev.urls, { type: 'other', url: '' }]
    }))
  }

  const addAddress = () => {
    setContact(prev => ({
      ...prev,
      addresses: [...prev.addresses, { type: 'work' }]
    }))
  }

  const addAlternativeName = () => {
    setContact(prev => ({
      ...prev,
      alternativeNames: [...prev.alternativeNames || [], { language: currentLanguage, firstName: '', lastName: '' }]
    }))
  }

  const addLocalizedTitle = () => {
    setContact(prev => ({
      ...prev,
      localizedTitles: [...prev.localizedTitles || [], { language: currentLanguage, title: '' }]
    }))
  }

  const handleSave = () => {
    onSave(contact)
  }

  return (
    <div className="bg-white rounded-lg border p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Multi-Language VCard</h2>

      {/* Primary Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Primary Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={contact.firstName}
              onChange={(e) => setContact(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={contact.lastName}
              onChange={(e) => setContact(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input
              type="text"
              value={contact.organization || ''}
              onChange={(e) => setContact(prev => ({ ...prev, organization: e.target.value }))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={contact.title || ''}
              onChange={(e) => setContact(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Multi-language Support */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Multi-Language Support</h3>
        <div className="flex gap-3 mb-4">
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={addAlternativeName}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Alternative Name
          </button>
          <button
            onClick={addLocalizedTitle}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Localized Title
          </button>
        </div>

        {/* Alternative Names */}
        {contact.alternativeNames?.map((altName, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{languages.find(l => l.code === altName.language)?.name}</span>
              <span className="text-sm text-gray-500">{altName.firstName} {altName.lastName}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={altName.firstName}
                onChange={(e) => {
                  const newNames = [...contact.alternativeNames!]
                  newNames[index] = { ...altName, firstName: e.target.value }
                  setContact(prev => ({ ...prev, alternativeNames: newNames }))
                }}
                placeholder="First name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={altName.lastName}
                onChange={(e) => {
                  const newNames = [...contact.alternativeNames!]
                  newNames[index] = { ...altName, lastName: e.target.value }
                  setContact(prev => ({ ...prev, alternativeNames: newNames }))
                }}
                placeholder="Last name"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}

        {/* Localized Titles */}
        {contact.localizedTitles?.map((title, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{languages.find(l => l.code === title.language)?.name}</span>
              <span className="text-sm text-gray-500">{title.title}</span>
            </div>
            <input
              type="text"
              value={title.title}
              onChange={(e) => {
                const newTitles = [...contact.localizedTitles!]
                newTitles[index] = { ...title, title: e.target.value }
                setContact(prev => ({ ...prev, localizedTitles: newTitles }))
              }}
              placeholder="Title"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Phones */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Phone Numbers</h3>
          <button
            onClick={addPhone}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Add Phone
          </button>
        </div>
        {contact.phones.map((phone, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-3 mb-3">
            <select
              value={phone.type}
              onChange={(e) => {
                const newPhones = [...contact.phones]
                newPhones[index] = { ...phone, type: e.target.value as any }
                setContact(prev => ({ ...prev, phones: newPhones }))
              }}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mobile">Mobile</option>
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="fax">Fax</option>
            </select>
            <input
              type="tel"
              value={phone.number}
              onChange={(e) => {
                const newPhones = [...contact.phones]
                newPhones[index] = { ...phone, number: e.target.value }
                setContact(prev => ({ ...prev, phones: newPhones }))
              }}
              placeholder="Phone number"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phone.isPrimary && (
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm">Primary</span>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Generate VCard QR Code
      </button>
    </div>
  )
}