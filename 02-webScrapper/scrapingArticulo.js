/// Modulos requeridos para el scraping

const cheerio = require("cheerio");
const puppeteer = require('puppeteer');


module.exports = {
    scrapingArticulo: async function(url) {
        let response = []; //La respuesta será un array en cuya primera posición
        // se tendrá si se realizó el scrape, y la segunda será el resultado o el error
        try{
            const browser = await puppeteer.launch();
            const newPage = await browser.newPage();
            const pagina = await newPage.goto(url);
            if(pagina.status()===200){
                response[0] = true;
                const html = await newPage.content(); /// Carga de la página del artículo
                const contenidoScrap = scrape(html); /// Realización del scraping
                await browser.close(); /// Cierre del navegador
                /// Verificación de que el scraping no sea nulo
                if(contenidoScrap===undefined){
                    response[0] = false;
                    response[1] = 'Scraping realizado pero resultó vacío';
                }else{
                    response[1] = contenidoScrap; /// Respuesta del scraping
                    //guardar(contenidoScrap);
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
    },
    Schema: { // Esquema de los elementos
        titulo: String,
        autores: Array,
        afiliacion: Array,
        doi: String,
        keywordsVect: Array,
        resumen: String,
        citaStd: String,
        linkPdf: String,
        linkImg: String,
        year: String,
        vol: String,
        num: String
    }
 }

function scrape(html){
    const $ = cheerio.load(html);    
    
    /// Extracción de los autores
    let titulo = $('h1').text().trim();
    if(titulo === undefined){
        titulo = '';
    }

    /// Extracción de los autores
    let autores = []
    $('.authors .name').each(function (idx,el) {
        autores.push($(el).text().trim())
    });
    if(autores === undefined){
        autores = [];
    }
        
    //// Extracción de la afiliación
    let afiliacion = []
    $('.authors .affiliation').each(function (idx,el) {
        afiliacion.push($(el).text().trim())
    })
    if(afiliacion === undefined){
        afiliacion = [];
    }
        
    /// Extracción del doi
    let doi = $('.doi .value').text().trim();
    if(doi === undefined){
        doi = '';
    }
        
    /// Extracción de las palabras clave
    let keywordsVect = []
    let keywords = $('.keywords .value').text().trim().split(',');
    keywords.forEach(element => {
        keywordsVect.push(element.trim())
    })
    if(keywords === undefined){
        keywordsVect = [];
    }
        
    /// Extracción del Resumen
    let resumen = $('.abstract p').text().trim();
    if(resumen === undefined){
        resumen = '';
    }
        
    /// Extracción de la cita standard
    let citaStd = $('.csl-right-inline').text().trim();
    if(citaStd === undefined){
        citaStd = '';
    }
        
    /// Extracción del link del PDF por medio del atributo href de la etiquta a
    let linkPdf = $('.pdf').attr('href');
    if(linkPdf === undefined){
        linkPdf = '';
    }
    
    /// Extracción del link de la imagen abstract por medio del atributo src de la etiquta img
    let linkImg = $('.cover_image .sub_item img').attr('src');
    if(linkImg === undefined){
        linkImg = '';
    }

    /// Extracción del volumen al que pertenece 
    let issue = $('.issue .sub_item .value .title').text().trim().split(" ");
    
    let year='';
    let vol='';
    let num='';
    if (issue[0]== 'Vol.'){
        vol = issue[1];
        num = issue[3];
        year = issue[4].replace(/["'\(\)]/g, "");
    }else{
        vol = 'congreso',
        year = '2019'
        num = '1'
    }
    
    return { /// Regreso del objeto artículo scrapeado
        titulo: titulo,
        autores: autores,
        afiliacion: afiliacion,
        doi: doi,
        keywordsVect: keywordsVect,
        resumen: resumen,
        citaStd: citaStd,
        linkPdf: linkPdf,
        linkImg: linkImg,
        year: year,
        vol: vol,
        num: num
    }
    
}


// async function guardar(elemento) {  
//     await mongoose.connect(mongoUrl);

//     const articuloSchema = new mongoose.Schema({ // Esquema de los elementos
//         titulo: String,
//         autores: Array,
//         afiliacion: Array,
//         doi: String,
//         keywordsVect: Array,
//         resumen: String,
//         citaStd: String,
//         linkPdf: String,
//         linkImg: String,
//         year: String,
//         vol: String,
//         num: String
//     });
    
//     const ArticuloDB = mongoose.model('Articulostestdos',articuloSchema);
//     let articulo = new ArticuloDB(elemento);
//     await articulo.save();
//     console.log('Articulo guardado');
// }