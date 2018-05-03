const Express = require('express');
const Multer  = require('multer');
const app = Express();
const upload = Multer();
const bodyParser = require('body-parser');

const hostname = require('os').hostname();
app.set('x-powered-by', false)
app.use( (request, response, next) => {
	response.header('aos', hostname);
	response.header('Access-Control-Allow-Origin', request.headers.origin);
	response.header('Access-Control-Allow-Credentials', 'true');
	next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routing rules
// app.post('/etl/file/ebay', upload.single('file'), require('./entry/controller.EtlFileEbay'));
app.post('/etl/file/order/:site', require('./entry/controller.EtlFileOrder'));
app.post('/etl/file/cog', require('./entry/controller.EtlFileCog'));
app.post('/etl/file/shipping', require('./entry/controller.EtlFileShipping'));
// /report/metric?d=[start,end]&acc=site_account&fl=[sa,sq,oc,co,pf,mg]
app.get('/report/metric', require('./entry/controller.ReportMetric'));
app.get('/report/histogram', require('./entry/controller.ReportHistogram'));

// 404 fallback
app.get('*', require('./entry/controller.404'));
app.post('*', require('./entry/controller.404'));

// Start server
const serverConfig = require('./entry/config.web');
app.listen(serverConfig.port, () => {
  console.log(`Server is running on http://localhost:${serverConfig.port}`);
});
