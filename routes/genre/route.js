const express = require('express');
const router = express.Router();
const { getBrowser } = require('../../utils/browser');

router.use('/list', async function (req, res) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto('https://komiku.org',{
        waitUntil: "domcontentloaded",
    });

    const datas = await page.evaluate(()=>{
        const genreUlElement = document.querySelector('ul.genre');
        const genreListElement = genreUlElement.querySelectorAll('li');
        const genre = Array.from(genreListElement).map(item=>{
            const genreTitleElement = item.querySelector('a');
            const genreTitle = genreTitleElement ? genreTitleElement.title.replaceAll('Komik ', '') : null;
            const genreLink = genreTitleElement ? genreTitleElement.href : null;
            const genreSlug = genreTitleElement ? genreTitleElement.href.slice(25, -1) : null;
            return {
                slug: genreSlug,
                title: genreTitle,
                link: genreLink
            };
        })
        return genre
    });
    res.status(200).json({
        "data":datas
    })
})

router.use('/:slug', async function (req,res) {
    const param = req.params.slug;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(`https://komiku.org/genre/${param}`,{
        waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('div.bge');
    const datas = await page.evaluate(()=>{
        const divElement = document.querySelectorAll('div.bge');
        
        const divDatas = Array.from(divElement).map(item=>{
            const imgElement = item.querySelector('div.bgei a img')
            const img = imgElement ? imgElement.src : null;
            const linkElement = item.querySelector('div.kan a');
            const link = linkElement ? linkElement.href : null;
            const titleElement = linkElement.querySelector('h3');
            const title = titleElement.innerText;
            const slug = link.slice(25).replaceAll("/","")
            return{
                slug: slug,
                title: title,
                img_url: img,
                link: link,
            }
        })

        return divDatas
    })

    res.status(200).json({
        "message": `${param} genre`,
        "data":datas    
    })  
})

module.exports= router;