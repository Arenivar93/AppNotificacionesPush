import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    /*{
      title: 'Titulo de la push',
      body: 'Este es el body del push',
      date: new Date()
    }*/
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor( private oneSignal: OneSignal,
               private storage: Storage) {

    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {

    this.oneSignal.startInit('c533f6eb-2f70-4793-97be-2d016bb1b715', '533791106590');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
    // do something when notification is received
    console.log('Notificacion recibida', noti);
    this.notificacionRecibida( noti );
    });

    this.oneSignal.handleNotificationOpened().subscribe( async ( noti ) => {
      // do something when a notification is opened
      console.log('Notificacion Abierta', noti );
      await this.notificacionRecibida( noti .notification );
    });

    // Obtener id del suscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();

  }

  async notificacionRecibida( noti: OSNotification ) {

    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID );

    if ( existePush ) {
      return;
    }
    this.mensajes.unshift( payload );
    this.pushListener.emit( payload );// sirve para estar emitiendo que cada vez que aya una notificacion avise
    await this.guardarMensajes();

  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes );
  }
  async cargarMensajes() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
