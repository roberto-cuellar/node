const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/articulosUrlDB";
mongoose.connect(mongoUrl)


const mainUrl = 'https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/issue/archive';

let html = [];
let articulos = [];
iniciar(); //// Inicia el proceso de scraping (almacenamiento de los links para la siguiente etapa)

async function busquedaUrlVolumenes(html,url) {   /// Busqueda de los Urls de los volumenes disponibles en la página de Bistua
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        html = await page.content();
        scrape(html);  
        browser.close();   
    }catch (ex){
        console.log(`Error en la petición de la main page`,ex.message)
    }finally{
        console.log("Procesada la petición a la main page")
    }
}



async function busquedaUrlArticulos(urls) {   /// Busqueda de los Urls para cada uno de los artículos dentro de los volumenes 
     for(let i=0;i<urls.length;i++){    
        try{
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(urls[i].url);
            await page.screenshot({
                path: `landing-page-${i}.png`,
                fullPage: true
              });
            evol = ((i+1)/urls.length)*100;
            let html = await page.content();
            scrapeVolumen(html);  
            browser.close();   
        }catch (ex){
            console.log(`Error en la petición del volumen con titulo ${urls[i].titulo}`,ex.message)
        }finally{
            evol = ((i+1)/urls.length)*100;
            console.log("Procesado el scraping de los volumenes: ",i+1,' de ',urls.length,', avance: ', Math.floor(evol),"%")
        }
    }
}


async function iniciar() {
    const scrapingMain = await busquedaUrlVolumenes(html,mainUrl);
    console.log("Main Page Scraping Finished");
    await Volumen.insertMany(volumenes,function (err) {  
        if(err){
            console.log('No se pudo completar la carga a la DB', err);
        }else{
            console.log('Completado el guardado');
        }
    })
    const scrapingVolumenes = await busquedaUrlArticulos(volumenes);
    await Articulo.insertMany(articulosVect,function (err) {  
        if(err){
            console.log('No se pudo completar la carga de artículos a la DB', err);
        }else{
            console.log('Completado el guardado de artículos');
        }
    })
    console.log("Volumens Page Scraping Finished");
}
const articulosInfo = new mongoose.Schema({
    titulo: String,
    url: String
})

const volumenSchema = new mongoose.Schema({
    titulo: String,
    url: String
})

const Volumen = mongoose.model('Volumen',volumenSchema);
let volumenes = []

const Articulo = mongoose.model('Articulo',articulosInfo);
let articulosVect = []

function scrape(html) {
    const $ = cheerio.load(html);  
    /// Extracción de los títulos de los volumenes
    let volumenesTitulos = []
    $('.issues_archive li .title').each(function (idx,el) {
        volumenesTitulos.push($(el).text().trim())
    });
    // console.log('Volumenes Disponibles Titulos: ',volumenesTitulos)
    /// Extracción de los links de los volumenes
    let volumenesLinks = []
    $('.issues_archive li .title').each(function (idx,el) {
        volumenesLinks.push($(el).attr('href'))
    });
    // console.log('Volumenes Disponibles Links: ',volumenesLinks);
    volumenesLinks.forEach((element,idx)=>{
        // console.log(element)
        volumenes.push(new Volumen(
            {
                titulo: volumenesTitulos[idx],
                url: element
            })
            );        
    })
}



function scrapeVolumen(html) {  
    const $ = cheerio.load(html);    
    /// Extracción de los títulos de los artículos 
    let articulosTitulos = []
    $(`.articles li .title a`).each(function (idx,el) {
        articulosTitulos.push(($(el).text().trim()))
    });
    let articulosLinks = []
    $(`.articles li .title a`).each(function (idx,el) {
        articulosLinks.push(($(el).attr('href')))
    });
    articulosLinks.forEach((element,idx)=>{
        // console.log(element)
        articulosVect.push(new Articulo(
            {
                titulo: articulosTitulos[idx],
                url: element
            })
            );        
    })
}

