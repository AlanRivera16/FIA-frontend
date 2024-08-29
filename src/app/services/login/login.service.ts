import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Camera, CameraResultType } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  local_url = 'http://localhost:3000';


  constructor(
    public http: HttpClient
  ) { }


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


}
