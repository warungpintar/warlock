interface IProcess {
  env: {
    NODE_ENV?: string,
    CACHE_AGE?: string
  }
}

declare var process: IProcess
