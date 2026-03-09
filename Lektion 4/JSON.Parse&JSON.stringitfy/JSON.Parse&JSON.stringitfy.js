const obj = { color: "red", speed: 50.2 };

const json = JSON.stringify(obj);
// json == '{"color":"red","speed":50.2}'

const obj2 = JSON.parse(json);
// obj === obj2 // false, because obj2 is a new object

console.log(obj2.color); // "red"
console.log(obj2.speed); // 50.2
