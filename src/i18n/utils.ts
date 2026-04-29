import { ui, defaultLang, languages, type Lang, type TranslationKey } from './ui'

const langPrefixPattern = new RegExp(`^(${Object.keys(languages).join('|')})/`)

export function stripLangPrefix(slug: string): string {
  return slug.replace(langPrefixPattern, '')
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/')
  if (lang in ui) return lang as Lang
  return defaultLang
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return ui[lang][key] || ui[defaultLang][key]
  }
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname
  const parts = pathname.split('/')
  const lang = parts[1]

  if (lang in ui) {
    return '/' + parts.slice(2).join('/')
  }
  return pathname
}
