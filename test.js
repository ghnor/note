const YAML = require('yamljs');
const fs = require("fs");
// file为文件所在路径
const file = "./.settings.yml"
const data = YAML.parse(fs.readFileSync(file).toString());

const PATH = 'ghnor.github.io/source/_posts';

deleteall(PATH);

data.forEach(element => {
    let path = element.path;
    let title = element.title;
    console.log(path + "   " + title); 
    let indexHexo = path.lastIndexOf("/");
    if (indexHexo === -1) {
        indexHexo = path.lastIndexOf("\\");
    }
    if (indexHexo === -1) {
        indexHexo = path.lastIndexOf("\\\\");
    }
    let fileName = path.substr(indexHexo);
    fileName = fileName.replace(/\s*\-\s*/g, "-");
    fileName = fileName.replace(/\s+/g, "-");
    let pathHexo = PATH + fileName;
    console.log("pathHexo--->"+pathHexo);
    var hexoHeader = "---\n";
    hexoHeader += YAML.stringify(element);
    hexoHeader += "---\n\n";
    fs.writeFileSync(pathHexo, hexoHeader);
    var data = fs.readFileSync(path);
    fs.appendFileSync(pathHexo, data);
})

function deleteall(path) {
	var files = [];
	if(fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				deleteall(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		// fs.rmdirSync(path);
	}
};