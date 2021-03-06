import { v4 as uuid } from 'uuid';
import { internalErrorResponse } from '../helpers/helpers.js';
import { insertCart, queryOpenCart } from '../data/cartsTable.js';
import { queryProductById } from '../data/productsTable.js';
import validateUuid from '../validations/uuidValidation.js';
import validateProduct from '../validations/productValidation.js';
import auth from '../middlewares/auth.js';
import {
	insertCartProduct,
	getAllProductsInCart,
	removeProductFromCart,
	changeProductQuantity,
} from '../data/cartsProductsTable.js';

const route = '/cart';

async function getCart(req, res) {
	try {
		const { result, statusCode } = await auth(req, res);
		if (statusCode) {
			return res.sendStatus(statusCode);
		}

		const openCart = await queryOpenCart(result.rows[0].id);

		if (!openCart.rowCount) {
			return res.send([]);
		}
		const cartId = openCart.rows[0].id;
		const products = await getAllProductsInCart(cartId);
		return res.send(products.rows);
	} catch (error) {
		return internalErrorResponse(res, error);
	}
}

async function insertProduct(req, res) {
	try {
		const { result, statusCode } = await auth(req, res);
		if (statusCode) {
			return res.sendStatus(statusCode);
		}

		const bodyValidation = validateProduct(req.body);
		if (bodyValidation.error) {
			return res
				.status(400)
				.send(bodyValidation.error.details[0].message);
		}

		const productResult = await queryProductById(req.body.uuid);
		if (!productResult.rowCount) {
			return res.status(404).send(`Product doesn't exist`);
		}
		const productId = productResult.rows[0].real_id;
		const productPrice = productResult.rows[0].price;

		const openCart = await queryOpenCart(result.rows[0].id);
		let cartId;
		if (!openCart.rowCount) {
			const cart = {
				uuid: uuid(),
				user_id: result.rows[0].id,
				payment_date: null,
			};
			const cartInsertion = await insertCart(cart);
			cartId = cartInsertion.rows[0].id;
		} else {
			cartId = openCart.rows[0].id;
		}

		const productsInCart = await getAllProductsInCart(cartId);

		if (
			productsInCart.rows.some((product) => product.real_id === productId)
		) {
			return res.send();
		}
		const cartProduct = {
			cart_id: cartId,
			products_id: productId,
			product_quantity: req.body.quantity,
			product_price: productPrice,
			removed_at: null,
		};

		await insertCartProduct(cartProduct);
		return res.send();
	} catch (error) {
		return internalErrorResponse(res, error);
	}
}

async function deleteProductInCart(req, res) {
	const productUuid = req.params.id;

	try {
		const { result, statusCode } = await auth(req, res);
		if (statusCode) {
			return res.sendStatus(statusCode);
		}

		const bodyValidation = validateUuid(productUuid);
		if (bodyValidation.error) {
			return res
				.status(400)
				.send(bodyValidation.error.details[0].message);
		}

		const productResult = await queryProductById(productUuid);
		if (!productResult.rowCount) {
			return res.status(404).send(`Product doesn't exist`);
		}

		await removeProductFromCart(productResult.rows[0].real_id);
		const openCart = await queryOpenCart(result.rows[0].id);
		const cartId = openCart.rows[0].id;
		const products = await getAllProductsInCart(cartId);
		return res.send(products.rows);
	} catch (error) {
		return internalErrorResponse(res, error);
	}
}

async function updateQuantity(req, res) {
	try {
		const { result, statusCode } = await auth(req, res);
		if (statusCode) {
			return res.sendStatus(statusCode);
		}

		const bodyValidation = validateUuid(req.body.uuid);
		if (bodyValidation.error) {
			return res
				.status(400)
				.send(bodyValidation.error.details[0].message);
		}

		const productResult = await queryProductById(req.body.uuid);
		if (!productResult.rowCount) {
			return res.status(404).send(`Product doesn't exist`);
		}

		await changeProductQuantity(
			productResult.rows[0].real_id,
			req.body.quantity
		);
		const openCart = await queryOpenCart(result.rows[0].id);
		const cartId = openCart.rows[0].id;
		const products = await getAllProductsInCart(cartId);
		return res.send(products.rows);
	} catch (error) {
		return internalErrorResponse(res, error);
	}
}

const cart = {
	route,
	getCart,
	insertProduct,
	deleteProductInCart,
	updateQuantity,
};
export default cart;
