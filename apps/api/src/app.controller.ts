import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response) {
    const webUrl = process.env.FRONTEND_URL || 'https://sony-social-web.onrender.com';
    return res.redirect(webUrl);
  }
}
