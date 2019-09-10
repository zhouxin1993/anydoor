const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const config = require('../config/defaultConfig');

const tplPath = path.join(__dirname,'../template/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString())
module.exports = async function (req,res,filePath){
    try{
        const stats = await stat(filePath);
        if(stats.isFile()){
            res.statusCode = 200;
            res.setHeader('Content-Type','text/html');
            fs.createReadStream(filePath).pipe(res);
        }else if(stats.isDirectory()){
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type','text/html');
            fs.createReadStream(filePath).pipe(res);
            const dir = path.relative(config.root,filePath) //这个方法是取一个路径相对于另外一个路径的相对地址
            const data = { 
                files,
                title:path.basename(filePath),
                dir:  dir ? `/${dir}` : ''
            }
            res.end(template(data))
           
        }
    }catch(ex){
                console.error(ex);
                res.statusCode = 404;
                res.setHeader('Content-Type','text/html');
                res.end(`${filePath} is not a dir ${ex.tiString()}`);
                return ;
            
           
    }
}