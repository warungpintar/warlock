import { Request } from 'express';
import event from '../cli/event';
import { createLogger, format, transports } from 'winston';

export interface RestEvent {
  url: string;
  statusCode: number;
  method: string;
  data: any;
  timestamp: Date;
}

export const logger = createLogger({
  level: 'info',
  format: format.prettyPrint(),
  transports: [
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

export const debugable = (req: Request, data: any) => {
  event.emit('show', {
    url: req.url,
    status: req.statusCode,
    method: req.method,
    timestamp: new Date(),
    data,
  });
};
