// local json files
declare module "*.json"
{
  const value: any
  export default value
}

export interface CommonLogger {
  info (msg: string): void
}
