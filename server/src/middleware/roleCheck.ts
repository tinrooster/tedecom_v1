import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const roleCheck = (allowedRoles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.role) {
                throw new Error();
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).send({ error: 'Access denied.' });
            }

            next();
        } catch (error) {
            res.status(401).send({ error: 'Please authenticate.' });
        }
    };
};

export default roleCheck; 