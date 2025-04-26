import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, Platform } from '@ionic/angular';
//import { Directory, Filesystem } from '@capacitor/filesystem';

const IMAGE_DIR = 'asesores/imgs';

export interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  local_url = 'http://localhost:3000';
  mySessionStorage : Storage | null = null;

  url:any = '';
  images: LocalFile[] = [];


  constructor(
    public http: HttpClient,
    private storage: Storage,
    private platform:Platform,
    private loadingCtrl: LoadingController
  ) { 
    this.init() 
  }


  login(credenciales:{}){
    return this.http.patch(`${this.local_url}/login`, credenciales)
  }

  // async loadFiles(){
  //   this.images = [];

  
  //   const loading = await this.loadingCtrl.create({
  //     message: "Cargando los datos..."
  //   })
  //   await loading.present();

  //   Filesystem.readdir({
  //     directory:Directory.Data,
  //     path: IMAGE_DIR
  //   }).then((result:any) => {
  //     this.loadFileData(result.files);
  //   }, async err => {
  //     await Filesystem.mkdir({
  //       directory:Directory.Data,
  //       path:IMAGE_DIR
  //     });
  //   }).then(_ =>{
  //     loading.dismiss();
  //   })
  // }

  // async loadFileData(fileNames: string[]){
  //   for (let f of fileNames){
  //     const filePath = `${IMAGE_DIR}/${f}`

  //     const readFile = await Filesystem.readFile({
  //       directory: Directory.Data,
  //       path: filePath
  //     });

  //     this.images.push({
  //       name: f,
  //       path: filePath,
  //       data: `data:image/jpg;base64,${readFile.data}`
  //     });     
      
      
  //   }
  // }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });
  
    var imageUrl = image.webPath;
  
    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
    console.log(imageUrl)
    if(image){
      //this.saveImage(image);

      //this.loadFiles(); //Los parámetros se vuelven a pasar 

    }
  };

  // async saveImage(photo: Photo){
  //   const base64Data = await this.readAsBase64(photo);

  //   const fileName = new Date().getTime() + '.jpg'
  //   const savedFile = await Filesystem.writeFile({
  //     directory: Directory.Data,
  //     path: `${IMAGE_DIR}/${fileName}`,
  //     data: base64Data
  //   });
  // }

  async selectPicture(){
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    var imageUrl = image.webPath;
  
    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
    console.log(imageUrl)
  }

  // async readAsBase64(photo: Photo) {
  //   if (this.platform.is('hybrid')) {
  //     const file = await Filesystem.readFile({
  //       path: photo.path || ''
  //     });
  
  //     return file.data;
      
  //   }
  //   else {
  //     const response = await fetch(photo.webPath ?? '');
  //     const blob = await response.blob();
  
  //     return await this.convertBlobToBase64(blob) as string;
  //   }
  // }

  convertBlobToBase64 = (blob:Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

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
