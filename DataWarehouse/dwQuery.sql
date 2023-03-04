CREATE TABLE statistic(
  id INT AUTO_INCREMENT PRIMARY KEY,
  day DATE,
  hour INT,
  create_account_id varchar(255),
  login_account_id varchar(255),
  keyword_search VARCHAR(255),
  category_search VARCHAR(255),
  author_search VARCHAR(255),
  year_search INT,
  rating_search INT,
  click_bookId varchar(255),
  rating_bookId varchar(255),
  rating FLOAT,
  comment_bookId varchar(255),
  borrow_bookId varchar(255),
  cancel_lending_id varchar(255),
  confirm_bookID varchar(255),
  confirm_return_bookId varchar(255),
  wishlist_bookId varchar(255),
  uploaded_avatar INT,
  added_ID INT,
  verified_email INT
);

CREATE TABLE destination_account (
  `AccountID` varchar(255) NOT NULL,
  `UserName` varchar(127) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Introduction` mediumtext,
  `Gender` varchar(1) NOT NULL,
  `Birthday` datetime NOT NULL,
  `Address` varchar(255) NOT NULL,
  `Phone` varchar(20) NOT NULL,
  `ImageURL` varchar(200) DEFAULT NULL,
  `Role` varchar(10) NOT NULL,
  `Status` varchar(127) NOT NULL,
  `EmailStatus` varchar(127) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `IdentityStatus` varchar(127) NOT NULL,
  `IdentityNum` varchar(20) DEFAULT NULL,
  `FrontsideURL` varchar(1023) DEFAULT NULL,
  `BacksideURL` varchar(1023) DEFAULT NULL,
  `FaceURL` varchar(1023) DEFAULT NULL,
  PRIMARY KEY (`AccountID`),
  UNIQUE KEY `UserName_UNIQUE` (`UserName`)
); 

CREATE TABLE destination_book (
  `BookID` varchar(255) NOT NULL,
  `BookName` mediumtext NOT NULL,
  `Author` varchar(255) DEFAULT NULL,
  `Series` varchar(255) DEFAULT NULL,
  `Chapter` int DEFAULT NULL,
  `Description` mediumtext,
  `Price` float NOT NULL,
  `PublishedDate` datetime NOT NULL,
  `Publisher` varchar(100) NOT NULL,
  `ImageURL` varchar(1023) DEFAULT NULL,
  PRIMARY KEY (`BookID`)
);





