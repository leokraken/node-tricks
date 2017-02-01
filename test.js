const _ = require('lodash');

function rare(o){
   // emulates complex function
   console.log('exec');
   return o.a + o.b;
}

let mem = _.memoize(rare);

let obj = {a:1, b:2};
console.log(mem(obj));


console.log(mem(obj));

console.log(mem.cache)
