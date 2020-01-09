import { Injectable } from '@angular/core';
import { StorageService} from '../storage/storage.service';

@Injectable()
export class TokenService {

  constructor(private storageService: StorageService) {
  }

  getToken(key) {
    const token = this.storageService.getToken();
    return token[key];
  }
}
