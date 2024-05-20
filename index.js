const express = require('express');
const request = require('request');

const app = express();

const apiDoc = {
    message: 'API pour récupérer les prochains repas d\'un restaurant CROUS de Toulouse',
    author: {
      "name": "Alexis RARCHAERT",
      "email": "bonjour@alexis-rarchaert.fr",
      "website": "https://alexis-rarchaert.fr",
      "contributors": [{}]
    },
    version: '1.0.0',
    data: {
        "static": [
            {
                name: 'getRestaurants',
                description: 'Récupère la liste des restaurants CROUS de Toulouse',
                method: 'GET',
                endpoint: '/getRestaurants',
            }
        ],
        "dynamic": [
            {
                name: 'getRepas',
                description: 'Récupère la liste des prochains repas d\'un restaurant',
                method: 'GET',
                endpoint: '/getRepas/:Id_restaurant',
            }
        ]
    }
}

app.get('/', (req, res) => {
    res.send(apiDoc);
});

app.get('/getRepas/:restaurant', (req, res) => {
    //URL: https://www.data.gouv.fr/fr/datasets/r/19a25454-52f1-4154-9d54-4d65d53bccb3 (XML)

    //On récupère le paramètre restaurant
    const restaurant = req.params.restaurant;

    //On récupère les données du fichier XML
    request('https://www.data.gouv.fr/fr/datasets/r/19a25454-52f1-4154-9d54-4d65d53bccb3', (error, response, body) => {
        if (!error && response.statusCode == 200) {
            //On parse le fichier XML
            const parseString = require('xml2js').parseString;
            parseString(body, (err, result) => {
                //Reponse = root->resto->[id]->$(IDRESTO)
                const repasLength = result.root.resto.length;
                let menu = [];

                for (let i = 0; i < repasLength; i++) {
                    //console.info(result.root.resto[i].$)
                    if (result.root.resto[i].$.id == restaurant) {
                        if(result.root.resto[i].menu == null) {
                            res.send({"error": "Aucun menu pour ce restaurant"});
                            return;
                        }
                        let joursdeRepas = result.root.resto[i].menu.length;
                        
                        if(joursdeRepas > 0){
                            for (let j = 0; j < joursdeRepas; j++) {
                                let repasduJour = result.root.resto[i].menu[j]._;
                                console.log(repasduJour);

                                //On split le repas du jour au niveau de "<h4>Entrées</h4>", "<h4>Plats</h4>" et "<h4>Desserts</h4>
                                //Mais on vérifie avant que ces éléments existent
                                let entree;
                                let plats;
                                let dessert;

                                if(repasduJour.includes("<h4>Entrées</h4>")){
                                    entree = repasduJour.split("<h4>Entrées</h4>")[1].split("<h4>Plats</h4>")[0];

                                    while(entree.includes("<li>")){
                                        entree = entree.replace("<li>", "");
                                        //entree = entree.replace("</li>", "");
                                    }

                                    entree = entree.replace("<ul class=\"liste-plats\">", "");
                                    entree = entree.replace("</ul>", "");

                                    entree = entree.replace("\n", "");
                                    
                                    entree = entree.replace("\u003C/li\u003Eou\u003C/li\u003E", "+");
                                    entree = entree.replace("</li>ou</li>", "+");
                                    entree = entree.replace("ou\u003C/li\u003E", "+")
                                    entree = entree.replace("\u003C/li\u003E", "");

                                    entree = entree.replace("\u003C/li\u003E", "");

                                    entree = entree.split("+");
                                }
                                if(repasduJour.includes("<h4>Plats</h4>")){
                                    plats = repasduJour.split("<h4>Plats</h4>")[1].split("<h4>Desserts</h4>")[0];

                                    while(plats.includes("<li>")){
                                        plats = plats.replace("<li>", "");
                                        //plats = plats.replace("</li>", "");
                                    }

                                    plats = plats.replace("<ul class=\"liste-plats\">", "");
                                    plats = plats.replace("</ul>", "");

                                    plats = plats.replace("\n", "+");

                                    plats = plats.replace("\u003C/li\u003Eou\u003C/li\u003E", "+");
                                    plats = plats.replace("</li>ou</li>", "+");
                                    plats = plats.replace("ou\u003C/li\u003E", "+")
                                    plats = plats.replace("\u003C/li\u003E", "");
                                    plats = plats.replace("</li>", "+")

                                    plats = plats.replace("\u003C/li\u003E", "");
                                    plats = plats.replace("</li>", "")

                                    plats = plats.split("+");
                                }
                                if(repasduJour.includes("<h4>Desserts</h4>")){
                                    dessert = repasduJour.split("<h4>Desserts</h4>")[1];

                                    while(dessert.includes("<li>")){
                                        dessert = dessert.replace("<li>", "");
                                        //dessert = dessert.replace("</li>", "");
                                    }

                                    dessert = dessert.replace("<ul class=\"liste-plats\">", "");
                                    dessert = dessert.replace("</ul>", "");

                                    dessert = dessert.replace("\n", "");

                                    dessert = dessert.replace("\u003C/li\u003Eou\u003C/li\u003E", "+");
                                    dessert = dessert.replace("</li>ou</li>", "+");
                                    dessert = dessert.replace("ou\u003C/li\u003E", "+")
                                    dessert = dessert.replace("\u003C/li\u003E", "");
            

                                    dessert = dessert.replace("\u003C/li\u003E", "");
                                    dessert = dessert.replace("ou</li>", "+")
                                    dessert = dessert.replace("</li>", "")


                                    dessert = dessert.split("+");
                                }

                                console.info("=====================================");

                                console.info("Jour du repas: " + result.root.resto[i].menu[j].$.date);
                                console.info("Entrée: " + entree);
                                console.info("Plats: " + plats);
                                console.info("Desserts: " + dessert);

                                console.info("=====================================");



                                let repas = {
                                    "jour": result.root.resto[i].menu[j].$.date,
                                    "entrees": entree,
                                    "plats": plats,
                                    "desserts": dessert
                                }

                                menu.push(repas);
                            }
                        }
                    }
                }

                res.send(menu);
            });
        }
    });
});

app.get('/getRestaurants', (req, res) => {
    request('https://www.data.gouv.fr/fr/datasets/r/e79feae1-efd0-41a4-acbf-5867a508c472', (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const parseString = require('xml2js').parseString;
            parseString(body, (err, result) => {
                const restaurantsLength = result.root.resto.length;
                let restaurants = [];

                for (let i = 0; i < restaurantsLength; i++) {
                    let restaurant = {
                        "id": result.root.resto[i].$.id,
                        "nom": result.root.resto[i].$.title,
                        "type": result.root.resto[i].$.type,
                        "loc": {
                            "lat": result.root.resto[i].$.lat,
                            "lon": result.root.resto[i].$.lon
                        },
                        "desc": result.root.resto[i].$.short_desc
                    }

                    restaurants.push(restaurant);
                }

                res.send(restaurants);
            });
        }
    });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});