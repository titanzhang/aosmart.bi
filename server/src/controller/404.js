module.exports = function(request, response) {
  response.status(404);
  response.send({status: false, message: 'Page Not Found'});
};
