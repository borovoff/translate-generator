const fs = require('fs')

function get(obj, path, defaultValue?) {
    const keys = path.split('.')

    let result = obj
    for (let key of keys) {
        result = result[key]

        if (result === undefined) {
            return defaultValue
        }
    }

    return result ?? defaultValue
}

const replace = (template: string, ctx: any, fileName: string) => {
    const TEMPLATE_REGEXP = /{{(.*?)}}/gi

    let key = null
    while ((key = TEMPLATE_REGEXP.exec(template))) {
        if (key[1]) {
            const tmplValue = key[1].trim()
            const data = get(ctx, fileName + '.' + tmplValue)
            template = template.replace(new RegExp(key[0], 'gi'), data)
        }
    }

    return template
}

const source = process.argv[2]
const files = fs.readdirSync(source)

const langDir = source + '/i18n'
const languages = fs.readdirSync(langDir)


for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (file.slice(-5) !== '.html') {
        continue
    }

    const path = source + '/' + file
    const template = fs.readFileSync(path, 'utf8')

    for (let j = 0; j < languages.length; j++) {
        const lang = languages[j]
        const json = fs.readFileSync(langDir + '/' + lang, 'utf8')
        const ctx = JSON.parse(json)


        const result = replace(template, ctx, file.slice(0, -5))

        const langPath = `${source}/dist/${lang.slice(0, -5)}`
        if (!fs.existsSync(langPath)) {
            fs.mkdirSync(langPath)
        }

        fs.writeFileSync(`${langPath}/${file}`, result, 'utf8')
    }
}

