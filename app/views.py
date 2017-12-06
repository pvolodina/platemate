from flask import render_template, request
from app import app
from app import secret
from yelp.client import Client
from yelp.oauth1_authenticator import Oauth1Authenticator
import simplejson as json
import random


app.secret_key = secret.SECRET_KEY

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/questions')
def questions():
    return render_template('questions.html')


@app.route('/data', methods=['GET', 'POST'])
def getData():
    data = request.json
    credentials = {
        "consumer_key": secret.CONSUMER_KEY,
        "consumer_secret": secret.CONS_SECRET,
        "token": secret.YELP_TOKEN,
        "token_secret": secret.TOKEN_SECRET
    }
    params = {
        'term': "" + data['categories'],
        'categories': "" + data['categories'],
        'price': data['price'],
        'location': data['city'],
        'offset': random.randrange(3, 20),
        'radius': data['range']
    }

    auth = Oauth1Authenticator(**credentials)
    client = Client(auth)

    response = client.search(**params)

    # refactored code - for loop for each business returned
    toReturn = {}
    for i in range(5):
        biz = response.businesses[i]
        toReturn.update(
            {
                'business' + str(i + 1): {
                    'name': biz.name,
                    'url': biz.url,
                    'categories': biz.categories,
                    'phone': biz.display_phone,
                    'image': biz.image_url,
                    'address': biz.location.display_address,
                    'rating': biz.rating,
                    'reviews': biz.reviews
                }
            }
        )

    return json.dumps(toReturn)


@app.route('/results')
def results():
    return render_template('results.html')

