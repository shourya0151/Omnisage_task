import logging
import sys

#get logger

logger = logging.getLogger()

#creat formattor

formatter = logging.Formatter(
    fmt="%(asctime)s - %(levelname)s - %(message)s"
)


#creating handlers
stream_handler = logging.StreamHandler(sys.stdout)
file_handler = logging.FileHandler('app.log')

#set formattors
stream_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

#add handlers to logger instance

logger.handlers = [stream_handler,file_handler]

#set log level
logger.setLevel(logging.INFO)


