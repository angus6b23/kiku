/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const cache = new Map() // Translation cache, such that the key will be lang:namespace and the value will be the parsed json file

const get = async (string, lang = 'en') => {
    // use i18next convention, such that NAMESPACE:KEY

    let targetFile
    let namespace, key

    // split the string into namespace and key
    const splited = string.split(':')
    if (splited.length > 1) {
        ;[namespace, key] = splited
    } else {
        namespace = 'translation'
        key = splited[0]
    }

    // use the files in public foler in dev mode
    if (process.env.NODE_ENV === 'development') {
        targetFile = path.join(
            __dirname,
            `../public/locales/${lang}/${namespace}.json`
        )
    } else {
        targetFile = path.join(
            __dirname,
            `../dist/locales/${lang}/${namespace}.json`
        )
    }
    try {
        let translations
        if (cache.has(`${lang}:${namespace}`)) {
            translations = cache.get(`${lang}:${namespace}`)
        } else {
            const targetRes = await fs.promises.readFile(targetFile)
            translations = JSON.parse(targetRes)
            cache.set(`${lang}:${namespace}`, translations)
        }
        // Read the json file of corresponding lang and namespace, then parse the json file
        // If the key is found, simply return the value, otherwise return the key value if the lang is en, fallback to en if the lang is not en
        const res = translations[key]
        if (res) {
            return translations[key]
        }
        if (lang !== 'en') {
            return await get(string)
        } else {
            return key
        }
    } catch (e) {
        console.error(e)
        if (lang !== 'en') {
            return await get(string)
        } else {
            return key
        }
    }
}

module.exports = { get }
