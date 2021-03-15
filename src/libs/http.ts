/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Response } from 'express';
import cookie from 'cookie';

const ignoredHeaders = ['transfer-encoding', 'set-cookie'];

export const serializeCookies = (cookies: Record<string, string>) => {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
};

export const concatHeaders = (headers: Record<string, string | string[]>) => (
  res: Response,
) => {
  const cookies = headers['set-cookie'] as string[] | undefined;
  if (cookies) {
    const parsedCookies = cookies.map((item) => {
      const parsedCookie = cookie.parse(item);
      delete parsedCookie.domain;
      return serializeCookies(parsedCookie);
    });

    res.setHeader('set-cookie', parsedCookies);
  }

  Object.keys(headers).forEach((key) => {
    if (!ignoredHeaders.includes(key)) {
      res.setHeader(key, headers[key]);
    }
  });
};

export const mergeHeaders = (a: Record<string, string>) => (
  b: Record<string, string>,
) => {
  const obj = { ...a, ...b };
  Object.keys(obj).forEach((key) => {
    if (ignoredHeaders.includes(key)) {
      delete obj[key];
    }
  });
  return obj;
};
