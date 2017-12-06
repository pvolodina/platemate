from flask import Flask
from app import secret
app = Flask(__name__)
from app import views