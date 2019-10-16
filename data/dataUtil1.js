//loads text data
str = require ("./tynData.js")
superagent = require ('superagent');
const NaturalLanguageUnderstandingV1 = require ('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require ('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    authenticator: new IamAuthenticator({ apikey: 'Asrl_esdUauoAsbVmTG5KxM8BaiqCpBo2rpqY08XCSqN'}),
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
})

//returns patterns that matche 6 digit csi code and document header
var csiPattern = /([\n][\d]{2}[\s][\d]{2}[\s][\d]{2})/gm;
var headerPattern = /[\w]*[\s]*[\d]*[\s]*IFS Design Guide Appendix \| Rough Draft\s*\w*\s*\d*\s*\d*\s*[\w]*[\s]*[\d]*[\s]*[\d]*/gm
var divisionHeading = /(DIVISION[\s]*[\d]*(?:[\s]*[A-Z]*(?:,)?)*[\s])/gm

//returns array of all csi codes in ifs
// var result = str.match(regex);

//splits array with pattern, keeps pattern elements in returned text
words = str.split(csiPattern);

//remove first element from text array (intro paragraph)
words = words.slice(1);

//clean up and distribute content into datastore
data = []

for (i=0;i<words.length;i=i+2){
    if (i == 0){
        var header1 = words[i].slice(1).split("\n")
        var headerBod = header1.slice(1).join(" ").split(headerPattern).join("")
        heading1 = GetHeadings(headerBod, divisionHeading)
        if (heading1){
            data.push(heading1);
        }
    }
    
    var text = words[i+1].slice(1).split("\n")
    var body = text.slice(1).join(" ").split(headerPattern).join("")
    
    words[i] = words[i].slice(1); 
    data.push({
        type: "subcategory",
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

ElimCategoryText(data);

function ElimCategoryText(_data){
    for (var i=0; i<_data.length; i++){
        if (_data[i].type == "category"){
            bodySplit = _data[i-1].body.split(divisionHeading);
            _data[i-1] = bodySplit[0].trim();
            _word = _data[i].csi = _data[i+1].csi;
            _data[i].l1 = _word.slice(0,2)
            _data[i].l2 = _word.slice(3,5)
            _data[i].l3 = _word.slice(6)
        }
    }
}

function GetHeadings (body, _divisionHeading ){
    if (_divisionHeading.test(body)){
        bodySplit = body.split(_divisionHeading);
        body = bodySplit[0]
        var _text = bodySplit.slice(-1).join("")
        var headingArr = bodySplit.slice(1,-1).join("")
        if (_text.split(" ").length == 1){
            _text = "";
        }
        return {
            type: "category",
            csi: null,
            title: headingArr.trim(),
            body: _text
        };
    }
}

function GetKeywordRelevance(_text, num){
    var analyzeParams = {
        // 'url': 'www.nytimes.com',
        text: _text,
        'features': {
            'keywords': {
                'limit': num
            },
            'relations': {},
            'entities': {
                'limit': num,
                'mentions': true
            },
            'concepts': {
                'limit': num
            }
        }
    }

    naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
            console.log(JSON.stringify(analysisResults.result, null, 2))
            // AddNlpFeature(analysisResults.result);
            // return analysisResults.result;
        })
        .catch(err => {
            console.log('error', err);
        })
}

function AddNlpFeature(_analysisResults){
    nlpData = {};
    featureTypes = ["keywords", "entities", "concepts"]
    for (var i=0; i<featureTypes.length; i++){
        var nlpType = nlpData[featureTypes[i]] = []
        console.log(nlpType)
        var ft = featureTypes[i]
        for (var j=0; j<_analysisResults["keywords"]; j++){
        //     var featureItem = _analysisResults[featureTypes[i]][j];
        //     var tempObj = {
        //         text: featureItem.text,
        //         relevance: featureItem.relevance,
                
        //     }
        //     if (featureTypes[i] == "entities"){
        //         tempObj["type"] = featureItem.type
        //         tempObj["count"] = featureItem.count
        //         tempObj["mentions"] = []
        //         for(var k=0; k<featureItem.mentions.length; k++){
        //             tempObj["mentions"].push({
        //                 text: featureItem.mentions[k].text,
        //                 location: [featureItem.mentions[k].location[0], featureItem.mentions[k].location[1]],
        //                 confidence: featureItem.mentions[k].confidence
        //             })
        //         }
        //     }
        //     nlpType.push(tempObj)
        }
    }
    return nlpData;
}

for (var i=0; i<data.length; i++){
    if (data[i].csi == '08 71 00'){
        console.log(data[i].csi + '\n' + data[i].title + '\n' + data[i].body)
        GetKeywordRelevance(data[i].body, 3);
    }
    
}
// console.log(AddNlpFeature())
// console.log(data)
