#!/usr/bin/env node

const fs = require('fs');
const path = require('path')
const yaml = require('js-yaml');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main() {
  const l = process.argv.slice(2);
  console.log(`process.cwd() ${process.cwd()}`);

  try {
    let doc = yaml.safeLoad(fs.readFileSync(l[0], 'utf8'));
    let ext_file_list = recFindByExt(`${process.cwd()}`,'sql')

    if(ext_file_list.length > 0) {
      fs.readFile(ext_file_list[0], 'utf8', function(err, contents) {
        console.log(contents);
      });
    }

    let psql = `postgres://${encodeURIComponent(doc.db.user)}:${encodeURIComponent(doc.db.password)}@${encodeURIComponent(doc.db.host)}:${doc.db.port}/${encodeURIComponent(doc.db.database)}`;
    console.log(`psql ${psql}`)
    await exec(`psql ${psql} -c 'DROP SCHEMA "public" CASCADE'`)
    await exec(`psql ${psql} -c 'CREATE SCHEMA public'`)
    await exec(`psql ${psql} -c 'GRANT ALL ON SCHEMA public TO "${doc.db.user}" WITH GRANT OPTION'`)
    
  } catch (e) {
    console.log(e);
  }
  console.log('done');
}

function recFindByExt(base,ext,files,result) 
      {
          files = files || fs.readdirSync(base) 
          result = result || [] 
      
          files.forEach( 
              function (file) {
                  var newbase = path.join(base,file)
                  if ( fs.statSync(newbase).isDirectory() )
                  {
                      result = recFindByExt(newbase,ext,fs.readdirSync(newbase),result)
                  }
                  else
                  {
                      if ( file.substr(-1*(ext.length+1)) == '.' + ext )
                      {
                          result.push(newbase)
                      } 
                  }
              }
          )
          return result
      }

main()

