module.exports = function () {
  var charr = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z'
  ];
  let a = [];
  for(let i=0;i<3;i++) {
    a.push(parseInt(Math.random()*1000) % 9 + 1);
  }

  for(let i=0;i<3;i++) {
    a.push(parseInt(Math.random()*1000) % 90 + 10);
  }

  for(let i=0;i<3;i++) {
    a.push(parseInt(Math.random()*1000) % 900 + 100);
  }

  for(let i=0;i<3;i++) {
    a.push(parseInt(Math.random()*1000) % 10);
  }

  let tmp = '';
  for (let i=0;i<2;i++) {
    for(let k=0;k<5;k++) {
      tmp += charr[ parseInt(Math.random()*1000) % charr.length ];
    }
    a.push(tmp);
    tmp = '';
  }
  return a;
};
