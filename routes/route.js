const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const { getBrowser } = require('../utils/browser');

router.use('/terbaru', async function (req, res) {

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto('https://komiku.org/pustaka/',{
        waitUntil: "domcontentloaded",
    });

    const html = await page.content();
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
                slug:slug,
                title: title,
                img_url: img,
                link: link,
            }
        })

        return divDatas
    })

    res.status(200).json({
        "data":datas    
    })
})

router.use('/populer', async function (req,res) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto('https://komiku.org',{
        waitUntil: "domcontentloaded",
    });

    const datas = await page.evaluate(()=>{

        const section = document.querySelector('section#Komik_Hot_Manga')
        const divElement = section.querySelectorAll('div.perapih div.ls112 div.ls12 article.ls2')

        const divDatas = Array.from(divElement).map(item=>{
            const title = item.querySelector('div.ls2j h3 a').innerText;
            const img = item.querySelector('div.ls2v a img').src
            const linkElement = item.querySelector('div.ls2v a');
            const link = linkElement ? linkElement.href : null;
            const slug = link.slice(25).replaceAll("/","");

            return{
                slug: slug,
                title: title,
                img_url: img,
                link: link,
            }
        });

        return divDatas
    })

    res.status(200).json({
        data:datas
    })
})

router.use('/list', async function (req, res) {
    try{
        const browser = await puppeteer.launch();
            const page = await browser.newPage();
        await page.goto('https://komiku.org/daftar-komik/',{
            waitUntil: "domcontentloaded",
        });

        const html = await page.content();
        await page.waitForSelector('div.ls4');
        const datas = await page.evaluate(()=>{
        const divElement = document.querySelectorAll('div.ls4');
        
        const divDatas = Array.from(divElement).map(item=>{
            const imgElement = item.querySelector('div.ls4v a img');
            const img = imgElement? imgElement.src : null;
            const textElement = item.querySelector('div.ls4j');

            const titleElement = textElement.querySelector('h4 a');
            const title = titleElement.innerText;

            const descElement = textElement.querySelectorAll('span.ls4s');

            const link = titleElement?titleElement.href : null;
            const slug = link.slice(25).replaceAll("/","")
            
            const desc = Array.from(descElement).map(item=>{
                const descText = item? item.innerText : null;

                return descText
            })

            return{
                slug: slug,
                title: title,
                    img_url: img,
                    desc: desc,
                    link: link
                }
            })

            return divDatas
        })

        res.status(200).json({
            "data":datas    
        })
    }catch{
        res.status(200).json({
            "error":"error"
        })
    }
})

router.use('/search', async function (req,res) {
    const q = req.query.q;
    const hasil = q.replaceAll(" ", "+")

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(`https://komiku.org/?post_type=manga&s=${q}`,{
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
        "message": `results for "${q}"`,
        "data":datas    
    })  
})

router.use('/detail/:slug',async function (req,res) {
    const param =  req.params.slug;
    
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(`https://komiku.org/manga/${param}`,{
        waitUntil: "domcontentloaded",
    });

    const html = await page.content();
    
    const datas = await page.evaluate(()=>{
        const infoElement = document.querySelector('section#Informasi');
        const tableElement = infoElement.querySelector('table.inftable');
        const trElement = tableElement.querySelectorAll('tbody tr');

        const imgElement = infoElement.querySelector('div.ims img');
        const img = imgElement?imgElement.src : null;
        
        const synopsisElement = document.querySelector('p.desc');
        const synopsis = synopsisElement ? synopsisElement.innerText : null;

        const chTableElement = document.querySelector('table#Daftar_Chapter')
        const chTrElement = chTableElement.querySelectorAll('tbody tr')

        const chData = Array.from(chTrElement).map(item=>{
            const tdElement = item.querySelector('td.judulseries a')

            const chTitleElement = item.querySelector('td.judulseries a span')
            const chTitle = chTitleElement ? chTitleElement.innerText : null 

            const chDateElement = item.querySelector('td.tanggalseries')
            const chDate = chDateElement ? chDateElement.innerText : null

            const tdLink = tdElement ? tdElement.href : null

            const slug = tdLink? tdLink.slice(19, -1) : null 

            return{
                slug: slug,
                title: chTitle,
                release_date: chDate,
                link: tdLink
            }
        })

        const trData = Array.from(trElement).map(item=>{
            const tdElement = item.querySelectorAll('td');
            const tdData = Array.from(tdElement).map(item=>{
                const tdText = item? item.innerText : null;
                return tdText
            })
            return tdData[1]
        })

        return {
            info: {
                title: trData[0],
                title_alt: trData[1],
                img_url: img,
                synopsis: synopsis,
                jenis: trData[2],
                genre: trData[3],
                Author: trData[4],
                status: trData[5],
                Pg: trData[6],
                arah_baca: trData[7],   
                chapter: chData 
            }
        }
    })

    res.status(200).json({
        "data": datas
    })
})

router.use('/chapter/:slug', async function (req,res) {
    const param = req.params.slug;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(`https://komiku.org/${param}`,{
        waitUntil: "domcontentloaded",
    });

    const html = await page.content();

    const datas = await page.evaluate(()=>{
        const descElement = document.querySelector('div#Judul');

        const infoElement = descElement.querySelector('table tbody');
        const trElement = infoElement.querySelectorAll('tr');

        const panelElement = document.querySelector('div#Baca_Komik');
        const panelImgElement = panelElement.querySelectorAll('img');

        const panelData = Array.from(panelImgElement).map(item=>{
            const panelImg = item ? item.src : null;
            return panelImg;
        })

        const trData = Array.from(trElement).map(item=>{
            const tdElement = item.querySelectorAll('td');
            const tdData = Array.from(tdElement).map(item=>{
                const tdText = item? item.innerText : null;
                return tdText
            })
            return tdData[1]
        })

        return{
            title: trData[0],
            release_date: trData[1],
            arah_baca: trData[2],
            panels: panelData
        }
    })

    res.status(200).json({
        "data":datas
    })
})

module.exports= router;