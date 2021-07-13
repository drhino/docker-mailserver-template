import * as translations from './translate/_translations.js'

let localization = 'en-US'

/**
 * Returns a translation by id and falls back to english.
 *
 * @param {string} id *required* Unique key of the translation.
 *
 * @returns {string} rs Localized or default translation value.
 */
export const translate = id => {

  if ( !id )
      throw new ReferenceError("Undefined 'id' in: translate().") 

  if ( typeof id !== 'string' )
      throw new TypeError("Invalid 'id' — Must be a string in: translate().")

  const rs = translations[localization][id] || translations['en-US'][id]

  if ( !rs )
      throw new ReferenceError(
       "Invalid 'id' — Not found: '" + id + "' in: translate()."
      )

  return rs
}

/**
 * Changes the language in which the translations are returned.
 *
 * @param {string} locale *optional* Sets new localization.
 *
 * @returns {string|object} Returns either all translations for the new locale
 *               OR returns the current localization when locale is undefined.
 */
export const language = locale => {

  if ( ! locale )
      return localization

  if ( typeof locale !== 'string' )
      throw new TypeError("Invalid 'locale' — Must be a string in: language().")

  if ( ! translations[locale] )
      throw new ReferenceError(
       "Invalid 'locale' — Not found: '" + locale + "' in: language()."
      )

  localization = locale

  return translations[localization]
}
