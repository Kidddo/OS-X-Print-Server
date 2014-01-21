#!/usr/bin/env node

// YOUR ORGANIZATION TOKEN
var token = 'abc';

/* EDIT BELOW HERE AT YOUR OWN RISK */

// VARIABLES
var https = require('https'),
	ipp = require('ipp'),
	time = require('time'),
	PDFDocument = require('pdfkit'),
	OrtcNodeclient = require('ibtrealtimesjnode').IbtRealTimeSJNode,
	session = Math.floor(Math.random()*90000)+10000,
	db = {},
	live = false;

// PRINT LABELS
function print(printer, kids) {
	// Labels are generated using PDFkit.
	// Find more options and formatting help at http://pdfkit.org
	var doc = new PDFDocument({
		size: [165,288],// 30256 DYMO Large Shipping Labels
		margins: 1
	});
	// LANDSCAPE TAG
	doc.rotate(90);
	// FIRST PDF PAGE IS AUTOMATICALLY CREATED
	var firsttag = true;
	// LOOP THROUGH EACH CHILD & ADD LABELS
	for (var i = 0; i < kids.length; i++) {
		var p = db.person[kids[i]];
		// GET QUANTITY OF LABELS TO PRINT
		var qty = 0, s = db.settings;
		if (s.useRooms==1){
			qty = db.room[p.roomID].tags
		} else if (s.useGrades==1) {
			qty = db.grade[p.grade].tags
		}
		
		// FORMAT LABEL
		for (var q = 0; q < qty; q++) {
			if (firsttag){
				firsttag = false
			} else {
				doc.addPage().rotate(90)
			}
			// FIRST NAME
			doc.fontSize(36).font('Helvetica-Bold').text(p.first, 14, -150);
			// LAST NAME
			doc.fontSize(16).font('Helvetica').text(p.last, 15, -117);
			// DIVIDING LINE
			doc.lineWidth(4).lineCap('butt').moveTo(16,-100).lineTo(273,-100).stroke();
			// GENDER
			var gender = (p.gender==1)?'Male':'Female';
			doc.fontSize(20).font('Helvetica-Bold').text(gender, 15, -94);
			// AGE
			doc.text(getAge(p.birthdate), 70, -94, {width:200, align:'right'});
			// ROOM
			var room = (p.roomId&&p.roomId!=='')?'Room: '+db.room[p.roomId].name:'';
			doc.fontSize(14).text(room, 16, -77);
			// GRADE
			var grade = (p.grade&&p.grade!=='')?'Grade: '+db.grade[p.grade].name:'';
			doc.text(grade, 71, -77, {width:200, align:'right'});
			// NOTES
			var notes = (p.notes&&p.notes!=='')?'Allergies/Notes:':'';
			doc.fontSize(10).font('Helvetica').text(notes, 16, -62);
			// NOTES DESCRIPTION
			var noteson = (p.notes&&p.notes!=='')?p.notes:'';
			doc.fontSize(9).text(noteson, 17, -50, {width:170});
			// TIMESTAMP
			doc.fontSize(7).text(timestamp(), 17, -20);
			// GRAY BOX BEHIND CODE
			doc.lineWidth(44).strokeColor('gray').lineCap('butt').moveTo(190,-36).lineTo(273,-36).stroke();
			// SECURITY CODE
			doc.fontSize(40).font('Helvetica-Bold').fillColor('white').text(p.code, 182, -52, {width:100,align:'center'});
		}
	}
	
	// GENERATE PDF & SEND TO PRINTER
	doc.output(function(pdf){
		var printer = ipp.Printer('http://127.0.0.1:631/printers/'+printer);
		var file = {
			'operation-attributes-tag':{
				'requesting-user-name': 'Josiah',
				'job-name': 'Print Job',
				'document-format': 'application/pdf'
			},
			data: new Buffer(pdf, 'binary')
		};
		printer.execute('Print-Job', file, function (err, res) {
			console.log('Printed: '+res.statusCode);
			console.log(res)
		})
	})
}
function testPrint() {
	var doc = new PDFDocument({
		size: [165,288],// 30256 DYMO Large Shipping Labels
		margins: 1
	});
	doc.rotate(90);
	doc.fontSize(36).font('Helvetica-Bold').text('Test', 14, -150);
	doc.output(function(pdf){
		var printer = ipp.Printer('http://127.0.0.1:631/printers/'+printer);
		var file = {
			'operation-attributes-tag':{
				'requesting-user-name': db.settings.name,
				'job-name': 'Test Job',
				'document-format': 'application/pdf'
			},
			data: new Buffer(pdf, 'binary')
		};
		printer.execute('Print-Job', file, function (err, res) {
			console.log('Printed: '+res.statusCode);
			console.log(res)
		})
	})
}

// REALTIME.CO COMMUNICATION
function realtime() {
	var connectionUrl = 'https://ortc-developers.realtime.co/server/ssl/2.1/',
		appKey = 'GAgawx',
		authToken = session,
		channel = 'kidddox'+db.settings.id,
		client = new OrtcNodeclient();
	client.setClusterUrl(connectionUrl);
	client.setConnectionMetadata('UserConnectionMetadata');
	client.onConnected = function (ortc){
		console.log('Connected');
		client.subscribe(channel, true, function (ortc, channel, message) {
			msg(message)
		})
	};
	client.onSubscribed = function (){
		console.log('Subscribed');
	};
	// CONNECT
	console.log('Connecting to ' + connectionUrl);
	client.connect(appKey, authToken);
}
function msg(m) {
	m = JSON.parse(m);
	if (m.type=='print'){
		if (m.children==0){
			testPrint()
		} else {
			print(m.printer, m.children)
		}
	}
	if (m.type=='save'){
		load()
	}
}

// FORMATTING UTILITIES
function getAge(dt,format) {
    var t = new Date();
    var b = new Date(dt);
    var d = Math.floor((t-b)/(1000*60*60*24));
    var w = Math.floor((t-b)/(1000*60*60*24*7));
    var m = Math.floor((t-b)/(1000*60*60*24*30));
    var y = Math.floor(d/365);
    var c = (format)?'year-old':'years';
    var age = y;
    if (m<24){age=m;c=(format)?'month-old':'months'}
    if (w<24){age=w;c=(format)?'week-old':'weeks'}
    if (d<24){age=d;c=(format)?'day-old':'days'}
    return age+' '+c;
}
function timestamp() {
	var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		n = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		d = new Date(),
		h = d.getHours(),
		s = d.getMinutes();
	var hours = (h>12)?(h-12):(h+1),
		min = (s<10)?'0'+s:s,
		pm = (h>11)?'pm':'am';
	return n[d.getDay()]+', '+m[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+' @ '+hours+':'+min+pm
}
function timezone() {
	var now = new time.Date();
	now.setTimezone(db.settings.timezone);
}

// LOAD DATA
function load() {
	console.log('Loading...');
	https.get('https://kidddo.org/api/printLoad.php?token='+token, function(res) {
	  res.on('data', function(d) {
	    console.log('Loaded');
	    d = JSON.parse(d);
	    if (d.status=='y') {
	    	  db = d;
	    	  // INITIALIZE REALTIME
	    	  if (!live){
	    	  	live = true;
	    	  	realtime();
	    	  	timezone();
	    	  }
	    } else {
	    	console.log(d.status)
	    }
	  });
	}).on('error', function(e) {
	  console.error(e);
	});
}

load()