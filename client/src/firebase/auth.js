import { auth } from "./firebase"
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword } from "firebase/auth"


export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // save this to firestore later 
    // result.user
    return result
}

export const doSignOut = () => {
    return auth.signOut()
}

//implement these later

// export const doPasswordReset = (email) => {
//     return sendPasswordResetEmail(auth, email)
// }

// export const doPasswordChange = (password) => {
//     return updatePassword(auth.currentUser, password)
// }

// export const doSendEmailVerification = () => {
//     return sendEmailVerification(auth.currentUser, {
//         url: `${window.location.origin}/home`
//     })
// }