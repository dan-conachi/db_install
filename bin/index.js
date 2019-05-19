#!/usr/bin/env node
console.log('hi');

const program = require('commander');
const glob = require('glob');

glob(__dirname + '*.yaml', {}, (err, files)=>{
  console.log(files)
})