import mysql.connector

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

# Create cursors for both databases
source_cursor = source_db.cursor()
destination_cursor = destination_db.cursor()

# Load new data from Account table
source_cursor.execute("SELECT * FROM Account WHERE AccountID NOT IN (SELECT AccountID FROM destination_Account)")
new_accounts = source_cursor.fetchall()

# Load new data from Book table
source_cursor.execute("SELECT * FROM Book WHERE BookID NOT IN (SELECT BookID FROM destination_Book)")
new_books = source_cursor.fetchall()

# Insert new data into destination database
for account in new_accounts:
    sql = "INSERT INTO destination_account (AccountID, UserName, Password, Introduction, Gender, Birthday, Address, Phone, ImageURL, Role, Status, EmailStatus, Email, IdentityStatus, IdentityNum, FrontsideURL, BacksideURL, FaceURL) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    destination_cursor.execute(sql, account)
    destination_db.commit()

for book in new_books:
    sql = "INSERT INTO destination_book (BookID, BookName, Author, Series, Chapter, Description, Price, PublishedDate, Publisher, ImageURL) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    destination_cursor.execute(sql, book)
    destination_db.commit()

# Close database connections
source_db.close()
destination_db.close()