
// store.js
export const Store = {
  state: {
    config: {
      sheets: {
        calendario: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGjr-XdLSamHpGQfoORmLfntJbLd-UbFpD7NdMM14x2JdMhxOYHTWQBlhYCMDu0ZTy3AYS-1Y3q91Y/pub?gid=223681507&single=true&output=csv",
        llamadas: "", // opcional: CSV de historial de llamadas
      }
    },
    calendario: [], // filas crudas del CSV
    llamadas: [],   // opcional
  },
  listeners: new Set(),
  set(partial){
    Object.assign(this.state, partial);
    this.listeners.forEach(fn => fn(this.state));
  },
  on(fn){ this.listeners.add(fn); return ()=>this.listeners.delete(fn); }
};
