import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';

export const isLoggedIn = async (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
	if (token) {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		req.user = decoded;
		return next();
	}
  return res.status(401).json(new ApiResponse(401, {
		authenticated: false,
	}, 'You are not logged in'));
};