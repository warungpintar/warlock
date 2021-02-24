import { RequestHandler } from 'express';
import axios, { Method } from 'axios';

const igoredHeaders = ['transfer-encoding'];
const instance = axios.create();

const coreMiddleware = (url: URL): RequestHandler => async (req, res, next) => {
  try {
    const proxyRes = await instance.request({
      baseURL: url.origin,
      url: url.pathname,
      method: req.method as Method,
      headers: {
        ...req.headers,
        // @TODO use proper encoding
        'Accept-Encoding': 'deflate',
        host: url.host,
      },
      data: req.body,
    });

    // pipe headers
    Object.keys(proxyRes.headers).forEach((headerName) => {
      if (!igoredHeaders.includes(headerName)) {
        res.setHeader(headerName, proxyRes.headers[headerName]);
      }
    });

    res.status(proxyRes.status);
    res.locals = proxyRes.data;
  } catch {
  } finally {
    next();
  }
};

export default coreMiddleware;
