import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Camera, CameraResultType } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  local_url = 'http://localhost:3000';
  mySessionStorage : Storage | null = null;


  constructor(
    public http: HttpClient,
    private storage: Storage
  ) { 
    this.init() 
  }


  login(credenciales:{}){
    return this.http.patch(`${this.local_url}/login`, credenciales)
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });
  
    var imageUrl = image.webPath;
  
    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
    console.log(imageUrl)
  };

  //------------------- METODOS PARA STORAGE -------------------------
  init(){
    this.storage.create();
  }

  getData(keyStorageVariable:string) {
    return this.storage.get(keyStorageVariable) || [];
  }

  async addData(keyStorageVariable:string, item:any){
    return this.storage.set(keyStorageVariable, item)
  }

  async removeData(keyStorageVariable:string){
    return this.storage.remove(keyStorageVariable) || [];
  }

  public setItem(key: string, value: any) {
    this.mySessionStorage?.set(key, value);
  }

  public async getItem(key: string) {
    await this.storage.get(key)
  }
  //------------------------------------------------------------------
}
