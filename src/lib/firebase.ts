import getConfig from 'next/config';

import firebase from 'firebase/app';
import 'firebase/messaging';
import localforage from 'localforage';

const {publicRuntimeConfig} = getConfig();

const firebaseCloudMessaging = {
  getToken: async (): Promise<string | null> => {
    return localforage.getItem('fcm_token');
  },

  removeToken: async (): Promise<void> => {
    await localforage.removeItem('fcm_token');
  },

  init: async function (): Promise<void | boolean> {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: publicRuntimeConfig.firebaseAPIKey,
        projectId: publicRuntimeConfig.firebaseProjectId,
        messagingSenderId: publicRuntimeConfig.firebaseMessagingSenderId,
        appId: publicRuntimeConfig.firebaseAppId,
      });
    }

    try {
      if ((await this.getToken()) !== null) {
        return false;
      }

      const messaging = firebase.messaging();

      await Notification.requestPermission();

      const token = await messaging.getToken();

      localforage.setItem('fcm_token', token);
    } catch (error) {
      console.error(error);
    }
  },

  onMessageListener: (callback: (payload: any) => void): void | null => {
    if (!firebase.apps.length) return null;

    const messaging = firebase.messaging();

    messaging.onMessage(
      (payload: any) => {
        callback(payload);
      },
      error => {
        console.error('onMessageListener error', error);
      },
    );
  },
};

export {firebaseCloudMessaging};
