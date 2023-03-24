import mysql.connector
import pandas as pd
import numpy as np

# Connect to source database
source_db = mysql.connector.connect(
  host="db_source",
  user="root",
  password="****",
  database="library"
)

# Connect to destination database
destination_db = mysql.connector.connect(
  host="db_destination",
  user="root",
  password="****",
  database="report"
)

# Load data from source database into a pandas dataframe
df_source_account = pd.read_sql('SELECT * FROM account', source_db)
df_source_book = pd.read_sql('SELECT * FROM book', source_db)
df_source_category = pd.read_sql('SELECT * FROM category', source_db)


# Load existing data from target database into a pandas dataframe
df_target_account = pd.read_sql('SELECT * FROM destination_account', destination_db)
df_target_book = pd.read_sql('SELECT * FROM destination_book', destination_db)
df_target_category = pd.read_sql('SELECT * FROM destination_category', destination_db)


# Find new rows in source dataframe
df_new_account = df_source_account[~df_source_account['AccountID'].isin(df_target_account['AccountID'])]
df_new_book = df_source_book[~df_source_book['BookID'].isin(df_target_book['BookID'])]
df_new_category = df_source_category[~df_source_category['CategoryID'].isin(df_target_category['CategoryID'])]


# Replace 'nan' values with NULL
df_new_book = df_new_book.replace({np.nan: None})

# Insert new rows into target database
cursor = destination_db.cursor()
for row in df_new_account.itertuples(index=False):
  cursor.execute('INSERT INTO destination_account (AccountID, UserName, Password, Introduction, Gender, Birthday, Address, Phone, ImageURL, Role, Status, EmailStatus, Email, IdentityStatus, IdentityNum, FrontsideURL, BacksideURL, FaceURL) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', row)
for row in df_new_book.itertuples(index=False):
  cursor.execute('INSERT INTO destination_book (BookID, BookName, Author, Series, Chapter, Description, Price, PublishedDate, Publisher, ImageURL) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', row)
for row in df_new_category.itertuples(index=False):
  cursor.execute('INSERT INTO destination_category (CategoryID, CategoryName)  VALUES (%s, %s)', row)

destination_db.commit()
cursor.close()

# Close database connections
source_db.close()
destination_db.close()