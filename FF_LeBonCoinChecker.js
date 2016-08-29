var path = require('path');
var fs = require('fs');

var hostnameLBC = 'leboncoin.fr';

// cf. http://stackoverflow.com/questions/33015745/node-js-absolute-paths-using-windows-variables-treated-as-relative
function resolveToAbsolutePath(path) {
    return path.replace(/%([^%]+)%/g, function(_, key) {
        return process.env[key];
    });
}

// Possible values are: 'darwin' (mac) , 'freebsd', 'linux', 'sunos' or 'win32' (pour 64 bits aussi)
console.log("This platform is "+ process.platform);
//var profilesPath = path.resolve(resolveToAbsolutePath("%APPDATA%\Mozilla\Firefox\Profiles"));
var profilesPath = path.resolve(resolveToAbsolutePath(["%APPDATA%","Mozilla","Firefox","Profiles"].join(path.sep)));

console.log("profilesPath : "+ profilesPath);

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

var profilesDirLst = getDirectories(profilesPath);

var sqlite3 = require('sqlite3').verbose();
//var http = require('follow-redirects').http; //require('http');
//var httpRequestOptions = {method: 'HEAD', host: hostnameLBC, path: '/', followAllRedirects: true}; // port: 80, 

//var http = require('http');
//var httpRequestOptions = {method: 'HEAD', host: hostnameLBC, path: '/'}; // port: 80, 
var request = require('request');

for (var i in profilesDirLst) {
  var profileDir = path.join(profilesPath, profilesDirLst[i]);
  console.log(profileDir);
  var pathDb = path.join(profileDir, 'places.sqlite');
  // C:\Users\Jordane\AppData\Roaming\Mozilla\Firefox\Profiles\x5wj0lj4.default
  console.log(pathDb);
  var db = new sqlite3.Database(pathDb, sqlite3.OPEN_READWRITE);
  db.all("SELECT p.id, p.url FROM moz_places p where p.url like 'http%://www."+ hostnameLBC +"%' and id == 38 ", function(err, rows) {  
  	rows.forEach(function (row) {
		// 38 'http://www.leboncoin.fr/consoles_jeux_video/641923370.htm?ca=17_s'
  		console.log(row.id, row.url);
		//var req = http.request(httpRequestOptions, 
		//	function(response) {
			//{"cache-control":"public, max-age=24","content-length":"243941","content-type":"text/html; charset=utf-8","expires":"Sun, 21 Aug 2016 20:36:48 GMT","last-modified":"Sun, 21 Aug 2016 20:35:48 GMT","x-frame-options":"SAMEORIGIN","x-request-guid":"bf82a602-e29e-4b8d-b2aa-bcb068e99b4e","accept-ranges":"bytes","date":"Sun, 21 Aug 2016 20:36:24 GMT","via":"1.1 varnish","connection":"close","x-served-by":"cache-lhr6332-LHR","x-cache":"MISS","x-cache-hits":"0","x-timer":"S1471811784.471235,VS0,VE69","vary":"*","x-dns-prefetch-control":"off","set-cookie":["prov=cfd46939-af86-97b2-28d3-1e11ebad174f; domain=.stackoverflow.com; expires=Fri, 01-Jan-2055 00:00:00 GMT; path=/; HttpOnly"]}
		//	console.log(row.id +" -> "+ JSON.stringify(response.statusCode));
		//  }
		//);
		//req.end();
		
		request({
		  followAllRedirects: true,
		  url: row.url
		}, function (error, response, body) {
			console.log(response.statusCode);
			if (!error && response.statusCode == 404) {
				//TODO : delete entry by id
			}
		  //if (!error && response.statusCode == 200) {
		//	console.log(body) // Show the HTML for the Google homepage.
		  //}
		})
  	})  
  });   
  db.close();

}




