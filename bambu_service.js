var express = require("express");
var elasticsearch = require("elasticsearch");
var elastic_client = new elasticsearch.Client({
  host: 'localhost:9200'
});
app = express();

app.listen(3000, () => {

  app.get('/people-like-you', (req, res, next) => {

    var request_params = {
      name: (!req.query.name) ? "" : req.query.name,
      age: (!req.query.age) ? "" : req.query.age,
      latitude: (!req.query.latitude) ? "" : req.query.latitude,
      longitude: (!req.query.longitude) ? "" : req.query.longitude,
      monthlyIncome: (!req.query.monthlyIncome) ? "" : req.query.monthlyIncome,
      experienced: (!req.query.experienced) ? "" : req.query.experienced
    }

    elastic_client.search(
      {
        index: 'bambu',
        body: {
          "query": {
            "bool": {
              "should": [{
                  "fuzzy": {
                    "name": {
                      "value": request_params.name,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 1,
                      "max_expansions": 10
                    }
                  }
                },
                {
                  "fuzzy": {
                    "age": {
                      "value": request_params.age,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 1,
                      "max_expansions": 10
                    }
                  }
                },
                {
                  "fuzzy": {
                    "latitude": {
                      "value": request_params.latitude,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 2,
                      "max_expansions": 10
                    }
                  }
                },
                {
                  "fuzzy": {
                    "longitude": {
                      "value": request_params.longitude,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 2,
                      "max_expansions": 10
                    }
                  }
                },
                {
                  "fuzzy": {
                    "monthlyIncome": {
                      "value": request_params.monthlyIncome,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 2,
                      "max_expansions": 10
                    }
                  }
                },
                {
                  "fuzzy": {
                    "experienced": {
                      "value": request_params.experienced,
                      "boost": 1.0,
                      "fuzziness": 2,
                      "prefix_length": 3,
                      "max_expansions": 10
                    }
                  }
                }
              ]
            }
          }
        }
      },
      function(error, response, status) {
        if (error) {
          console.log("error", error);
          res.json({
            "Error": "Some error occured."
          });
        } else {
          var resp = [];
          if (response.hits.hits.length == 0) {
            resp = [];
          } else {
            var top_score = response.hits.hits[0]._score;
            for (var i = 0; i < response.hits.hits.length; i++) {
              var ith_item = response.hits.hits[i];
              var relative_score_of_other_documents = (ith_item._score / (top_score + 1));
              resp.push({
                "name": ith_item._source.name,
                "age": ith_item._source.age,
                "latitude": ith_item._source.latitude,
                "longitude": ith_item._source.longitude,
                "monthlyIncome": ith_item._source.monthlyIncome,
                "experienced": ith_item._source.experienced,
                "score": relative_score_of_other_documents
              });
            }
          }
          res.json({
            "peopleLikeYou": resp
          });
        }
      });
  });
});
