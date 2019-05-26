#!/usr/bin/env node

const fs = require('fs');
const path = require('path')
const yaml = require('js-yaml');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main() {
  const l = recFindByExt(`${process.cwd()}`,'yaml');
  try {
    let doc = yaml.safeLoad(fs.readFileSync(l[0], 'utf8'));
    let ext_file_list = recFindByExt(`${process.cwd()}`,'sql')

    let psql = `postgres://${encodeURIComponent(doc.db.user)}:${encodeURIComponent(doc.db.password)}@${encodeURIComponent(doc.db.host)}:${doc.db.port}/${encodeURIComponent(doc.db.database)}`;
    console.log('drop schema public')
    await exec(`psql ${psql} -c 'DROP SCHEMA "public" CASCADE'`)
    await exec(`psql ${psql} -c 'CREATE SCHEMA public'`)
    await exec(`psql ${psql} -c 'GRANT ALL ON SCHEMA public TO "${doc.db.user}" WITH GRANT OPTION'`)

    if(ext_file_list.length > 0) {
      for (let i = 0;i < ext_file_list.length;i++) {
        await exec(`psql ${psql} -f '${ext_file_list[i]}'`)
      }
    }
    
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

