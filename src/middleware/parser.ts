import { Router } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';

const forms = multer();

const router = Router();
router.use(forms.any());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

export const parserMiddleware = router;
