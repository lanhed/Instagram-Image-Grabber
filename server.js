var https = require('https'),
	http = require('http'),
	fs = require('fs'),
	obj, 
	options = {},
	req,
	imagedata,
	i=0,
	node

fs.readFile("data.json",'utf8', function(err,data) {
	if(err) throw err
	obj = JSON.parse(data)
	console.log('Program running, this can take several minutes. Please wait.')
	downloadFiles()
})

function downloadFiles() {
	node = obj.media.nodes[i]
	options = extractOptions(node.display_src)
	
	// only downlaod image uploads
	if (!node.is_video) {
		if (options.https)
			doHttpsRequest()
		else 
			doHttpRequest()
	}
	else 
		downloadNext()
}

function doHttpRequest() {
	req = http.get(node.display_src, function(res) {
		imagedata = ''
		res.setEncoding('binary')
		res.on('data', function(chunk) {
			imagedata += chunk
		})

		res.on('end', function() {
			saveFile('./images/'+options.filename, imagedata)
		})
	}).on('error', function(e) {
		console.log("Got error: " + e.message)
	})
}

function doHttpsRequest() {
	req = https.get(node.display_src, function(res) {
		imagedata = ''
		res.setEncoding('binary')
		res.on('data', function(chunk) {
			imagedata += chunk
		})

		res.on('end', function() {
			saveFile('./images/'+options.filename, imagedata)
		})
	}).on('error', function(e) {
		console.log("Got error: " + e.message)
	})
}

function saveFile(filename, data) {
	fs.writeFile(filename, data, 'binary', function(err) {
		if (err) throw err
		downloadNext()
	})
}

function downloadNext() {
	i++
	if (i < obj.media.nodes.length) 
		downloadFiles()
	else
		console.log('End of program: All files saved.')
}

function extractOptions(url) {
    var protocol,
    	domain,
    	port = 80,
    	filename,
    	path,
    	options = {},
    	remove,
    	list,
    	s = url.split('/')

	protocol = s.shift()+'//'

	// remove second slash record, it's empty
	remove = s.shift()
    domain = s.shift()
    filename = s[s.length-1]
    path = s.join('/')

    //find port number
    list = domain.split(':')
    if(list.length > 1) {
    	domain = list[0]
    	port = list[1]
    }
    options.https = protocol.indexOf('https://') > -1 ? true : false
    options.host = protocol+domain
    options.path = path
    options.port = port
    options.filename = filename

    return options
}