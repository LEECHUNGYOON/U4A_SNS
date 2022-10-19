# u4a_sns
 U4A SNS

# interface parameter structure
{
	"TITLE": "",    //제목 
	"TYPE" : "",    //문서 유형
	"DESC" : "",    //내역 
	"IMAGE": {
		"URL" :"",   //대표 이미지 URL
		"T_URL":[],  //서브 이미지 URL 
		"DATA": ""   //대표 이미지 Data (Base64)
	},
	"VIDEO": {
		"URL"  :"",   //동영상 URL 
		"FPATH": ""   //동영상 Data 
	},
	"HASHTAG" : []  //해시태그
};