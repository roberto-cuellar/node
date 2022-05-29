const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/articulosUrlDB";
mongoose.connect(mongoUrl)
const articulosInfo = new mongoose.Schema({
    titulo: String,
    url: String
})
const Articulo = mongoose.model('Articulo',articulosInfo);


let listaArticulos = []
let urls = [];
let html = [];
let articulos = [];
iniciar(); //// Inicia el proceso de scraping a partir de los urls

async function busqueda(html,urls) {  
    let evol = 0;
    console.log('entrando')
    for(let i = 0;i<urls.length;i++){  
        try{
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            // await page.goto(urls[i].url);
            const pagina = await page.goto(urls[i].url);
            console.log('page response: ',pagina.status());
            if(pagina.status()===200){
                html = await page.content();
                await scrape(html);  
                // evol = ((i+1)/urls.length)*100;
                // console.log("Procesando ... ",evol,"%")
                browser.close();   
                //console.log(articulos[i])
                if(articulos[articulos.length-1] !== undefined){                
                    let articulo = new ArticuloDB(
                        articulos[articulos.length-1]
                    )         
                    await articulo.save();
                    console.log('Artículo agregado ',i+1, ', de :',urls.length)
                }else{
                    console.log('Artículo Escrapeado Vacío')
                }
            }

        }catch (ex){
            console.log(`Error en la petición ${i} de ${urls[i].titulo}`,ex.message)
        }finally{
            evol = ((i+1)/urls.length)*100;
            console.log("Procesando ... ",Math.floor(evol),"%")
        }

    }
}


async function iniciar() {
     Articulo.find({},function (err,foundItems) {  
        if(foundItems.length!==0){
            listaArticulos = foundItems;
            urls = listaArticulos;
            busqueda(html,urls);
            console.log('Elementos Encontrados: ',foundItems.length)
            //console.log(urls)
        }else{
            console.log('Ningún elemento encontrado')
        }
    });
    console.log("Scraping Finished");
}

/// Se debe agregar ahora el acceso a la base de datos básico, datos repetidos

const articuloSchema = new mongoose.Schema({ // Esquema de los elementos
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
});

const ArticuloDB = mongoose.model('ArticulosFound',articuloSchema);

class ArticuloClass{
    constructor(
        titulo,
        autores,
        afiliacion,
        doi,
        keywordsVect,
        resumen,
        citaStd,
        linkPdf,
        linkImg,
        year,
        vol,
        num
        ){
            this.titulo = titulo;
            this.autores = autores;
            this.afiliacion = afiliacion;
            this.doi = doi;
            this.keywordsVect = keywordsVect;
            this.resumen = resumen;
            this.citaStd = citaStd;
            this.linkPdf =linkPdf;
            this.linkImg = linkImg;
            this.year = year;
            this.vol = vol;
            this.num = num;
        
    }
}


async function scrape(html) {
    
    const $ = cheerio.load(html);    
    
    /// Extracción de los autores
    let titulo = $('h1').text().trim();
    if(titulo === undefined){
        titulo = '';
    }
    // console.log(titulo);

    /// Extracción de los autores
    let autores = []
    $('.authors .name').each(function (idx,el) {
        autores.push($(el).text().trim())
    });
    if(autores === undefined){
        autores = [];
    }
    // console.log('Autores: ',autores);
    
    //// Extracción de la afiliación
    let afiliacion = []
    $('.authors .affiliation').each(function (idx,el) {
        afiliacion.push($(el).text().trim())
    })
    if(afiliacion === undefined){
        afiliacion = [];
    }
    // console.log('Afiliación: ',afiliacion);

    
    /// Extracción del doi
    let doi = $('.doi .value').text().trim();
    if(doi === undefined){
        doi = '';
    }
    // console.log('DOI: ',doi);
    
    /// Extracción de las palabras clave
    let keywordsVect = []
    let keywords = $('.keywords .value').text().trim().split(',');
    keywords.forEach(element => {
        keywordsVect.push(element.trim())
    })
    if(keywords === undefined){
        keywordsVect = [];
    }
    // console.log('Palabras clave: ',keywordsVect);
    
    /// Extracción del Resumen
    let resumen = $('.abstract p').text().trim();
    if(resumen === undefined){
        resumen = '';
    }
    // console.log('Resumen: ',resumen);
    
    /// Extracción de la cita standard
    let citaStd = $('.csl-right-inline').text().trim();
    if(citaStd === undefined){
        citaStd = '';
    }
    // console.log('Cita Estandar: ',citaStd)
    
    /// Extracción del link del PDF por medio del atributo href de la etiquta a
    let linkPdf = $('.pdf').attr('href');
    if(linkPdf === undefined){
        linkPdf = '';
    }
    
    // console.log('Link al PDF: ',linkPdf)
    
    /// Extracción del link de la imagen abstract por medio del atributo src de la etiquta img
    let linkImg = $('.cover_image .sub_item img').attr('src');
    if(linkImg === undefined){
        linkImg = '';
    }
    // console.log('Link a la imagen: ',linkImg)

    /// Extracción del volumen al que pertenece 
    let issue = $('.issue .sub_item .value .title').text().trim().split(" ");
    //console.log('Issue: ',issue)    
    
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
    

    // console.log('Volumen: ',vol)
    // console.log('Número: ',num)
    // console.log('Año: ',year)
    articulos.push(new ArticuloClass(titulo,autores,afiliacion,doi,keywordsVect,resumen,citaStd,linkPdf,linkImg,year,vol,num));
    //console.log(articulos[articulos.length-1]);
}