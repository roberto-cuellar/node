
const cheerio = require("cheerio");
const { rmSync } = require("fs");
const puppeteer = require('puppeteer');

let html = [];
let articulos = [];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://ojs.unipamplona.edu.co/ojsviceinves/index.php/bistua/article/view/210');
    await page.screenshot({
      path: 'landing-page-1.png',
      fullPage: true
    });
    html = await page.content();
    scrape(html);  
    browser.close();
  })();

class Articulo{
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


function scrape(html) {
    const $ = cheerio.load(html);    
    
    /// Extracción de los autores
    const titulo = $('h1').text().trim();
    console.log(titulo);

    /// Extracción de los autores
    let autores = []
    $('.authors .name').each(function (idx,el) {
        autores.push($(el).text().trim())
    });
    console.log('Autores: ',autores);
    
    //// Extracción de la afiliación
    let afiliacion = []
    $('.authors .affiliation').each(function (idx,el) {
        afiliacion.push($(el).text().trim())
    })
    console.log('Afiliación: ',afiliacion);

    
    /// Extracción del doi
    const doi = $('.doi .value').text().trim();
    console.log('DOI: ',doi);
    
    /// Extracción de las palabras clave
    let keywordsVect = []
    let keywords = $('.keywords .value').text().trim().split(',');
    keywords.forEach(element => {
        keywordsVect.push(element.trim())
    })
    console.log('Palabras clave: ',keywordsVect);
    
    /// Extracción del Resumen
    const resumen = $('.abstract p').text().trim();
    console.log('Resumen: ',resumen);
    
    /// Extracción de la cita standard
    const citaStd = $('.csl-right-inline').text().trim();
    console.log('Cita Estandar: ',citaStd)
    
    /// Extracción del link del PDF por medio del atributo href de la etiquta a
    const linkPdf = $('.pdf').attr('href');
    console.log('Link al PDF: ',linkPdf)
    
    /// Extracción del link de la imagen abstract por medio del atributo src de la etiquta img
    const linkImg = $('.cover_image .sub_item img').attr('src');
    console.log('Link a la imagen: ',linkImg)

    /// Extracción del volumen al que pertenece 
    const issue = $('.issue .sub_item .value .title').text().trim().split(" ");
    const vol = issue[1];
    const num = issue[3];
    //Del año se deben quitar los paréntesis
    const year = issue[4].replace(/["'\(\)]/g, "");
    console.log('Volumen: ',vol)
    console.log('Número: ',num)
    console.log('Año: ',year)
    console.log("Como clase: -------")
    articulos.push(new Articulo(titulo,autores,afiliacion,doi,keywordsVect,resumen,citaStd,linkPdf,linkImg,year,vol,num));
    console.log(articulos);

}