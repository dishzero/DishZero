import React from 'react';
import './App.css';

import { useDispatch, useSelector } from 'react-redux';

import {selectUserEmail, setActiveUser, setLogOutState} from './features/userSlice';
import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';


function Login() {

  const dispatch = useDispatch();

  // a selector to access or read the userEmail state
  const userEmail = useSelector(selectUserEmail);


  // fired on button click while the user is not signed in.
  // the userEmail state is set (or "dispatched") after getting it from "credentials".
  const handleSignIn = () => {
    signInWithPopup(auth, provider)
    .then((credentials) => {
      if (!credentials.user.email?.match('@ualberta.ca')) {
        auth.currentUser?.delete();
        alert('Cannot login with a non-ualberta account')
      } else {
        dispatch(setActiveUser({
          userEmail: credentials.user.email
        }))
      }
    })
    .catch((err) => {
      alert(err.message)
    })
  }

  // sets logOutState (basically userEmail = null) or "dispatches" a null value to the userEmail state.
  const handleSignOut = () => {
    auth.signOut()
    .then(() => {
      dispatch(setLogOutState())
      alert('User signed out')
    })
  }

  return (
    <div style={{ paddingBottom: 100, paddingTop: 100 }}>
      <div style = {{textAlign:"center"}}>
      <img src="https://image.shutterstock.com/image-vector/plate-vector-illustrationisolated-on-white-260nw-1815162875.jpg" ></img>
      <h1>DishZero</h1>
      <h2>Catch Phrase</h2>
      <h3>Don't have account? <a href="/SignUp">Sign up</a></h3>
      </div></div>
  );
}

export default Login;
