interface JwtConfig {
  accessToken: {
    secret: string;
    expiry: number;
  };
  key: {
    private: string;
    public: string;
  };
}

interface DbConfig {
  dialect: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  sync: boolean;
  secure: boolean;
}

export interface EnvironmentConfig {
  env: string;
  port: number;
  jwt: JwtConfig;
  db: DbConfig;
  passwordSalt: number;
  googleApiKey: string;
  geminiModel: string;
}
