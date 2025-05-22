import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

class Db:
    def __init__(self,uri:str):
        
        # # Create a new client and connect to the server
        self.client = MongoClient(os.getenv(uri), server_api=ServerApi('1'))
        self.uri = os.getenv(uri)
        # Send a ping to confirm a successful connection
        try:
            self.client.admin.command('ping')
            self.uri = os.getenv(uri)
            logger.info("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            logger.info("couldn not connect to mongo db!")
        
    def close(self):
        self.client.close()  # Closes the connection
        logger.info("Db connection closed.")

        
db_instance = Db("MONGO_URI")