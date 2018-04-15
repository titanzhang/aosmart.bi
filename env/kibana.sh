docker run --name aosSearchFront -d --link aosSearch:elasticsearch -p 5601:5601 kibana:5.6.8
