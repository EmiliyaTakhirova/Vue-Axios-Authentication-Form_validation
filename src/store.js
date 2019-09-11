import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'

import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser(state, user) {
      state.user = user
    },
    clearAuthData(state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    setLogoutTimer({commit}, expirationTime){
      setTimeout(() => {
        commit('clearAuthData');
      }, expirationTime * 1000);
    },
    signup({ commit, dispatch }, authData) {

       // https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
       axios.post('accounts:signUp?key=AIzaSyA1sq8fuN8-Ybe_W1UpPq1PNM9GjkvMzv0', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log(res);

          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });

          // for Auto Login
          const now = new Date();
          const expirationDate = new Date (now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('storeUser', authData);
          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log('Sign Up:' + error));
    },
    login({commit, dispatch}, authData) {
      // https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
      axios.post('accounts:signInWithPassword?key=AIzaSyA1sq8fuN8-Ybe_W1UpPq1PNM9GjkvMzv0', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log(res);

          // for Auto Login
          const now = new Date();
          const expirationDate = new Date (now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          })

          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log('Login:' + error));
    },
    tryAutoLogin({commit}) {
      const token = localStorage.getItem('token');
      if(!token) {
        return
      }

      const expirationDate = localStorage.getItem('expirationDate');
      const now = new Date();
      if(now >= expirationDate) {
        return 
      }

      const userId = localStorage.getItem('userId');
      commit('authUser', {
        token: token,
        userId: userId
      })
    },
    logout({commit}) {
      commit('clearAuthData');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('expirationDate');
      router.replace('/signin');
    },
    storeUser({commit, state}, userData) {
      if(!state.idToken) {
        return
      }
      globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
        .then(res => console.log(res))
        .catch(error => console.log('Store User:' + error))
    },
    fetchUser({commit, state}) {
      if(!state.idToken) {
        return
      }
      globalAxios.get('/users.json' + '?auth=' + state.idToken)
        .then(res => {
          console.log(res);

          const data = res.data;
          const users = [];

          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }

          console.log(users);

          commit('storeUser', users[0]);
        })
        .catch(error => console.log('Fetch User:' + error));
    }
  },
  getters: {
    user(state) {
      return state.user
    },
    isAuthenticated(state) {
      return state.idToken !== null
    }
  }
})