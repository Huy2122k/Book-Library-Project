from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan
import pandas as pd
import numpy as np
from datetime import date
from datetime import datetime
import mysql.connector

today = date.today()

day1 = today.strftime("%d/%m/%Y")
day2 = today.strftime("%Y.%m.%d")

es = Elasticsearch('http://elk:9200' )
def get_data_from_elastic():
    # query: The elasticsearch query
    query = {
        "query": {
            "wildcard" : {
                    "message.keyword": day1 + '*'
                }
            }
        }
        
    
    # Scan function to get all the data. 
    rel = scan(client=es,             
               query=query,                                     
            #    scroll='1m',
               index='filebeat-' + day2,                         
            #    raise_on_error=True,
            #    preserve_order=False,
            #    clear_scroll=True)
    )
    # Keep response in a list.
    result = list(rel)
    temp = []
    for hit in result:
        temp.append(hit['_source'])
    # return len(temp)
    # Create a dataframe.
    df = pd.DataFrame(temp)
    return df.message

def extractData(raw_data):
    tsf_data = []
    columns = ['day', 'hour', 'create_account_id', 'login_account_id', 'keyword_search', 'category_search',
        'author_search', 'year_search', 'rating_search', 'click_bookId', 'rating_bookId', 'rating', 'comment_bookId', 'borrow_bookId',
        'cancel_lending_id', 'confirm_bookID', 'confirm_return_bookId', 'wishlist_bookId', 'uploaded_avatar', 'added_ID', 'verified_email']
    for data in raw_data:
        line = {}
        date_str = data[:10]
        # Parse the date string into a datetime object
        dt = datetime.strptime(date_str, '%d/%m/%Y')
        # Format the datetime object as a string in the desired format
        formatted_date = dt.strftime('%Y-%m-%d')
        line['day'] = formatted_date
        line['hour'] = data[11:13]
        level = data[39:43]
        print(data)
        if level == 'INFO':
            message = data[44:]
            # if 'category_search' in message:
            #     index = message.find('category_search')
            #     key = message[0:index].split(':')[0]
            #     line[key] = message[0:index].split(':')[1]
            #     message = message[index:]
            
            for item in message.split('.'):
            # if len(item.split(':')) > 1:
                key = item.split(':')[0][1:]
                # print(key)
                values = item.split(':')[1]
                # print(values)
                # if key == 'borrow_bookId':
                if len(values.split(",")) > 1:
                    for value in values.split(','):
                        line[key] = value
                        tsf_data.append(line)
                elif key in ('uploaded_avatar','added_ID', 'verified_email'):
                    line[key] = 1
                elif key in ('comment', 'change_pw_accountId', 'reset_pw_accountId', 'send_verification_code_successfully, display_bookId'):
                    continue
                else:
                    line[key] = values
            tsf_data.append(line)
        # print(data)
    tsf_data = pd.DataFrame(tsf_data, columns=columns)
    return tsf_data

def loadData(tsf_data):
    # Replace 'nan' values with NULL
    tsf_data = tsf_data.replace('null', np.nan)
    tsf_data = tsf_data.replace({np.nan: None})

    # connect to the database
    conn = mysql.connector.connect(
    host='db_destination',
    user='root',
    password='****',
    database='report'
    )
    # create a cursor
    cursor = conn.cursor()
    # insert the data into the table
    insert_query = """
        INSERT INTO statistic (day, hour, create_account_id, login_account_id, keyword_search,
                            category_search, author_search, year_search, rating_search, click_bookId,
                            rating_bookId, rating, comment_bookId, borrow_bookId, cancel_lending_id,
                            confirm_bookID, confirm_return_bookId, wishlist_bookId, uploaded_avatar,
                            added_ID, verified_email)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = tsf_data.values.tolist()
    cursor.executemany(insert_query, values)

    # commit the changes
    conn.commit()

    # close the cursor and the connection
    cursor.close()
    conn.close()
            
raw_data = get_data_from_elastic()
tsf_data = extractData(raw_data)
loadData(tsf_data)