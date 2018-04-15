docker run --name aosSearch -d -v "$PWD/esdata":/usr/share/elasticsearch/data -p 9200:9200 -p 9300:9300 elasticsearch:5.6.8
