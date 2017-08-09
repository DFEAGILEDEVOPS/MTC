export class Config {
  private _questionTime: number;
  private _loadingTime: number;


  get questionTime(): number {
    return this._questionTime;
  }

  set questionTime(value: number) {
    this._questionTime = value;
  }

  get loadingTime(): number {
    return this._loadingTime;
  }

  set loadingTime(value: number) {
    this._loadingTime = value;
  }
}
