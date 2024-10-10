CREATE TABLE products (
     productid SERIAL PRIMARY KEY,
    productname VARCHAR(128) NULL,
    unitprice DECIMAL(18,2) NULL,
    unitinstock INT NULL,
    productpicture VARCHAR(256) NULL,
    category_id INT NOT NULL,
    createddate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifieddate TIMESTAMP NULL
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE categories (
    category_id SERIAL PRIMARY KEY,
    categoryname VARCHAR(64) NOT NULL,
   categorystatus INT NOT NULL

);

insert into categories (categoryname, categorystatus) 
values ('Mobile',1) , ('Tablet',1), ('Smart Watch',1), ('Laptop',1);

INSERT INTO product (
    productname,
    unitprice,
    unitinstock,
    productpicture,
    category_id,
    createddate,
    modifieddate
) VALUES
(
    'iPhone 13 Pro Max',
    55000,
    3,
    'https://www.mxphone.com/wp-content/uploads/2021/04/41117-79579-210401-iPhone12ProMax-xl-1200x675.jpg',
    1,
    '2021-11-22T00:00:00',
    '2021-11-22T00:00:00'
),
(
    'iPad Pro 2021',
    18500,
    10,
    'https://cdn.siamphone.com/spec/apple/images/ipad_pro_12.9%E2%80%91inch/com_1.jpg',
    2,
    '2021-11-20T00:00:00',
    '2021-11-20T00:00:00'
),
(
    'Airpods Pro',
    12500,
    5,
    'https://www.avtechguide.com/wp-content/uploads/2020/11/leaked-apple-airpods-pro-generation2-info_01-800x445.jpg',
    3,
    '2021-11-10T10:30:00',
    '2021-11-12T10:30:00'
),
(
    'Macbook Pro M1',
    45000,
    10,
    'https://cdn.mos.cms.futurecdn.net/iYCQTPgBSdDmkYESfPkunh.jpg',
    4,
    '2021-11-15T10:30:00',
    '2021-11-15T10:30:00'
);