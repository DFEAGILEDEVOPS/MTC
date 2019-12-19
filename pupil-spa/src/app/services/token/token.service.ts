import { Injectable } from '@angular/core';
import { StorageService} from '../storage/storage.service';
import { TokensStorageKey } from '../storage/storageKey';

@Injectable()
export class TokenService {

  constructor(private storageService: StorageService) {
  }

  getToken(key) {
    const token = this.storageService.getItem(new TokensStorageKey());
    return token[key];
  }
}
