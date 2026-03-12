import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as authService from './auth.service.js';
export const login = asyncHandler(async (req, res) => res.json(await authService.login({ tenantId: req.tenant.id, email: req.body.email, password: req.body.password })));
export const me = asyncHandler(async (req, res) => res.json(await authService.me({ userId: req.auth.userId, tenantId: req.tenant.id })));
