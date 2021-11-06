DO
$$
BEGIN
	IF NOT EXISTS (
SELECT FROM pg_catalog.pg_roles WHERE rolname='boot_store_user'
) THEN
CREATE ROLE boot_store_user WITH SUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD '123456';
END IF;
END
$$;