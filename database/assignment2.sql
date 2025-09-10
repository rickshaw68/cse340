-- Assignment 2 SQL Scripts

-- Query 1: Insert Tony Stark into the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starknet.com', 'Iam1ronM@n');

-- Query 2: Change Tony Stark's account type to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starknet.com';

-- Query 3: Delete the Tony Stark record from the database
DELETE FROM public.account
WHERE account_email = 'tony@starknet.com';

-- Query 4: Modify the "GM Hummer" record
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model ='Hummer';

-- Query 5: Use an inner join to select the make and model fields from the inventory table 
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'sport';

-- Query 6: Update all records in the inventory table to add "/vehicles" to the middle of the file path
UPDATE public.inventory
SET
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
