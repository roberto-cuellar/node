/// Modulos requeridos para el scraping

const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

module.exports = {
    scrapingVolumen: async function(url) {
        let response =[];
         //La respuesta será un array en cuya primera posición
        // se tendrá si se realizó el scrape, y la segunda será el resultado o el error
        try{
            const browser = await puppeteer.launch();
            const newPage = await browser.newPage();
            const pagina = await newPage.goto(url);
            if(pagina.status()===200){
                response[0] = true;
                const html = await newPage.content(); /// Carga de la página del volumen
                const contenidoScrap = scrape(html); /// Realización del scraping
                await browser.close(); /// Cierre del navegador
                /// Verificación de que el scraping no sea nulo
                if(contenidoScrap===undefined || contenidoScrap.titulos === ''){
                    response[0] = false;
                    response[1] = 'Scraping realizado pero resultó vacío';
                }else{
                    response[1] = contenidoScrap; /// Respuesta del scraping
                }

            }else{
                response[0] = false; /// En caso de una respuesta negativa
            }

        }catch(err){
            response[0] = false;
            response[1] = err;
        }
        finally{
            return response;
        }
    }
}


function scrape(html) {  /// Función scraping volumen
    const $ = cheerio.load(html);    
    /// Extracción de los títulos de los artículos 
    let articulosTitulos = []
    $(`.articles li .title a`).each(function (idx,el) {
        articulosTitulos.push(($(el).text().trim()))
    });

    /// Extracción de los links de los artículos  
    let articulosLinks = []
    $(`.articles li .title a`).each(function (idx,el) {
        articulosLinks.push(($(el).attr('href')))
    });


    return{
            titulos: articulosTitulos,
            urls: articulosLinks
        }
    }
