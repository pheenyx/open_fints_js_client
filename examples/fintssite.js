var express = require('express')
var app = express();
var FinTSClient = require('../');
//var FinTSClient = require('open-fin-ts-js-client');

app.get('/', function (req, res) {
	// Hier startet er wenn ein HTTP Request auf dem Server eingeht auf dem Pfad "/"
	// FinTS wie immer
		var bankenliste = {
			'12345678':{'blz':12345678,'url':"http://localhost:3000/cgi-bin/hbciservlet"},
			'94059421':{'blz':94059421,'url':"https://pt-v00-abn.s-hbci.de/fints30"},
			"undefined":{'url':""}
	};
	var client = new FinTSClient(94059421,"smsbernd","12369",bankenliste);
	// Kleiner workaround um die Nachrichten im Cleartext abzugreifen
	// wir tauschen einfach die funktion aus durch eine eigene
	var response_output = "";
	var orig_log_msg_func = client.debugLogMsg;
	client.debugLogMsg = function(txt,send){
		orig_log_msg_func(txt,send);
		response_output+=(send?"<br><b>send</b>":"<br><b>recvieve</b>")+":<br>\n"+txt.replace(/'/g,"'<br>");
	};
	// fints wie gewohnt weiter laufen lassen
	// sobald eine antwort an den client unseres Webservers geschickt werden soll res.send('Hello World!') aufrufen
	client.EstablishConnection(function(error){
			if(error){
				res.send('Fehler');
				console.log("Fehler: "+error);
			}else{
				console.log("Erfolgreich Verbunden");
				// 4. Kontoumsätze für das 1. Konto(client.konten[0]) laden
				client.MsgGetSaldo(client.konten[0].sepa_data,null,null,function(error2,rMsg,data){
					if(error){
						res.send('Fehler');
						console.log("Fehler beim laden der Umsätze: "+error2);
					}else{
						// Alles gut
						// 4. Umsätze darstellen
						console.log(JSON.stringify(data));
						// 5. Verbindung beenden
						client.MsgEndDialog(function(error,recvMsg2){
							// 6. Secure Daten im Objekt aus dem Ram löschen
							client.closeSecure();
							console.log("ENDE");
							res.send(response_output);
						});
					}
				});
			}
		});
})

var server = app.listen(4000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
