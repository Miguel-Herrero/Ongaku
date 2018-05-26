var request = require("request");
var fs = require('fs')
var path = require('path')

let i = 0

/**
 * Cargar la página en Safari y copiar el Header “Cookie”, porque algunas cookies de auth cambian cada X minutos (y no se descargan imágenes válidas)
 */
function download (index) {  
  var options = {
    method: 'GET',
    url: 'https://ia600302.us.archive.org/BookReader/BookReaderImages.php',
    encoding: null,
    qs: 
     { zip: '/28/items/fromrussiatowest00mils/fromrussiatowest00mils_jp2.zip',
       file: 'fromrussiatowest00mils_jp2/fromrussiatowest00mils_' + String(index).padStart(4, "0") + '.jp2',
       rotate: '0' },
    headers: 
     { 'Postman-Token': '5c8f3173-d4a0-4ef7-96e1-7267fb4b8b6b',
       'Cache-Control': 'no-cache',
       Cookie: 'br-resume-%40gr0uch0mars=311; br-loan-fromrussiatowest00mils=987504065; loan-fromrussiatowest00mils=1527366215-028dd05ef86d3f3fb942068bf23c5960; ol-auth-url=%2F%2Farchive.org%2Fservices%2Fborrow%2FXXX%3Fmode%3Dauth; PHPSESSID=4c24vlile8ep6c49960vek8435; logged-in-sig=1558896215+1527360215+S2ya7Xbe6E7K2%2BZa6GBoiSpdEvXFmYGP5sZsUII61cgV3oCImQsEFTN9V%2BSSgA57zGTeWmMk6%2BBE2VNR2s8OTdZE0pXRpvXDgpIMxFKsOSUXC0Kgy1LConA%2FfkGP9h8Bi%2FR%2BTeDLPJU33xrwTOdlRYatgdrHUERwdnvtGFNUdlE%3D; logged-in-user=miguel.herrerobaena%40gmail.com',
       'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1 Safari/605.1.15',
       Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       Host: 'ia600302.us.archive.org'
      }
  };
  
  return request(options, function (error, res, body) {
    if (error) throw new Error(error);
  
    return fs.writeFile(path.resolve(__dirname) + '/../data/from-russia-to-west/' + String(index).padStart(4, "0") + '.jpg', body,'utf8', err => {
      if (err) {
        console.error(err)
      } else {
        console.log(String(index).padStart(4, "0"), ++i)
      }
    })
  });
}

for (let index = 312; index < 313; index++) {
  
  download(index)
  
}