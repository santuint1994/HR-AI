import { controller } from '@config/controller/controller';
import { cvParseService } from '@services/index';
import { Request, Response } from 'express';

export const createParseCvHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const files = req.files;
    if (files) body.files = files;

    const page = await cvParseService.createParseCv(body);

    res.send(page);
  },
);
