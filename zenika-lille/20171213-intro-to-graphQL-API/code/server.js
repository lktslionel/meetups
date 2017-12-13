var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var $req = require("request-promise-native");


const ADDRESS_API_SEARCH_URL = "https://api-adresse.data.gouv.fr/search";
const ANTENNA_API_SEARCH_URL = "https://data.anfr.fr/api/records/1.0/search";


class City {
  constructor(coordinates, zipCode, city) {
    this.coords = coordinates;
    this.zip = zipCode;
    this.name = city;
  }

  nearestAntenna(){

  }
}


var schema = buildSchema(`
  type Query {
    search(query : String!) : City 
  }

  type GPS {
    lat:  Float
    long: Float
  }

  type City {
    coords: String
    zip:    String
    name:   String
  }
`);

var root = { 
  search: (query) => {
    var $searchReq = $req(`${ADDRESS_API_SEARCH_URL}/?q=${query}`);
    return $searchReq.then((data)=>{
      var resp
        , city
        , coords
        , name
        , zip;
      resp  = JSON.parse(data);
      resp = resp.features[0].properties;
      
      coords = [resp.x, resp.y].join(", ");
      name = resp.name;
      zip = resp.postcode;
      
      city = new City(coords, zip, name);
      console.log(city);

      return city;
    }).catch((err)=>{
      console.log("FATAL!!");
    });
  }  
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(8080, () => console.log('Now browse to localhost:8080/graphql'));