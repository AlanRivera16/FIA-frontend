import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';
import { LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BehaviorSubject, Observable } from 'rxjs';

const IMAGE_DIR = 'asesores/imgs';
const IMAGE_DIRS = {
  asesor: 'asesores/imgs',
  cliente: 'clientes/imgs'
};

export interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private imagesSubject = new BehaviorSubject<LocalFile[]>([]);
  private imagesClientesSubject = new BehaviorSubject<LocalFile[]>([]);
  public images$: Observable<LocalFile[]> = this.imagesSubject.asObservable();
  public imagesClientes$: Observable<LocalFile[]> = this.imagesClientesSubject.asObservable();

  local_url = 'http://localhost:3000';
  api_prod = 'https://fia-backend-production.up.railway.app';
  mySessionStorage : Storage | null = null;

  //url:any = '';
  images: LocalFile[] = [];
  imagesClientes: LocalFile[] = [];


  constructor(
    public http: HttpClient,
    private storage: Storage,
    private platform:Platform,
    private loadingCtrl: LoadingController
  ) { 
    this.init() 
  }


  login(credenciales:{}){
    return this.http.patch(`${this.api_prod}/login`, credenciales)
  }

  async loadFiles() {
    this.images = [];
    try {
      const result = await Filesystem.readdir({
        path: IMAGE_DIR,
        directory: Directory.Data,
      });

      await this.loadFileData(result.files.map((x: any) => x.name));
      this.imagesSubject.next(this.images); // Emitir el cambio
    } catch (err) {
      await Filesystem.mkdir({
        path: IMAGE_DIR,
        directory: Directory.Data,
        recursive: true,
      });
      console.log('Error encontrado con LocalFile' ,err)
    }
  }

  async loadFilesEntity(tipo: 'asesor' | 'cliente') {
    const dir = IMAGE_DIRS[tipo];
    const arr = tipo === 'asesor' ? this.images : this.imagesClientes;
    const subject = tipo === 'asesor' ? this.imagesSubject : this.imagesClientesSubject;
    arr.length = 0;
    try {
      const result = await Filesystem.readdir({
        path: dir,
        directory: Directory.Data,
      });
      for (let f of result.files.map((x: any) => x.name)) {
        const filePath = `${dir}/${f}`;
        const readFile = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Data,
        });
        arr.push({
          name: f,
          path: filePath,
          data: `data:image/jpeg;base64,${readFile.data}`
        });
      }
      subject.next(arr);
    } catch (err) {
      await Filesystem.mkdir({
        path: dir,
        directory: Directory.Data,
        recursive: true,
      });
      console.log(`Error encontrado con LocalFile ${tipo}`, err);
    }
  }

  async loadFileData(fileNames: string[]){
    for (let f of fileNames){
      const filePath = `${IMAGE_DIR}/${f}`

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`
      });     
      
      console.log(this.images)
    }
  }

  async takePicture(fileName:string, tipo: 'asesor' | 'cliente') {
    if (fileName === 'foto-perfil') {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        width: 600,
        height: 600,
      });
      if(image){
        await this.saveImageEntity(image, fileName, tipo);
      }
    } else {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        correctOrientation: true,
        width: 100,
        height: 100,
      });

      if (image) {
        await this.saveImageEntity(image, fileName, tipo);
      }
    }
  };
  
  async selectPicture(fileName:string, tipo: 'asesor' | 'cliente') {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    if (image) {
      await this.saveImageEntity(image, fileName, tipo)
    }

  }

  // Actualiza el método saveImage para emitir cambios
  async saveImage(photo: Photo, nombreArchivo: string) {
    try {
      let base64Data = await this.readAsBase64(photo);

      // Si base64Data ya es un DataURL, extrae solo la parte base64
      if (base64Data.startsWith('data:')) {
        base64Data = base64Data.split(',')[1];
      }

      const fileName = nombreArchivo + '.jpeg';
      const filePath = `${IMAGE_DIR}/${fileName}`;

      // Guardar la imagen en el sistema de archivos
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data,
      });

      // Agregar directamente al array `images`
      this.images.push({
        name: fileName,
        path: filePath,
        data: `data:image/jpeg;base64,${base64Data}`,
      });

      // Emitir el cambio
      this.imagesSubject.next(this.images);

      console.log('Imagen guardada y agregada al array:', fileName);
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
    }
  }
  
  async saveImageEntity(photo: Photo, nombreArchivo: string, tipo: 'asesor' | 'cliente') {
    try {
      let base64Data = await this.readAsBase64(photo);
      if (base64Data.startsWith('data:')) {
        base64Data = base64Data.split(',')[1];
      }
      const fileName = nombreArchivo + '.jpeg';
      const filePath = `${IMAGE_DIRS[tipo]}/${fileName}`;
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Data,
      });

      const fileObj: LocalFile = {
        name: fileName,
        path: filePath,
        data: `data:image/jpeg;base64,${base64Data}`,
      };

      if (tipo === 'asesor') {
        this.images.push(fileObj);
        this.imagesSubject.next(this.images);
      } else {
        this.imagesClientes.push(fileObj);
        this.imagesClientesSubject.next(this.imagesClientes);
      }
      console.log(`Imagen guardada para ${tipo}:`, fileName);
    } catch (error) {
      console.error(`Error al guardar la imagen para ${tipo}:`, error);
    }
  }

  async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path || ''
      });
  
      return file.data;
      
    }
    else {
      const response = await fetch(photo.webPath ?? '');
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob:Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async deleteImage(file: LocalFile){
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();
  }
  async deleteImageEntity(file: LocalFile, tipo: 'asesor' | 'cliente') {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    await this.loadFilesEntity(tipo);
  }
  async deleteFolder(imagenes: LocalFile[], tipo: 'asesor' | 'cliente') {
    await Promise.all(imagenes.map(file => this.deleteImageEntity(file, tipo)));
  }


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
