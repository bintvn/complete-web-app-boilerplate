import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';

const indexRoutes = Router();

indexRoutes.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome!',
  });
});

indexRoutes.get(
  '/openapi.json',
  (req: Request, res: Response, next: NextFunction) => {
    req.url = '/docs/openapi.json';
    const appHandler = req.app as unknown as {
      handle: (req: Request, res: Response, next: NextFunction) => void;
    };
    appHandler.handle(req, res, next);
  }
);

export default indexRoutes;
