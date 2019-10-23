'use strict';
const chromium = require('chrome-aws-lambda')

module.exports.run = async (event, context) => {

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: false,
    })

    let page = await browser.newPage()

    const url = 'https://empleosti.com.mx/empleos'
    console.log('visiting ' + url)

    await page.goto(url)
    await page.waitFor('#jobs > div > div > div > ul > li')
    const links = await page.$$eval('#jobs > div > div > div > ul > li > a', as => as.map(a => a.href))
    let vacancies = []

    for (let link of links) {
        console.log('visiting ' + link)
        await page.goto(link)

        const vacancy = await page.evaluate(function () {
            let title = document.querySelector("section > h1").textContent
            let enterprise = document.querySelector("#searchable-enterprise").textContent
            let description = document.querySelector("#vacancy-description").textContent
            return {title, enterprise, description}
        })

        console.log(vacancy)

        vacancies.push(Object.assign(vacancy, {link}))
    }

    browser.close()

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Vacancies extracted successfully',
            data: {vacancies},
        }, null, 2),
    };
};