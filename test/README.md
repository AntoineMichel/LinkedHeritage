curl -m 600 -X POST -H "Accept: text/turtle" -H "Content-type: text/plain"  --data "@original.txt"  http://localhost:8080/skosifier

curl -m 600 -X POST -H "Accept: application/json" -H "Content-type: text/plain"  --data "@original.txt"  http://localhost:8080/skosifier

curl -m 600 -X POST -H "Accept: application/json" -H "Content-type: text/plain"  --data "@original.txt" -d "conf=@mapping.json"  http://localhost:8080/skosifier

curl -m 600 -X GET -H "Accept: application/json" -d "uri=http://cuture-heritage.org/thesaurus/organisationID/nameTest"  http://localhost:8080/skosifier

== url finale pour envoyer les fichiers :
curl -v -m 600 -X POST -H "Accept: application/json" -F "file=@original.txt;type=text/plain" -F "conf=@mapping.json;type=text/plain"  http://localhost:8080/skosifier


