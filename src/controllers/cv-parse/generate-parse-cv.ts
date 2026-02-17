import { controller } from '@config/controller/controller';
import { cvParseService } from '@services/index';
import { Request, Response } from 'express';

export const generateParseCvHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const files = req.files;
    if (files) body.files = files;

    const page = await cvParseService.generateParseCv(body);

    res.send(page);
  },
);
