// Contenido original de Impulso Real — sin modificar, solo reubicado.
// Nota de refactor: test() ahora recibe (pct, count) como parámetros
// explícitos en vez de leer funciones globales, porque los módulos ES6
// no comparten scope implícito. La lógica de cada logro es idéntica.
export const ACHIEVEMENTS = [
  {id:'first', icon:'i-flag', color:'#0B5D50', name:'Primer paso', desc:'Completa tu primer módulo', test:(pct,count)=>count>=1},
  {id:'quarter', icon:'i-chart', color:'#1B4F72', name:'25% del camino', desc:'Completa el 25% del programa', test:(pct,count)=>pct>=25},
  {id:'half', icon:'i-target', color:'#6B4C9A', name:'A mitad de ruta', desc:'Completa el 50% del programa', test:(pct,count)=>pct>=50},
  {id:'threequarter', icon:'i-chart', color:'#D9552C', name:'Recta final', desc:'Completa el 75% del programa', test:(pct,count)=>pct>=75},
  {id:'all', icon:'i-award', color:'#C9932E', name:'Programa completo', desc:'Termina los 17 módulos', test:(pct,count)=>pct>=100},
];
