import type { VCardContact } from './types'

export function generateVCard(contact: VCardContact): string {
  let vcard = 'BEGIN:VCARD\n'
  vcard += 'VERSION:3.0\n'

  // Primary name in default language
  vcard += `FN:${contact.firstName} ${contact.lastName}\n`

  // Formatted name
  vcard += `N:${contact.lastName};${contact.firstName};;;\n`

  // Organization and title
  if (contact.organization) {
    vcard += `ORG:${contact.organization}\n`
  }

  if (contact.title) {
    vcard += `TITLE:${contact.title}\n`
  }

  // Phones
  contact.phones.forEach((phone, index) => {
    const type = phone.type || 'CELL'
    const primary = phone.isPrimary ? ';PREF' : ''
    vcard += `TEL${type}${primary}:${phone.number}\n`
  })

  // Emails
  contact.emails.forEach((email, index) => {
    const type = email.type || 'INTERNET'
    const primary = email.isPrimary ? ';PREF' : ''
    vcard += `EMAIL${type}${primary}:${email.address}\n`
  })

  // URLs
  contact.urls.forEach((url, index) => {
    const type = url.type || 'WORK'
    vcard += `URL${type}:${url.url}\n`
  })

  // Addresses
  contact.addresses.forEach((address, index) => {
    const type = address.type || 'WORK'
    const addrParts = [
      address.street || '',
      address.city || '',
      address.region || '',
      address.postalCode || '',
      address.country || ''
    ].filter(part => part.trim())

    if (addrParts.length > 0) {
      const addrLine = addrParts.join(';')
      vcard += `ADR${type};;${addrLine}\n`
    }
  })

  // Notes
  if (contact.notes) {
    vcard += `NOTE:${contact.notes}\n`
  }

  // Multi-language alternative names
  if (contact.alternativeNames) {
    contact.alternativeNames.forEach((altName) => {
      vcard += `LANG:${altName.language}\n`
      vcard += `FN:${altName.firstName} ${altName.lastName}\n`
      vcard += `N:${altName.lastName};${altName.firstName};;;\n`
    })
  }

  // Multi-language localized titles
  if (contact.localizedTitles) {
    contact.localizedTitles.forEach((localizedTitle) => {
      vcard += `LANG:${localizedTitle.language}\n`
      vcard += `TITLE:${localizedTitle.title}\n`
    })
  }

  vcard += 'END:VCARD'
  return vcard
}

export function generateVCardQr(contact: VCardContact, qrStyle?: any): Promise<string> {
  const vcardText = generateVCard(contact)

  // In a real implementation, you would use a QR code library
  // For now, return the vcard text that would be encoded
  return Promise.resolve(vcardText)
}

export function parseVCard(vcardText: string): VCardContact {
  const lines = vcardText.split('\n')
  const contact: VCardContact = {
    firstName: '',
    lastName: '',
    phones: [],
    emails: [],
    urls: [],
    addresses: []
  }

  let currentLanguage = ''

  lines.forEach(line => {
    const [key, ...values] = line.split(':')
    const value = values.join(':')

    if (key === 'FN') {
      const nameParts = value.split(' ')
      contact.firstName = nameParts[0] || ''
      contact.lastName = nameParts.slice(1).join(' ') || ''
    }

    if (key === 'N') {
      const nameParts = value.split(';')
      contact.lastName = nameParts[0] || ''
      contact.firstName = nameParts[1] || ''
    }

    if (key.startsWith('TEL')) {
      const type = key.replace('TEL', '').replace('PREF', '') || 'CELL'
      contact.phones.push({
        type: type.toLowerCase() as any,
        number: value,
        isPrimary: key.includes('PREF')
      })
    }

    if (key.startsWith('EMAIL')) {
      const type = key.replace('EMAIL', '').replace('PREF', '') || 'INTERNET'
      contact.emails.push({
        type: type.toLowerCase() as any,
        address: value,
        isPrimary: key.includes('PREF')
      })
    }

    if (key.startsWith('URL')) {
      const type = key.replace('URL', '') || 'WORK'
      contact.urls.push({
        type: type.toLowerCase() as any,
        url: value
      })
    }

    if (key.startsWith('ADR')) {
      const addrParts = value.split(';')
      contact.addresses.push({
        type: key.replace('ADR', '').toLowerCase() as any,
        street: addrParts[2] || '',
        city: addrParts[3] || '',
        region: addrParts[4] || '',
        postalCode: addrParts[5] || '',
        country: addrParts[6] || ''
      })
    }

    if (key === 'TITLE') {
      contact.title = value
    }

    if (key === 'ORG') {
      contact.organization = value
    }

    if (key === 'NOTE') {
      contact.notes = value
    }

    if (key === 'LANG') {
      currentLanguage = value
    }

    if (key === 'FN' && currentLanguage) {
      const nameParts = value.split(' ')
      const altName = contact.alternativeNames?.find(n => n.language === currentLanguage)
      if (altName) {
        altName.firstName = nameParts[0] || ''
        altName.lastName = nameParts.slice(1).join(' ') || ''
      } else {
        contact.alternativeNames = contact.alternativeNames || []
        contact.alternativeNames.push({
          language: currentLanguage,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        })
      }
    }

    if (key === 'TITLE' && currentLanguage) {
      const localizedTitle = contact.localizedTitles?.find(t => t.language === currentLanguage)
      if (localizedTitle) {
        localizedTitle.title = value
      } else {
        contact.localizedTitles = contact.localizedTitles || []
        contact.localizedTitles.push({
          language: currentLanguage,
          title: value
        })
      }
    }
  })

  return contact
}