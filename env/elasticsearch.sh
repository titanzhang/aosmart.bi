docker run --name aosSearch -d -v "$PWD/esdata":/usr/share/elasticsearch/data -p 9200:9200 -p 9300:9300 docker.elastic.co/elasticsearch/elasticsearch:6.2.4
