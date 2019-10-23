const scraper = require('./handler')
scraper.run().then((data) => {
    console.log(data)
})