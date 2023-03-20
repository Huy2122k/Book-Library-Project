from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan
import pandas as pd
from datetime import date
# import mysql.connector


today = date.today()

day1 = today.strftime("%d/%m/%Y")
day2 = today.strftime("%Y.%m.%d")

es = Elasticsearch('http://localhost:9200' )
def get_data_from_elastic():
    # query: The elasticsearch query.
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
        line['day'] = data[:10]
        line['hour'] = data[11:13]
        level = data[39:43]
        message = data[44:]
        for item in message.split():
            key = item.split(':')[0]
            values = item.split(':')[1]
            if key == 'borrow_bookId':
                for value in values.split(','):
                    line[key] = value
                    tsf_data.append(line)
            elif key in ('uploaded_avatar','added_ID', 'verified_email'):
                line[key] = 1
            elif key in ('comment', 'change_pw_accountId', 'reset_pw_accountId', 'send_verification_code_successfully'):
                continue
            else:
                line[key] = values
                tsf_data.append(line)
        # print(data)
    tsf_data = pd.DataFrame(tsf_data, columns=columns)
    return tsf_data

def loadData(tsf_data):
# connect to the database
    conn = mysql.connector.connect(
    host='db_destination',
    user='root',
    password='****',
    database='report'
    )
# write the data to the database
    tsf_data.to_sql(
    name='statistic',
    con=conn,
    index=False
    )
# close the connection
    conn.close()


raw_data = get_data_from_elastic()
tsf_data = extractData(raw_data)
loadData(tsf_data)