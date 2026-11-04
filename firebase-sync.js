import {firebaseConfig} from "./firebase-config.js";
const P = window.PB, V = "10.14.1", B = `https://www.gstatic.com/firebasejs/${V}/`;
if (firebaseConfig.apiKey.startsWith("YOUR_")) {
  P.setStatus("Cloud sync isn’t set up yet. Data is saved on this device only.");
} else {
  const {initializeApp} = await import(B + "firebase-app.js");
  const {getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} = await import(B + "firebase-auth.js");
  const {getFirestore, doc, getDoc, setDoc, serverTimestamp} = await import(B + "firebase-firestore.js");
  const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
  let uid = null, timer;
  const ref = () => doc(db, "users", uid);
  const push = () => setDoc(ref(), {data: JSON.stringify(P.get()), updated: serverTimestamp()})
    .then(() => P.setStatus("Synced")).catch(e => P.setStatus("Sync error: " + e.code));
  window.cloudToggle = () => uid ? signOut(auth)
    : signInWithPopup(auth, new GoogleAuthProvider()).catch(e => P.setStatus("Sign-in failed: " + e.code));
  window.onSaved = () => { if (!uid) return; clearTimeout(timer); timer = setTimeout(push, 1200); };
  onAuthStateChanged(auth, async u => {
    uid = u ? u.uid : null; P.user = u ? u.email : null;
    if (!u) return P.setStatus("Signed out. Data is saved on this device.");
    try {
      const snap = await getDoc(ref()), local = P.get();
      if (snap.exists()) {
        const cloud = JSON.parse(snap.data().data);
        if (local.tx.length && JSON.stringify(cloud) !== JSON.stringify(local) &&
            !confirm("Cloud data found. OK = use cloud data. Cancel = keep this device’s data and overwrite the cloud."))
          await push();
        else P.set(cloud);
      } else await push();
      P.setStatus("Synced as " + u.email);
    } catch (e) { P.setStatus("Sync error: " + e.code); }
  });
}
