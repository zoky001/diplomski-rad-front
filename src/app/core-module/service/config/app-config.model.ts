export interface IAppConfig {
  env: {
    name: string;
  };

  logging: {
    console: boolean;
    info: boolean;
    error: boolean;
    debug: boolean;
  };

  apiServer: string;
}
