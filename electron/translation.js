/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

const get = async (string, lang = 'en') => {
    // use i18next convention, such that NAMESPACE:KEY
    const splited = string.split(':')
    let namespace, key
    if (splited.length > 1) {
        ;[namespace, key] = splited
    } else {
        namespace = 'translation'
        key = splited[0]
    }
    let targetFile = path.join(
        __dirname,
        `../public/locales/${lang}/${namespace}.json`
    )
    try {
        const targetRes = await fs.promises.readFile(targetFile)
        const translations = JSON.parse(targetRes)
        const res = translations[key]
        if (res) {
            return translations[key]
        } else {
            return key
        }
    } catch (e) {
        console.error(e)
        targetFile = path.join(
            __dirname,
            `../public/locales/en/${namespace}.json`
        )
        const targetRes = await fs.promises.readFile(targetFile)
        const translations = JSON.parse(targetRes)
        const res = translations[key]
        if (res) {
            return translations[key]
        } else {
            return key
        }
    }
}

module.exports = { get }
