//loads text data
str = require ("./tynData.js")
superagent = require ('superagent');
nlu = require('./nlu.js');
// import DiscoveryV1 from 

//returns patterns that matche 6 digit csi code and document header
var csiPattern = /([\n][\d]{2}[\s][\d]{2}[\s][\d]{2})/gm;
// var headerPattern = /IFS Design Guide Appendix \| Rough Draft\s*\w*\s*\d*\s*\d*\s*/gm
var headerPattern = /[\w]*[\s]*[\d]*[\s]*IFS Design Guide Appendix \| Rough Draft\s*\w*\s*\d*\s*\d*\s*[\w]*[\s]*[\d]*[\s]*[\d]*/gm
var divisionHeading = /(DIVISION[\s]*[\d]*([\s]*[A-Z]*)*[\s])/gm


//returns array of all csi codes in ifs
// var result = str.match(regex);

//splits array with pattern, keeps pattern elements in returned text
words = str.split(csiPattern);

//remove first element from text array (intro paragraph)
words = words.slice(1);

//clean up and distribute content into datastore
data = []

for (i=0;i<words.length;i=i+2){
    
    var text = words[i+1].slice(1).split("\n")
    var body = text.slice(1).join(" ").split(headerPattern).join("")
    
    words[i] = words[i].slice(1); 
    data.push({
        csi: words[i],
        l1: words[i].slice(0,2),
        l2: words[i].slice(3,5),
        l3: words[i].slice(6),
        title: text[0],
        body: body
    })
    heading = GetHeadings(body, divisionHeading)
    if (heading){
        data.push(heading);
    }


}

function GetHeadings (body, divisionHeading ){
    if (divisionHeading.test(body)){
        bodySplit = body.split(divisionHeading);
        body = bodySplit[0]
        var headingArr = bodySplit.slice(1)
        return headingArr;
    }
}

// nlu.init(data, superagent);



console.log(data)
