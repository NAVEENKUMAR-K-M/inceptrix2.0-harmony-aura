// Firebase options for the Operator App.
// Reuses the same project credentials as the Supervisor app.

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
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
    appId: '1:1099284862292:web:32df553d5c4edc800ca4c1',
    messagingSenderId: '1099284862292',
    projectId: 'harmony-aura',
    databaseURL: 'https://harmony-aura-default-rtdb.firebaseio.com',
    storageBucket: 'harmony-aura.firebasestorage.app',
  );
}
