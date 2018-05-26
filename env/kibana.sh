docker run --name aosSearchFront -d --link aosSearch:elasticsearch -p 5601:5601 docker.elastic.co/kibana/kibana:6.2.4
