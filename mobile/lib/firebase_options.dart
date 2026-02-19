// File generated manually to bypass CLI login issues.
// Uses existing Web credentials from the frontend project.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI',
    appId: '1:1099284862292:web:32df553d5c4edc800ca4c1',
    messagingSenderId: '1099284862292',
    projectId: 'harmony-aura',
    authDomain: 'harmony-aura.firebaseapp.com',
    databaseURL: 'https://harmony-aura-default-rtdb.firebaseio.com',
    storageBucket: 'harmony-aura.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI',
    appId: '1:1099284862292:web:32df553d5c4edc800ca4c1', // Reusing Web App ID (Safe for RTDB)
    messagingSenderId: '1099284862292',
    projectId: 'harmony-aura',
    databaseURL: 'https://harmony-aura-default-rtdb.firebaseio.com',
    storageBucket: 'harmony-aura.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI',
    appId: '1:1099284862292:web:32df553d5c4edc800ca4c1',
    messagingSenderId: '1099284862292',
    projectId: 'harmony-aura',
    databaseURL: 'https://harmony-aura-default-rtdb.firebaseio.com',
    storageBucket: 'harmony-aura.firebasestorage.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI',
    appId: '1:1099284862292:web:32df553d5c4edc800ca4c1',
    messagingSenderId: '1099284862292',
    projectId: 'harmony-aura',
    databaseURL: 'https://harmony-aura-default-rtdb.firebaseio.com',
    storageBucket: 'harmony-aura.firebasestorage.app',
  );
}
